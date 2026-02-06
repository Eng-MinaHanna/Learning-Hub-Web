import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationsModal = ({ userId, onClose }) => {
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        // بنجيب الإشعارات من السيرفر
        axios.get(`http://localhost:5000/api/notifications/${userId}`)
            .then(res => setNotifs(res.data))
            .catch(err => console.error(err));
    }, [userId]);

    // دالة تحويل الإشعار لمقروء عند الضغط عليه
    const markRead = (id) => {
        axios.put(`http://localhost:5000/api/notifications/read/${id}`)
            .then(() => {
                // تحديث الشكل فوراً عشان النقطة تختفي واللون يتغير
                setNotifs(notifs.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            });
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={{ margin: 0, color: 'white' }}>🔔 Updates</h3>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                </div>

                <div style={styles.list}>
                    {notifs.length > 0 ? notifs.map(n => (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            style={{
                                ...styles.item,
                                // لو مش مقروء بياخد لون مميز، لو مقروء بيبقى شفاف
                                backgroundColor: n.is_read ? 'transparent' : 'rgba(79, 172, 254, 0.1)',
                                borderLeft: n.is_read ? '3px solid transparent' : '3px solid #4facfe'
                            }}
                        >
                            <div style={styles.avatar}>
                                {n.sender_avatar ?
                                    <img src={`http://localhost:5000/${n.sender_avatar}`} style={styles.img} alt="av" /> :
                                    <div style={styles.placeholder}>{n.sender_name.charAt(0)}</div>
                                }
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'white', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: 'bold', color: '#4facfe' }}>{n.sender_name}</span> {n.message}
                                </div>
                                <div style={{ color: '#888', fontSize: '0.7rem', marginTop: '4px' }}>
                                    {new Date(n.created_at).toLocaleString()}
                                </div>
                            </div>
                            {!n.is_read && <div style={styles.dot}></div>}
                        </div>
                    )) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💤</div>
                            No notifications yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2000, display: 'flex', justifyContent: 'flex-start' }, // القائمة بتظهر من الشمال جنب الـ Sidebar
    modal: { width: '320px', height: '100%', backgroundColor: '#1e293b', borderRight: '1px solid rgba(255,255,255,0.1)', boxShadow: '5px 0 20px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s', marginLeft: '280px' }, // marginLeft عشان تفتح بعد الـ Sidebar
    header: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' },
    closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' },
    list: { overflowY: 'auto', flex: 1 },
    item: { display: 'flex', gap: '12px', padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: '0.2s', alignItems: 'center' },
    avatar: { width: '35px', height: '35px', minWidth: '35px' },
    img: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
    placeholder: { width: '100%', height: '100%', borderRadius: '50%', background: '#4facfe', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#0f172a' },
    dot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff4757' }
};

// CSS Animation for sliding effect
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }`;
document.head.appendChild(styleSheet);

export default NotificationsModal;