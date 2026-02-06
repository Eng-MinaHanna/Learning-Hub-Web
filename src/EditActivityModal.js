import React, { useState } from 'react';
import API from './api'; 

const EditActivityModal = ({ activity, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: activity.title,
        description: activity.description,
        instructor: activity.instructor,
        event_date: activity.event_date.split('T')[0] 
    });

    // ✅ حالة جديدة للصورة والمعاينة
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(activity.file_path || null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // عرض معاينة فورية
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // ✅ تحويل البيانات لـ FormData عشان الصورة تترفع للسحاب
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        if (file) {
            data.append('material', file); // 'material' هو نفس الاسم اللي السيرفر مستنيه
        }

        try {
            await API.put(`/activities/update/${activity.id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data' // تأمين مسار البيانات
                }
            });
            alert("Updated Successfully! ✨");
            onUpdate(); 
            onClose();  
        } catch (error) {
            console.error(error);
            alert("Error updating activity ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>✏️ Edit Activity</h3>
                    <button onClick={onClose} style={styles.closeBtn}>✖</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Activity Title</label>
                        <input type="text" value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea value={formData.description} rows="3"
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Instructor</label>
                            <input type="text" value={formData.instructor}
                                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Date</label>
                            <input type="date" value={formData.event_date}
                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                style={{ ...styles.input, colorScheme: 'dark' }}
                            />
                        </div>
                    </div>

                    {/* ✅ إضافة جزء تعديل الصورة */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Cover Image</label>
                        <div style={styles.imageEditContainer}>
                            {preview && <img src={preview} alt="Preview" style={styles.imagePreview} />}
                            <input type="file" onChange={handleImageChange} style={styles.fileInput} accept="image/*" />
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" style={styles.saveBtn} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes 💾"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Styles المحدثة مع إضافة ستايل الصور الجديد ---
const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
    modal: { backgroundColor: 'rgba(30, 41, 59, 0.9)', width: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', animation: 'fadeIn 0.3s ease-in-out' },
    header: { padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' },
    title: { margin: 0, fontSize: '1.2rem', background: 'linear-gradient(90deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    closeBtn: { background: 'none', border: 'none', color: '#aaa', fontSize: '1.2rem', cursor: 'pointer', padding: '5px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', padding: '25px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white', fontSize: '0.95rem', outline: 'none', transition: '0.3s', width: '100%', boxSizing: 'border-box' },
    
    // ستايلات الصور الجديدة
    imageEditContainer: { display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' },
    imagePreview: { width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #4facfe' },
    fileInput: { fontSize: '0.7rem', color: '#888' },

    footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
    cancelBtn: { padding: '10px 20px', backgroundColor: 'transparent', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    saveBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)' }
};

export default EditActivityModal;
