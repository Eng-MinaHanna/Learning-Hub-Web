import axios from 'axios';

// ✅ الطريقة الصح في ملف الإعدادات
const API = axios.create({
    baseURL: 'https://learning-hub-et5.vercel.app/api'
});
// السطور اللي جاية دي "سحرية".. بتخلي التوكن يتبعت أوتوماتيك في كل طلب
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('ieee_token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;