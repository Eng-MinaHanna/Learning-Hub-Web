import axios from 'axios';

const API = axios.create({
    baseURL: 'https://learning-hub-et5.vercel.app/api'
});

// ✅ الكود ده بيضيف التوكن في "راس" كل طلب بتبعه للسيرفر
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('ieee_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;