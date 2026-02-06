import axios from 'axios';

const API = axios.create({
    // رابط الباك إند بتاعك على فيرسيل
    baseURL: 'https://learning-hub-et5.vercel.app/api'
});

// ✅ Interceptor: بيضيف التوكن أوتوماتيك في كل "سلكة" طالعة للسيرفر
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('ieee_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
