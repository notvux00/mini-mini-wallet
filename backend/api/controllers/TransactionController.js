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
    }
}