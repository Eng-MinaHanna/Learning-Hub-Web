import React, { useState } from 'react';
import API from './api'; // ✅ تم الاستيراد من السنترال

const AddCourseModal = ({ onClose, onAdd, currentUser }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', type: 'course', instructor: '', event_date: new Date().toISOString().split('T')[0]
    });
    const [file, setFile] = useState(null);

   const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // ✅ إضافة البيانات النصية
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // ✅ التأكد من اسم الحقل 'material' ليتوافق مع السيرفر
    if (file) data.append('material', file);
    if (currentUser) data.append('user_id', currentUser.id);

    try {
        // ✅ إرسال الطلب مع التوكن والـ Content-Type الصحيح
        await API.post('/activities/add', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        alert("Success! Activity created on Cloud ☁️");
        onAdd();
        onClose();
    } catch (error) {
        console.error(error);
        alert("❌ Error: " + (error.response?.data?.message || "Something went wrong"));
    }
};

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ✨ Create New Activity
                    </h3>
                    <button onClick={onClose} style={styles.closeBtn}>✖</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Activity Title</label>
                        <input type="text" placeholder="Ex: Embedded Systems Track" required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={styles.input}>
                                <option value="course" style={{ color: 'black' }}>Course</option>
                                <option value="session" style={{ color: 'black' }}>Session</option>
                                <option value="workshop" style={{ color: 'black' }}>Workshop</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Instructor</label>
                            <input type="text" placeholder="Instructor Name" required
                                value={formData.instructor}
                                onChange={e => setFormData({ ...formData, instructor: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea placeholder="What will students learn?" rows="4" required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Start Date</label>
                        <input type="date" required
                            value={formData.event_date}
                            onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                            style={{ ...styles.input, colorScheme: 'dark' }}
                        />
                    </div>

                    <div style={styles.fileUpload}>
                        <label style={{ ...styles.label, marginBottom: '5px', display: 'block' }}>Cover Image (Optional)</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} style={{ color: '#aaa', fontSize: '0.9rem' }} />
                    </div>

                    <button type="submit" style={styles.submitBtn}>Create Activity 🚀</button>
                </form>
            </div>
        </div>
    );
};

// --- Modern Dark Tech Styles كما هي بدون تغيير ---
const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
    },
    modal: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        width: '500px', borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        animation: 'fadeIn 0.3s ease-in-out'
    },
    header: {
        padding: '20px 25px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.02)'
    },
    closeBtn: {
        background: 'none', border: 'none', color: '#aaa', fontSize: '1.2rem',
        cursor: 'pointer', transition: '0.2s', padding: '5px'
    },
    form: {
        display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px'
    },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: {
        padding: '12px', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        color: 'white', fontSize: '0.95rem', outline: 'none',
        transition: '0.3s',
        fontFamily: 'inherit'
    },
    fileUpload: {
        border: '2px dashed rgba(255,255,255,0.2)',
        padding: '15px', borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        transition: '0.3s'
    },
    submitBtn: {
        padding: '15px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#0f172a', border: 'none', borderRadius: '10px',
        fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
        marginTop: '10px', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
        transition: 'transform 0.2s'
    }
};

export default AddCourseModal;
