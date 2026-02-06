import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfileModal = ({ userId, onClose }) => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/user/public-profile/${userId}`)
            .then(res => setProfile(res.data))
            .catch(err => console.error(err));
    }, [userId]);

    if (!profile) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>

                {/* Header Image Pattern */}
                <div style={styles.headerPattern}></div>

                <div style={styles.content}>
                    {/* Avatar */}
                    <div style={styles.avatarWrapper}>
                        {profile.profile_pic ? (
                            <img src={`http://localhost:5000/${profile.profile_pic}`} alt="Profile" style={styles.avatar} />
                        ) : (
                            <div style={styles.placeholderAvatar}>{profile.name.charAt(0)}</div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <h2 style={styles.name}>
                        {profile.name}
                        {profile.role === 'admin' && <span style={styles.adminBadge}>👑 Admin</span>}
                    </h2>
                    <p style={styles.email}>{profile.email}</p>
                    <span style={styles.badge}>{profile.badge}</span>

                    {/* Stats Grid */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{profile.courses_enrolled}</span>
                            <span style={styles.statLabel}>Courses</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{profile.posts_shared}</span>
                            <span style={styles.statLabel}>Posts</span>
                        </div>
                        <div style={styles.statBox}>
                            <span style={styles.statNumber}>{new Date(profile.created_at).getFullYear()}</span>
                            <span style={styles.statLabel}>Joined</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '350px', backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' },
    closeBtn: { position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 },
    headerPattern: { height: '100px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    content: { padding: '0 20px 30px', marginTop: '-50px', textAlign: 'center' },

    avatarWrapper: { width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #1e293b', margin: '0 auto 10px', overflow: 'hidden', backgroundColor: '#1e293b' },
    avatar: { width: '100%', height: '100%', objectFit: 'cover' },
    placeholderAvatar: { width: '100%', height: '100%', background: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold', color: 'white' },

    name: { margin: '0', color: 'white', fontSize: '1.4rem' },
    email: { color: '#94a3b8', fontSize: '0.9rem', margin: '5px 0 15px' },
    adminBadge: { fontSize: '0.7rem', backgroundColor: '#ffd700', color: 'black', padding: '2px 6px', borderRadius: '5px', marginLeft: '5px', verticalAlign: 'middle' },
    badge: { display: 'inline-block', backgroundColor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '20px', border: '1px solid rgba(79, 172, 254, 0.3)' },

    statsGrid: { display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '15px' },
    statBox: { textAlign: 'center', flex: 1 },
    statNumber: { display: 'block', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' },
    statLabel: { fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }
};

export default UserProfileModal;