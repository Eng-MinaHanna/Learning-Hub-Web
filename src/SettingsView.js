import React, { useState } from 'react';
import API from './api'; // ✅ استيراد السنترال بدل axios الخام

const SettingsView = ({ user, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        oldPassword: '',
        newPassword: ''
    });
    const [avatar, setAvatar] = useState(null);

    // ✅ تحديث رابط الصورة ليكون أونلاين بدل localhost
    const SERVER_URL = "https://learning-hub-et5.vercel.app";
    const [preview, setPreview] = useState(user.profile_pic ? `${SERVER_URL}/${user.profile_pic}` : null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('id', user.id);
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('oldPassword', formData.oldPassword);
        data.append('newPassword', formData.newPassword);
        data.append('phone', formData.phone);
        if (avatar) data.append('avatar', avatar);

        try {
            // ✅ سحب التوكن من التخزين المحلي
            const token = localStorage.getItem('ieee_token');

            // ✅ استخدام السنترال API مع إرسال التوكن في الـ Headers
            const res = await API.put('/user/update', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.status === "Success") {
                alert("✅ Profile Updated Successfully!");

                const updatedUser = {
                    ...user,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    profile_pic: res.data.newProfilePic || user.profile_pic
                };

                // تحديث البيانات في اللوكال ستوريج
                localStorage.setItem('ieee_user', JSON.stringify(updatedUser));
                onUpdateUser(updatedUser);

                setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
            } else {
                alert("❌ " + res.data.message);
            }
        } catch (err) {
            console.error("Update Error:", err);
            // عرض رسالة الخطأ القادمة من السيرفر إن وجدت
            const errorMsg = err.response?.data?.message || "Error updating profile";
            alert("❌ " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>⚙️ Account Settings</h2>

            <div style={styles.card}>
                <div style={styles.avatarSection}>
                    <div style={styles.imageWrapper}>
                        {preview ? (
                            <img src={preview} alt="Profile" style={styles.profileImg} />
                        ) : (
                            <div style={styles.placeholderAvatar}>{user.name?.charAt(0)}</div>
                        )}
                        <label style={styles.cameraIcon}>
                            📷
                            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                        </label>
                    </div>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '10px' }}>Click icon to change photo</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} style={styles.input} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input name="email" value={formData.email} onChange={handleChange} style={styles.input} type="email" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} style={styles.input} type="tel" />
                    </div>

                    <hr style={styles.divider} />
                    <h3 style={{ color: '#4facfe', margin: '10px 0 20px' }}>🔒 Change Password</h3>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Current Password</label>
                        <input
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            style={styles.input}
                            type="password"
                            placeholder="Type current password"
                            autoComplete="current-password"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            style={styles.input}
                            type="password"
                            placeholder="Enter new password"
                            autoComplete="new-password"
                        />
                    </div>

                    <button type="submit" style={styles.saveBtn} disabled={loading}>
                        {loading ? "Saving..." : "💾 Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' },
    header: { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '30px' },
    card: { backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '40px', flexWrap: 'wrap' },
    avatarSection: { flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' },
    imageWrapper: { position: 'relative', width: '150px', height: '150px' },
    profileImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #4facfe' },
    placeholderAvatar: { width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', fontWeight: 'bold', color: '#0f172a' },
    cameraIcon: { position: 'absolute', bottom: '5px', right: '5px', background: '#1e293b', padding: '8px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #4facfe', fontSize: '1.2rem' },
    form: { flex: 2, minWidth: '300px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', transition: '0.3s' },
    divider: { border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '30px 0' },
    saveBtn: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }
};

export default SettingsView;