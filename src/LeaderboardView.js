import React, { useState, useEffect } from 'react';
import API from './api'; // ✅ استخدام السنترال

const LeaderboardView = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✅ جلب البيانات من السيرفر الأونلاين
        API.get('/leaderboard')
            .then(res => {
                setLeaders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Champions... 🏆</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <h2 style={styles.title}>🏆 Top Performers</h2>
                <p style={styles.subtitle}>Recognizing excellence in the IEEE ET5 Community.</p>
            </div>

            <div style={styles.list}>
                {leaders.map((person, index) => (
                    <div key={person.id} style={{
                        ...styles.card,
                        borderLeft: index === 0 ? '5px solid #ffd700' : (index === 1 ? '5px solid #c0c0c0' : (index === 2 ? '5px solid #cd7f32' : '1px solid rgba(255,255,255,0.05)'))
                    }}>
                        <div style={styles.rank}>#{index + 1}</div>
                        
                        {/* ✅ التعديل الجوهري: الصورة تقرأ اللينك السحابي مباشرة بدون localhost */}
                        <div style={styles.avatarContainer}>
                            {person.profile_pic ? (
                                <img 
                                    src={person.profile_pic} 
                                    alt={person.name} 
                                    style={styles.avatarImg} 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                                />
                            ) : (
                                <div style={styles.placeholderAvatar}>{person.name.charAt(0)}</div>
                            )}
                            {index < 3 && <div style={styles.crown}>{index === 0 ? '👑' : (index === 1 ? '🥈' : '🥉')}</div>}
                        </div>

                        <div style={styles.info}>
                            <div style={styles.name}>{person.name}</div>
                            <div style={styles.role}>{person.role.toUpperCase()}</div>
                        </div>

                        <div style={styles.scoreSection}>
                            <div style={styles.totalScore}>
                                {parseInt(person.video_points) + parseInt(person.quiz_points) + parseInt(person.post_points) + parseInt(person.comment_points)}
                            </div>
                            <div style={styles.scoreLabel}>POINTS</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ... الـ Styles متظبطة عشان الصورة تطلع شيك ...
const styles = {
    container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' },
    headerSection: { textAlign: 'center', marginBottom: '40px' },
    title: { color: 'white', fontSize: '2rem', margin: 0 },
    subtitle: { color: '#94a3b8', marginTop: '10px' },
    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', transition: '0.3s' },
    rank: { fontSize: '1.5rem', fontWeight: 'bold', color: '#4facfe', minWidth: '50px' },
    avatarContainer: { position: 'relative', width: '60px', height: '60px' },
    avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' },
    placeholderAvatar: { width: '100%', height: '100%', borderRadius: '50%', background: '#4facfe', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' },
    crown: { position: 'absolute', top: '-10px', right: '-10px', fontSize: '1.2rem' },
    info: { flex: 1 },
    name: { color: 'white', fontWeight: 'bold', fontSize: '1.1rem' },
    role: { color: '#64748b', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '4px' },
    scoreSection: { textAlign: 'right' },
    totalScore: { color: '#4facfe', fontSize: '1.5rem', fontWeight: 'bold' },
    scoreLabel: { color: '#64748b', fontSize: '0.7rem', fontWeight: 'bold' }
};

export default LeaderboardView;
