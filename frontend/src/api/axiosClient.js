import axios from 'axios';

// Khởi tạo một phiên bản axios với đường dẫn mặc định chĩa vào Backend
const axiosClient = axios.create({
    baseURL: 'http://localhost:1337/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động nhét Token vào mọi request gửi đi
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;