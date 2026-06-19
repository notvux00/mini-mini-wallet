import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function History() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axiosClient.post('/transactions/history');

            if (response.data.err === 200) {
                setTransactions(response.data.data.transactions);
            } else {
                alert('Lỗi lấy lịch sử do không tìm thấy ví: ' + response.data.message);
                if (response.data.err === 4042) {
                    navigate('/login');
                }
            }
        } catch (error) {
            alert('Lỗi kết nối Backend');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span> Lịch sử giao dịch chi tiết </span>
                </h2>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ padding: '8px 16px', width: 'auto', margin: 0, color: 'var(--primary)' }}>
                    Quay lại Ví
                </button>
            </div>

            {isLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>Đang tải dữ liệu...</p>
            ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                    <p style={{ fontSize: '1.1rem' }}>Bạn chưa có giao dịch nào.</p>
                </div>
            ) : (
                <div style={{ overflowY: 'auto', maxHeight: '500px', paddingRight: '10px' }}>
                    {transactions.map((tx, index) => {
                        return (
                            <div key={index} className="history-tx-item">
                                <div className="history-tx-left">
                                    <div>
                                        <div className="history-tx-title">{tx.description || (tx.type === 'send' ? 'Chuyển tiền' : 'Nhận tiền')}</div>
                                        <div className="history-tx-id">Mã GD: {tx.id.substring(0, 8).toUpperCase()}...</div>
                                    </div>
                                </div>
                                <div className="history-tx-right">
                                    <div className="history-tx-amount" style={{ color: tx.type === 'send' ? '#ef4444' : '#10b981' }}>
                                        {tx.type === 'send' ? '-' : '+'}{tx.amount.toLocaleString('vi-VN')} đ
                                    </div>
                                    <div className="history-tx-time">
                                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default History;