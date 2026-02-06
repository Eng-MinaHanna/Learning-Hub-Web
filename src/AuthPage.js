import React, { useState } from 'react';
import axios from 'axios'; // ✅ استيراد مكتبة axios الأصلية

// ✅ تعريف السنترال (الرابط الرئيسي) بطريقة صحيحة كـ String
const API = axios.create({
    baseURL: 'https://learning-hub-et5.vercel.app/api',
    withCredentials: true // مهم عشان ملفات الـ Token والـ Cookies
});

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

        // الرابط النهائي هيكون baseURL + endpoint
        const endpoint = isLogin ? '/login' : '/register';

        try {
            // استخدام السنترال (API) اللي عرفناه فوق
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
            // لو ظهر Error هنا، غالباً هيكون بسبب الـ CORS في السيرفر
            alert("❌ Server Connection Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundGrid}></div>
            <div style={styles.glowingOrb}></div>

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

                    {isLogin && (
                        <div style={styles.forgotPass}>
                            Forgot Password?
                            <a
                                href={`https://wa.me/${ADMIN_WHATSAPP}?text=Hello Admin, I forgot my password for IEEE Portal.`}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.contactSupport}
                            >
                                Contact IT Support 💬
                            </a>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

// ... الـ Styles كما هي في الكود الأصلي
const styles = {
    container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', fontFamily: "'Cairo', 'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden' },
    backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.5, zIndex: 0 },
    glowingOrb: { position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(79,172,254,0.2) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' },
    authCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', width: '400px', border: '1px solid rgba(255,255,255,0.05)', zIndex: 10, position: 'relative' },
    logoBox: { width: '50px', height: '50px', backgroundColor: '#00629B', margin: '0 auto 15px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem', boxShadow: '0 0 20px rgba(0,98,155,0.5)' },
    title: { margin: '0 0 5px 0', color: 'white', fontSize: '1.8rem' },
    subtitle: { color: '#94a3b8', fontSize: '0.9rem', margin: 0 },
    toggleContainer: { display: 'flex', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '4px', marginBottom: '25px' },
    tab: { flex: 1, padding: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.95rem', borderRadius: '10px', transition: '0.3s' },
    activeTab: { flex: 1, padding: '10px', backgroundColor: '#1e293b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { position: 'relative' },
    input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: '0.3s' },
    select: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    secretInput: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eab308', backgroundColor: 'rgba(234, 179, 8, 0.05)', color: '#fde047', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    submitBtn: { padding: '15px', marginTop: '10px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 5px 20px rgba(79, 172, 254, 0.3)', transition: 'transform 0.2s' },
    forgotPass: { textAlign: 'center', marginTop: '15px', color: '#64748b', fontSize: '0.85rem' },
    contactSupport: { color: '#25D366', cursor: 'pointer', marginLeft: '5px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }
};

export default AuthPage;