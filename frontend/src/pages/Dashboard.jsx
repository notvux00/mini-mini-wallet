import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await axiosClient.post('/pocket/balance');

            if (response.data.err === 200) {
                setBalance(response.data.data.balance);
            } else {
                alert('Lỗi lấy số dư: ' + response.data.message);
                if (response.data.err === 401 || response.data.err === 4041) {
                    handleLogout();
                }
            }
        } catch (error) {
            alert('Lỗi kết nối Backend');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="glass-card" style={{ textAlign: 'center', width: '380px' }}>
            <h3 style={{ marginBottom: '15px' }}>Ví Của Bạn</h3>

            {isLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu...</p>
            ) : (
                <div className="balance-display">
                    <p>Số dư hiện tại</p>
                    <h1>{balance.toLocaleString('vi-VN')} đ</h1>
                </div>
            )}

            <button onClick={handleLogout} className="danger">
                Đăng xuất khỏi ví
            </button>
        </div>
    );
}

export default Dashboard;