import axios from 'axios';

const API = axios.create({
    // ده المكان الوحيد اللي هنغير فيه الرابط لما نرفع أونلاين
    baseURL: 'https://learning-hub-et5.vercel.app'
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