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

            // Xác định loại giao dịch là Gửi hay Nhận
            const formattedTx = transactions.map(tx => {
                const isSender = tx.senderPocket === myPocket.id;
                const plainTx = typeof tx.toJSON === 'function' ? tx.toJSON() : tx;
                return {
                    ...plainTx,
                    type: isSender ? 'send' : 'receive'
                };
            });

            return res.ok({ transactions: formattedTx }, 'Lấy lịch sử giao dịch thành công!');

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
            // db có thể là Db object hoặc MongoClient tùy vào cấu hình, ta trích xuất client để dùng session
            const client = db.client || db; 
            const rawPocketCollection = db.collection(Pocket.tableName);
            const rawTransactionCollection = db.collection(Transaction.tableName || 'transaction');
            const ObjectId = require('mongodb').ObjectId; // Ép kiểu ID của MongoDB

            const session = client.startSession();

            try {
                session.startTransaction();

                // PHASE 1: TRỪ TIỀN NGƯỜI GỬI (Kèm điều kiện số dư)
                const senderUpdate = await rawPocketCollection.findOneAndUpdate(
                    {
                        _id: new ObjectId(senderPocket.id),
                        balance: { $gte: amount } // Điều kiện tối quan trọng: Số dư phải LỚN HƠN HOẶC BẰNG số tiền gửi
                    },
                    { $inc: { balance: -amount } }, // Trừ tiền (nguyên tử)
                    { returnDocument: 'after', session }
                );

                // Xử lý an toàn: Lấy kết quả trả về tương thích với mọi phiên bản MongoDB
                const updatedDoc = (senderUpdate && senderUpdate.value !== undefined) ? senderUpdate.value : senderUpdate;

                // Nếu updatedDoc là null, nghĩa là điều kiện balance >= amount không thỏa mãn (hoặc sai ID)
                if (!updatedDoc) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.error(sails.services.respcode.INSUFFICIENT_BALANCE, 'Số dư của bạn không đủ để thực hiện giao dịch!');
                }

                // PHASE 2: CỘNG TIỀN NGƯỜI NHẬN
                await rawPocketCollection.updateOne(
                    { _id: new ObjectId(receiverPocket.id) },
                    { $inc: { balance: amount } }, // Cộng tiền (nguyên tử)
                    { session }
                );

                // PHASE 3: GHI NHẬN LỊCH SỬ GIAO DỊCH
                const now = Date.now();
                await rawTransactionCollection.insertOne({
                    senderPocket: new ObjectId(senderPocket.id),
                    receiverPocket: new ObjectId(receiverPocket.id),
                    amount: amount,
                    description: description || 'Chuyển tiền',
                    createdAt: now,
                    updatedAt: now
                }, { session });

                await session.commitTransaction();
                session.endSession();

                return res.ok(null, 'Chuyển tiền thành công!');
            } catch (transactionErr) {
                await session.abortTransaction();
                session.endSession();
                sails.log.error('Lỗi giao dịch, đã Rollback an toàn:', transactionErr);
                return res.serverError(transactionErr, 'Hệ thống gián đoạn, giao dịch đã được hủy bỏ!');
            }
            return res.serverError(err);
        }
    }
}