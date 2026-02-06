import React, { useState } from 'react';
// ✅ بنستورد السنترال الجاهز من ملفه فقط
import API from './api';

const AuthPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const ADMIN_WHATSAPP = "201203006152";

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'student',
        secretKey: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // الرابط هيكون تلقائياً: baseURL + '/login'
        const endpoint = isLogin ? '/login' : '/register';

        try {
            // ✅ بنستخدم API المستورد مباشرة، هو "فاهم" الرابط الأونلاين لوحده
            const res = await API.post(endpoint, formData);

            if (res.data.status === "Success") {
                localStorage.setItem('ieee_token', res.data.token);
                localStorage.setItem('ieee_user', JSON.stringify(res.data.user));
                onLogin(res.data.user);
            } else {
                alert("⚠️ " + (res.data.message || "Something went wrong"));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server Connection Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        // باقي كود الـ JSX والـ Styles كما هو...
        <div style={styles.container}>
            {/* ... الكود اللي إنت كاتبه تمام ومفهوش مشاكل ... */}
            <div style={styles.authCard}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={styles.logoBox}>⚡</div>
                    <h1 style={styles.title}>IEEE <span style={{ color: '#4facfe' }}>ET5</span></h1>
                    <p style={styles.subtitle}>{isLogin ? 'Welcome Back!' : 'Join the Team'}</p>
                </div>

                <div style={styles.toggleContainer}>
                    <button onClick={() => setIsLogin(true)} style={isLogin ? styles.activeTab : styles.tab}>Login</button>
                    <button onClick={() => setIsLogin(false)} style={!isLogin ? styles.activeTab : styles.tab}>Register</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <>
                            <div style={styles.inputGroup}>
                                <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={styles.input} />
                            </div>
                            <div style={styles.inputGroup}>
                                <input type="tel" placeholder="Phone Number (WhatsApp)" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                            </div>
                            <div style={styles.inputGroup}>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={styles.select}>
                                    <option value="student">👨‍🎓 Student</option>
                                    <option value="instructor">👨‍🏫 Instructor</option>
                                    <option value="admin">🛡️ Admin</option>
                                </select>
                            </div>
                            {formData.role !== 'student' && (
                                <div style={styles.inputGroup}>
                                    <input type="password" placeholder={`Enter Secret Code`} required value={formData.secretKey} onChange={e => setFormData({ ...formData, secretKey: e.target.value })} style={styles.secretInput} />
                                </div>
                            )}
                        </>
                    )}

                    <div style={styles.inputGroup}>
                        <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} />
                    </div>

                    <div style={styles.inputGroup}>
                        <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={styles.input} />
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "Processing..." : (isLogin ? "Access Dashboard 🚀" : "Create Account ✨")}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ... الـ Styles (انسخها من الكود القديم بتاعك)
const styles = { /* ... */ };

export default AuthPage;