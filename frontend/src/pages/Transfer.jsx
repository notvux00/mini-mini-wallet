import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Transfer() {
    const [receiverPhone, setReceiverPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!receiverPhone || !amount) {
            return alert('Vui lòng nhập số điện thoại và số tiền!');
        }

        setIsLoading(true);
        try {
            const response = await axiosClient.post('/transaction/transfer', {
                receiverPhone: receiverPhone,
                amount: Number(amount), // Ép kiểu về số
                description: description
            });

            if (response.data.err === 200) {
                alert('Chuyển tiền thành công!');
                navigate('/history'); // Chuyển thẳng sang trang Lịch sử để xem luôn cho đã!
            } else {
                alert('Lỗi: ' + response.data.message);
                if (response.data.err === 401) navigate('/login');
            }
        } catch (error) {
            alert('Lỗi kết nối Backend');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ width: '400px' }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Chuyển tiền 💸</h2>

            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Số ĐT người nhận</label>
                    <input
                        type="text"
                        placeholder="VD: 0988888888"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Số tiền (VNĐ)</label>
                    <input
                        type="number"
                        placeholder="VD: 100000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        required
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Lời nhắn (Tùy chọn)</label>
                    <input
                        type="text"
                        placeholder="Chuyển tiền ăn sáng..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={isLoading} style={{ marginTop: '10px' }}>
                    {isLoading ? 'Đang giao dịch...' : 'Xác nhận Chuyển tiền'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary"
                >
                    Hủy / Quay lại
                </button>
            </form>
        </div>
    );
}

export default Transfer;