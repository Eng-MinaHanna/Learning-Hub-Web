import React, { useState } from 'react';
import API from './api'; // ✅ استيراد السنترال

const AddActivity = ({ onAdd, currentUser }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'session',
        instructor: '',
        event_date: ''
    });
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (file) data.append('material', file);

        if (currentUser && currentUser.id) {
            data.append('user_id', currentUser.id);
        }

        try {
            // ✅ التعديل هنا: استخدمنا API وبدون الجزء المتكرر من الرابط
            await API.post('/activities/add', data);

            alert("تمت إضافة النشاط بنجاح! ✅");

            setFormData({
                title: '',
                description: '',
                type: 'session',
                instructor: '',
                event_date: ''
            });
            setFile(null);

            onAdd();
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الإضافة ❌");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>➕ Quick Add Activity</h3>
                <span style={styles.badge}>Admin Panel</span>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <input type="text" placeholder="Activity Title" required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <textarea placeholder="Description..." rows="3" required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={styles.input}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={styles.select}>
                            <option value="session">Session</option>
                            <option value="course">Course</option>
                            <option value="workshop">Workshop</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <input type="datetime-local" required
                            value={formData.event_date}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                            style={{ ...styles.input, colorScheme: 'dark' }}
                        />
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <input type="text" placeholder="Instructor Name" required
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        style={styles.input}
                    />
                </div>

                <div style={styles.fileUpload}>
                    <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '5px', display: 'block' }}>Upload Material (PDF/Image)</label>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ color: 'white', fontSize: '0.9rem' }} />
                </div>

                <button type="submit" style={styles.submitBtn}>
                    Publish Activity 🚀
                </button>
            </form>
        </div>
    );
};

// --- الـ Styles كما هي ---
const styles = {
    container: { backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '16px', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' },
    title: { margin: 0, color: 'white', fontSize: '1.2rem', background: 'linear-gradient(90deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    badge: { backgroundColor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid rgba(79, 172, 254, 0.2)' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { width: '100%' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: '0.3s' },
    select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1e293b', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    fileUpload: { border: '2px dashed rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)' },
    submitBtn: { padding: '12px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '5px', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)', transition: 'transform 0.2s' }
};

export default AddActivity;