import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Register() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await axiosClient.post('/register', {
                phone: phone,
                password: password,
                fullName: fullName
            });

            if (response.data.err === 200) {
                alert('Đăng ký thành công và đã được cấp ví!');
                navigate('/login');
            } else {
                alert('Lỗi nghiệp vụ: ' + response.data.message);
            }
        } catch (error) {
            alert('Lỗi hệ thống Backend');
            console.error(error);
        }
    };

    return (
        <div className="glass-card">
            <h3>Mở tài khoản mới</h3>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Số điện thoại"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Đăng ký ngay</button>
            </form>

            <div className="link-text">
                Đã có tài khoản? <Link to="/login">Quay lại Đăng nhập</Link>
            </div>
        </div>
    );
}

export default Register;