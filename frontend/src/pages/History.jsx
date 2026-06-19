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
        <div className="card" style={{ width: '450px' }}>
            <h3 style={{ marginBottom: '20px' }}>Lịch sử giao dịch</h3>

            {isLoading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Đang tải dữ liệu...</p>
            ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    <p>Bạn chưa có giao dịch nào.</p>
                </div>
            ) : (
                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                    {transactions.map((tx, index) => {
                        // Tạm thời hiển thị thô các trường dữ liệu
                        return (
                            <div key={index} style={{
                                padding: '15px',
                                border: '1px solid var(--border-color)',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                marginBottom: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mã GD: {tx.id.substring(0, 8)}...</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(tx.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        Số tiền: {tx.amount.toLocaleString('vi-VN')} đ
                                    </span>
                                    {/* Ở bài Chuyển tiền ta sẽ làm logic xem đây là tiền cộng hay trừ sau */}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                    Nội dung: {tx.description || 'Không có nội dung'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                    Quay lại Ví
                </button>
            </div>
        </div>
    );
}

export default History;