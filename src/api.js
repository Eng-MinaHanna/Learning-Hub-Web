import axios from 'axios';

const API = axios.create({
    // ده رابط الباك إند (السيرفر) اللي رفعناه سوا
    baseURL: 'https://learning-hub-et5.vercel.app/api',
    withCredentials: true
});

export default API; // بنصدر المتغير ده عشان نستخدمه في أي صفحة ثانية