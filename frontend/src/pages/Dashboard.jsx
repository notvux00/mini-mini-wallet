import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { RESP_CODE } from '../utils/respcode';

function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [recentTx, setRecentTx] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    // Lấy tên từ localStorage, nếu không có thì để mặc định
    const fullName = localStorage.getItem('fullName') || 'Bạn';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [balRes, txRes] = await Promise.all([
                axiosClient.post('/pocket/balance'),
                axiosClient.post('/transactions/history')
            ]);

            if (balRes.data.err === RESP_CODE.SUCCESS) {
                setBalance(balRes.data.data.balance);
            } else if (balRes.data.err === RESP_CODE.UNAUTHORIZED || balRes.data.err === RESP_CODE.PHONE_NOT_FOUND) {
                return handleLogout();
            }

            if (txRes.data.err === RESP_CODE.SUCCESS) {
                setRecentTx(txRes.data.data.transactions.slice(0, 5));
            }
        } catch (error) {
            console.error('Lỗi kết nối Backend', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        navigate('/login');
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Header chung */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', width: '100%' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Xin chào,</p>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>{fullName} </h3>
                </div>
                <button onClick={handleLogout} className="btn-ghost" style={{ padding: '8px 16px', width: 'auto', margin: 0, color: '#ef4444' }}>
                    Đăng xuất
                </button>
            </div>

            <div className="dashboard-grid">

                <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '30px' }}>
                    {isLoading ? (
                        <div className="balance-card" style={{ opacity: 0.7, margin: 0, flex: 1, minHeight: '180px' }}>
                            <p>Đang tải...</p>
                            <h1>-- <span>VNĐ</span></h1>
                        </div>
                    ) : (
                        <div className="balance-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '180px' }}>
                            <p>Số dư khả dụng</p>
                            <h1>{balance.toLocaleString('vi-VN')} <span>VNĐ</span></h1>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button onClick={() => navigate('/transfer')} className="btn-primary-large" style={{ marginTop: 0 }}>
                            Chuyển tiền
                        </button>
                        <button onClick={() => navigate('/history')} className="btn-secondary-large" style={{ marginTop: 0 }}>
                            Lịch sử
                        </button>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '30px' }}>
                    <div className="recent-header" style={{ marginTop: 0 }}>
                        <h4 style={{ fontSize: '1.2rem' }}>Giao dịch gần đây</h4>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/history'); }}>Xem tất cả</a>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '5px' }}>
                        {isLoading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Đang tải...</p>
                        ) : recentTx.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Chưa có giao dịch nào.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {recentTx.map((tx, idx) => (
                                    <div className="tx-item" key={idx} style={{ padding: '12px 0' }}>
                                        <div className="tx-info">
                                            <div className="tx-title">{tx.description || (tx.type === 'send' ? 'Chuyển tiền' : 'Nhận tiền')}</div>
                                            <div className="tx-time">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <div className="tx-amount" style={{ color: tx.type === 'send' ? '#ef4444' : '#10b981' }}>
                                            {tx.type === 'send' ? '-' : '+'}{tx.amount.toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;