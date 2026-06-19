module.exports = {
    getTransactionHistory: async (req, res) => {
        try {
            // Lấy ID của khách hàng
            const customerId = req.customerId;

            // Tìm ID của ví
            const myPocket = await Pocket.findOne({ customer: customerId });

            if (!myPocket) {
                return res.error(sails.services.respcode.POCKET_NOT_FOUND, 'Không tìm thấy ví!');
            }

            const transactions = await Transaction.find({
                where: {
                    or: [
                        { senderPocket: myPocket.id },
                        { receiverPocket: myPocket.id }
                    ]
                }
            }).sort('createdAt DESC');

            return res.ok({ transactions: transactions }, 'Lấy lịch sử giao dịch thành công!');

        } catch (err) {
            return res.serverError(err);
        }
    },

    transfer: async (req, res) => {
        try {
            const { receiverPhone, amount, description } = req.body;

            // Kiểm tra xem amount có bị trống hay không hợp hệ hay không
            if (!amount || amount <= 0 || !Number.isInteger(amount)) {
                return res.error(sails.services.respcode.INVALID_AMOUNT, 'Số tiền không hợp lệ!');
            }

            if (!receiverPhone) {
                return res.badRequest(null, 'Vui lòng nhập số điện thoại');
            }

            // Kiểm tra định dạng số điện thoại (Chỉ chứa số, độ dài từ 10-11 số)
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(receiverPhone)) {
                return res.badRequest(null, 'Định dạng số điện thoại không hợp lệ!');
            }

            // Lấy thông tin của người gửi
            const customerId = req.customerId;

            const sender = await Customer.findOne({ id: customerId });

            const senderPocket = await Pocket.findOne({ customer: customerId });

            // Lấy thông tin người nhận
            const receiver = await Customer.findOne({ phone: receiverPhone });

            if (!receiver) {
                return res.error(sails.services.respcode.RECEIVER_NOT_FOUND, 'Không tìm thấy người nhận!');
            }

            const receiverPocket = await Pocket.findOne({ customer: receiver.id });

            // Kiểm tra xem số điện thoại của người gửi có trùng với người nhận không
            if (sender.phone === receiver.phone) {
                return res.error(sails.services.respcode.CANNOT_TRANSFER_TO_SELF, 'Không thể tự chuyển tiền cho bản thân!');
            }

            // Logic cho chuyển tiền
            // 1. Lấy kết nối gốc (Native Driver) của MongoDB từ Sails
            const db = Pocket.getDatastore().manager;
            const rawPocketCollection = db.collection(Pocket.tableName);
            const ObjectId = require('mongodb').ObjectId; // Ép kiểu ID của MongoDB

            // PHASE 1: TRỪ TIỀN NGƯỜI GỬI (Kèm điều kiện số dư)
            // findOneAndUpdate sẽ khóa bản ghi lại trong tích tắc để xử lý
            const senderUpdate = await rawPocketCollection.findOneAndUpdate(
                {
                    _id: new ObjectId(senderPocket.id),
                    balance: { $gte: amount } // Điều kiện tối quan trọng: Số dư phải LỚN HƠN HOẶC BẰNG số tiền gửi
                },
                { $inc: { balance: -amount } }, // Trừ tiền (nguyên tử)
                { returnDocument: 'after' }
            );

            // Xử lý an toàn: Lấy kết quả trả về tương thích với mọi phiên bản MongoDB
            const updatedDoc = (senderUpdate && senderUpdate.value !== undefined) ? senderUpdate.value : senderUpdate;

            // Nếu updatedDoc là null, nghĩa là điều kiện balance >= amount không thỏa mãn (hoặc sai ID)
            if (!updatedDoc) {
                return res.error(sails.services.respcode.INSUFFICIENT_BALANCE, 'Số dư của bạn không đủ để thực hiện giao dịch!');
            }

            // PHASE 2: CỘNG TIỀN NGƯỜI NHẬN & MANUAL ROLLBACK
            try {
                await rawPocketCollection.updateOne(
                    { _id: new ObjectId(receiverPocket.id) },
                    { $inc: { balance: amount } } // Cộng tiền (nguyên tử)
                );
            } catch (phase2Error) {
                // CHẾ ĐỘ CỨU HỘ: NẾU CỘNG TIỀN BỊ LỖI -> HOÀN TIỀN LẠI CHO NGƯỜI GỬI (ROLLBACK)
                sails.log.error('Lỗi cộng tiền, đang tiến hành Rollback...', phase2Error);
                await rawPocketCollection.updateOne(
                    { _id: new ObjectId(senderPocket.id) },
                    { $inc: { balance: amount } }
                );
                return res.serverError(phase2Error, 'Hệ thống gián đoạn, tiền của bạn đã được hoàn lại!');
            }
            // PHASE 3: GHI NHẬN LỊCH SỬ GIAO DỊCH
            await Transaction.create({
                senderPocket: senderPocket.id,
                receiverPocket: receiverPocket.id,
                amount: amount,
                description: description || 'Chuyển tiền'
            });
            return res.ok(null, 'Chuyển tiền thành công!');
        } catch (err) {
            return res.serverError(err);
        }
    }
}