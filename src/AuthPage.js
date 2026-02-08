import React, { useState } from 'react';
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isLogin ? '/login' : '/register';

        try {
            const res = await API.post(endpoint, formData);

            if (res.data.status === "Success") {
                localStorage.setItem('ieee_token', res.data.token);
                localStorage.setItem('ieee_user', JSON.stringify(res.data.user));
                onLogin(res.data.user);
            } else {
                alert("⚠️ " + (res.data.message || "Invalid Credentials"));
            }
        } catch (err) {
            console.error(err);
            alert("❌ Connection Error: Please check your internet or server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.authCard}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={styles.logoBox}>⚡</div>
                    <h1 style={styles.title}>IEEE <span style={{ color: '#4facfe' }}>ET5</span></h1>
                    <p style={styles.subtitle}>{isLogin ? 'Welcome Back!' : 'Join the Team'}</p>
                </div>

                <div style={styles.toggleContainer}>
                    <button type="button" onClick={() => setIsLogin(true)} style={isLogin ? styles.activeTab : styles.tab}>Login</button>
                    <button type="button" onClick={() => setIsLogin(false)} style={!isLogin ? styles.activeTab : styles.tab}>Register</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {!isLogin && (
                        <>
                            <div style={styles.inputGroup}>
                                <input name="name" type="text" placeholder="Full Name" required value={formData.name} onChange={handleChange} style={styles.input} />
                            </div>
                            <div style={styles.inputGroup}>
                                <input name="phone" type="tel" placeholder="WhatsApp Number" required value={formData.phone} onChange={handleChange} style={styles.input} />
                            </div>
                            <div style={styles.inputGroup}>
                                <select name="role" value={formData.role} onChange={handleChange} style={styles.select}>
                                    <option value="student">👨‍🎓 Student</option>
                                    <option value="instructor">👨‍🏫 Instructor</option>
                                    <option value="admin">🛡️ Admin</option>
                                    {/* ❌ شيلنا خيار Company من هنا عشان التسجيل يبقى عن طريق الأدمن بس */}
                                </select>
                            </div>
                            {formData.role !== 'student' && (
                                <div style={styles.inputGroup}>
                                    <input name="secretKey" type="password" placeholder="Enter Secret Code" required value={formData.secretKey} onChange={handleChange} style={styles.secretInput} />
                                </div>
                            )}
                        </>
                    )}

                    <div style={styles.inputGroup}>
                        <input name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} style={styles.input} />
                    </div>

                    <div style={styles.inputGroup}>
                        <input name="password" type="password" placeholder="Password" required value={formData.password} onChange={handleChange} style={styles.input} />
                    </div>

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading ? "Please wait..." : (isLogin ? "Access Dashboard 🚀" : "Create Account ✨")}
                    </button>

                    {isLogin && (
                        <p style={styles.forgotPass}>
                            Forgot Password? <a href={`https://wa.me/${ADMIN_WHATSAPP}`} target="_blank" rel="noreferrer" style={{color: '#4facfe'}}>Contact Admin</a>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        fontFamily: "'Cairo', sans-serif",
        padding: '20px',
        position: 'relative',
        zIndex: 1
    },
    authCard: {
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(15px)',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        zIndex: 10
    },
    logoBox: {
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        margin: '0 auto 15px',
        boxShadow: '0 10px 20px rgba(79, 172, 254, 0.3)'
    },
    title: { color: 'white', margin: 0, fontSize: '1.8rem' },
    subtitle: { color: '#94a3b8', marginTop: '5px' },
    toggleContainer: {
        display: 'flex',
        background: 'rgba(0,0,0,0.2)',
        padding: '5px',
        borderRadius: '12px',
        marginBottom: '30px'
    },
    tab: {
        flex: 1,
        padding: '10px',
        border: 'none',
        background: 'none',
        color: '#94a3b8',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.3s'
    },
    activeTab: {
        flex: 1,
        padding: '10px',
        border: 'none',
        background: '#1e293b',
        color: '#4facfe',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
    },
    inputGroup: { marginBottom: '20px', position: 'relative' },
    input: {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: '0.3s',
        boxSizing: 'border-box'
    },
    select: {
        width: '100%',
        padding: '14px 16px',
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: 'white',
        cursor: 'pointer',
        outline: 'none'
    },
    secretInput: {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(79, 172, 254, 0.05)',
        border: '1px solid #4facfe',
        borderRadius: '12px',
        color: 'white',
        outline: 'none',
        boxSizing: 'border-box'
    },
    submitBtn: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
        border: 'none',
        borderRadius: '12px',
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '10px',
        transition: '0.3s',
        boxShadow: '0 10px 20px rgba(79, 172, 254, 0.2)'
    },
    forgotPass: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '0.9rem',
        color: '#94a3b8'
    }
};

export default AuthPage;
