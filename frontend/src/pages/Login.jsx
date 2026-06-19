import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { RESP_CODE } from '../utils/respcode';

function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post('/login', { phone, password });

            if (response.data.err === RESP_CODE.SUCCESS) {
                const token = response.data.data.token;
                const fullName = response.data.data.customer?.fullName;
                localStorage.setItem('token', token);
                if (fullName) localStorage.setItem('fullName', fullName);

                navigate('/dashboard');
            } else {
                alert('Lỗi: ' + response.data.message);
            }
        } catch (error) {
            alert('Lỗi hệ thống Backend');
            console.error(error);
        }
    };

    return (
        <div className="card" style={{ width: '380px' }}>
            <h3>Đăng nhập</h3>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <input
                        type="text" placeholder="Số điện thoại"
                        value={phone} onChange={(e) => setPhone(e.target.value)} required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password" placeholder="Mật khẩu"
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                    />
                </div>
                <button type="submit">Đăng nhập ngay</button>
            </form>

            <div className="link-text">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
        </div>
    );
}

export default Login;