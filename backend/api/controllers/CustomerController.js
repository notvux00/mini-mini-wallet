// Import thư viện mã hóa mật khẩu
const bcrypt = require('bcryptjs');

module.exports = {
    register: async function (req, res) {
        try {
            const { phone, password, fullName } = req.body;

            // 1. Kiểm tra đầu vào
            if (!phone || !password || !fullName) {
                return res.badRequest(null, 'Vui lòng nhập đủ các trường thông tin');
            }

            // 2. Kiểm tra xem số điện thoại đã tồn tại chưa
            const existingCustomer = await Customer.findOne({ phone: phone });
            if (existingCustomer) {
                return res.error(400, 'Số điện thoại này đã được đăng ký!');
            }

            // 3. Mã hóa mật khẩu
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // 4. Tạo tài khoản khách hàng
            const newCustomer = await Customer.create({
                phone: phone,
                password: hashedPassword,
                fullName: fullName
            }).fetch(); // .fetch() để lấy dữ liệu trả về sau khi create

            // 5. Khởi tạo ví với số dư khởi tạo 1 000 000 VNĐ
            const newPocket = await Pocket.create({
                balance: 1000000,
                customer: newCustomer.id
            }).fetch();

            // 6. Trả về kết quả thành công
            return res.ok({
                customer: {
                    id: newCustomer.id,
                    phone: newCustomer.phone,
                    fullName: newCustomer.fullName
                },
                pocket: newPocket
            }, 'Đăng ký tài khoản và cấp ví thành công!');

        } catch (error) {
            // Trả về nếu lỗi hệ thống
            return res.serverError(error);
        }
    }
};