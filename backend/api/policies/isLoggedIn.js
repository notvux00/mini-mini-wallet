const jwt = require('jsonwebtoken');

module.exports = async function (req, res, proceed) {
    // Lấy token từ header của request
    let token = req.header('Authorization');

    if (!token) {
        return res.error(401, 'Bạn chưa đăng nhập!');
    }

    // Token thường có dạng "Bearer xyz123...". Ta cần cắt bỏ chữ Bearer đi
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();
    }

    // Giải mã token để kiểm tra tính hợp lệ
    jwt.verify(token, 'chac-ai-do-se-ve', async function (err, decoded) {
        if (err) {
            return res.error(401, 'Token không hợp lệ hoặc đã hết hạn!');
        }

        // Nếu hợp lệ, ta nhét id của user vào req để các controller phía sau sử dụng
        req.me = decoded.customerId;

        // Mời đi tiếp vào Controller
        return proceed();
    });
};