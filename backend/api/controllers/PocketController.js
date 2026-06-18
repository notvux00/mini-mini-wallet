module.exports = {
    getBalance: async function (req, res) {
        try {
            // Lấy customerId từ policy isLoggedIn.js
            const customerId = req.customerId;

            // Tìm ví thuộc về người dùng này
            const pocket = await Pocket.findOne({ customer: customerId });

            if (!pocket) {
                return res.error(4042, 'Không tìm thấy ví của bạn!');
            }

            // Trả về số dư
            return res.ok({
                balance: pocket.balance
            }, 'Lấy thông tin số dư thành công!');

        } catch (error) {
            return res.serverError(error);
        }
    }
};