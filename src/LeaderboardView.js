import React, { useState, useEffect } from 'react';
import API from './api'; 

const LeaderboardView = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetching data from online server
        API.get('/leaderboard')
            .then(res => {
                setLeaders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching leaderboard:", err);
                setLoading(false);
            });
    }, []);

    // Helper to get border color based on rank
    const getRankBorder = (index) => {
        if (index === 0) return '5px solid #ffd700'; // Gold
        if (index === 1) return '5px solid #c0c0c0'; // Silver
        if (index === 2) return '5px solid #cd7f32'; // Bronze
        return '1px solid rgba(255,255,255,0.05)';   // Others
    };

    // Helper to safely calculate score
    // Matches the SQL fields: video_points, quiz_points, post_points, comment_points
    const calculateScore = (person) => {
        return (Number(person.video_points) || 0) + 
               (Number(person.quiz_points) || 0) + 
               (Number(person.post_points) || 0) + 
               (Number(person.comment_points) || 0);
    };

    if (loading) return <div style={styles.loadingState}>Loading Champions... 🏆</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerSection}>
                <h2 style={styles.title}>🏆 Top Performers</h2>
                <p style={styles.subtitle}>Recognizing excellence in the IEEE ET5 Community.</p>
            </div>

            <div style={styles.list}>
                {leaders.length > 0 ? (
                    leaders.map((person, index) => (
                        <div key={person.id || index} style={{
                            ...styles.card,
                            borderLeft: getRankBorder(index)
                        }}>
                            <div style={styles.rank}>#{index + 1}</div>
                            
                            <div style={styles.avatarContainer}>
                                {person.profile_pic ? (
                                    <img 
                                        src={person.profile_pic} 
                                        alt={person.name} 
                                        style={styles.avatarImg} 
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100/4facfe/ffffff?text=' + person.name.charAt(0); }}
                                    />
                                ) : (
                                    <div style={styles.placeholderAvatar}>{person.name?.charAt(0)}</div>
                                )}
                                {index < 3 && <div style={styles.crown}>{index === 0 ? '👑' : (index === 1 ? '🥈' : '🥉')}</div>}
                            </div>

                            <div style={styles.info}>
                                <div style={styles.name}>{person.name}</div>
                                <div style={styles.role}>{person.role?.toUpperCase() || 'MEMBER'}</div>
                            </div>

                            <div style={styles.scoreSection}>
                                <div style={styles.totalScore}>
                                    {calculateScore(person)}
                                </div>
                                <div style={styles.scoreLabel}>POINTS</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>
                        No active members found on the leaderboard yet.
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '50px', paddingLeft:'15px', paddingRight:'15px' },
    loadingState: { color: 'white', textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', animation: 'pulse 1.5s infinite' },
    headerSection: { textAlign: 'center', marginBottom: '40px', marginTop: '30px' },
    title: { color: 'white', fontSize: '2.2rem', margin: 0, fontWeight: '800', letterSpacing: '-1px' },
    subtitle: { color: '#94a3b8', marginTop: '10px', fontSize: '0.95rem' },
    list: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { 
        backgroundColor: 'rgba(30, 41, 59, 0.7)', 
        backdropFilter: 'blur(12px)', 
        padding: '20px', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    rank: { fontSize: '1.5rem', fontWeight: 'bold', color: '#4facfe', minWidth: '40px', textAlign: 'center' },
    avatarContainer: { position: 'relative', width: '60px', height: '60px', flexShrink: 0 },
    avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' },
    placeholderAvatar: { width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' },
    crown: { position: 'absolute', top: '-12px', right: '-8px', fontSize: '1.4rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' },
    info: { flex: 1, overflow: 'hidden' }, 
    name: { color: 'white', fontWeight: '700', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    role: { color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1.5px', marginTop: '4px', fontWeight: '600' },
    scoreSection: { textAlign: 'right', minWidth: '60px' },
    totalScore: { color: '#4facfe', fontSize: '1.4rem', fontWeight: '800' },
    scoreLabel: { color: '#64748b', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.5px' }
};

export default LeaderboardView;
