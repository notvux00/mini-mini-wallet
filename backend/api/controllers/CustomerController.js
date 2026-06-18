// Import thư viện mã hóa mật khẩu
const bcrypt = require('bcryptjs');

// Thêm thư viện JWT
const jwt = require('jsonwebtoken');

module.exports = {
    register: async function (req, res) {
        try {
            const { phone, password, fullName } = req.body;

            // Kiểm tra đầu vào
            if (!phone || !password || !fullName) {
                return res.badRequest(null, 'Vui lòng nhập đủ các trường thông tin');
            }

            // Kiểm tra xem số điện thoại đã tồn tại chưa
            const existingCustomer = await Customer.findOne({ phone: phone });
            if (existingCustomer) {
                return res.error(400, 'Số điện thoại này đã được đăng ký!');
            }

            // Mã hóa mật khẩu
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Tạo tài khoản khách hàng
            const newCustomer = await Customer.create({
                phone: phone,
                password: hashedPassword,
                fullName: fullName
            }).fetch(); // .fetch() để lấy dữ liệu trả về sau khi create

            // Khởi tạo ví với số dư khởi tạo 1 000 000 VNĐ
            const newPocket = await Pocket.create({
                balance: 1000000,
                customer: newCustomer.id
            }).fetch();

            // Trả về kết quả thành công
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
    },

    login: async function (req, res) {
        try {
            const { phone, password } = req.body;

            // Kiểm tra đầu vào
            if (!phone || !password) {
                return res.badRequest(null, 'Vui lòng nhập đủ các trường thông tin');
            }

            // Kiểm tra số điện thoại có tồn tại không
            const existingCustomer = await Customer.findOne({ phone: phone });
            if (!existingCustomer) {
                return res.error(400, 'Số điện thoại này chưa được đăng ký!');
            }

            // Kiểm tra mật khẩu có đúng không
            const isPasswordValid = bcrypt.compareSync(password, existingCustomer.password);
            if (!isPasswordValid) {
                return res.error(400, 'Mật khẩu không đúng!');
            }

            // Đăng nhập thành công -> Tạo token
            const token = jwt.sign(
                { customerId: existingCustomer.id }, // Payload (dữ liệu giấu trong thẻ)
                'chac-ai-do-se-ve',   // Secret Key (chìa khóa để giải mã)
                { expiresIn: '1d' }          // Thời hạn
            );

            // Trả về kết quả thành công
            return res.ok({
                token: token,
                customer: {
                    id: existingCustomer.id,
                    fullName: existingCustomer.fullName
                }
            }, 'Đăng nhập thành công!');

        } catch (error) {
            return res.serverError(error);
        }
    }
};