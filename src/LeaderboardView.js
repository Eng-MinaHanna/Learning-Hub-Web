import React, { useEffect, useState } from 'react';
import API from './api'; // ✅ استيراد السنترال

const LeaderboardView = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // ✅ التعديل هنا: استخدمنا API والمسار المختصر
        API.get('/leaderboard')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Error loading leaderboard:", err));
    }, []);

    const topThree = users.slice(0, 3);
    const restOfUsers = users.slice(3);

    return (
        <div style={styles.container}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={styles.header}>🏆 Hall of Fame</h2>
                <p style={{ color: '#94a3b8' }}>Top performing students based on learning & activity.</p>
            </div>

            {/* Podium for Top 3 */}
            <div style={styles.podiumContainer}>
                {topThree[1] && <PodiumCard user={topThree[1]} rank={2} color="#C0C0C0" height="180px" />}
                {topThree[0] && <PodiumCard user={topThree[0]} rank={1} color="#FFD700" height="220px" isFirst={true} />}
                {topThree[2] && <PodiumCard user={topThree[2]} rank={3} color="#CD7F32" height="160px" />}
            </div>

            {/* List for 4th - 10th */}
            <div style={styles.listContainer}>
                {restOfUsers.map((user, index) => (
                    <div key={user.id} style={styles.listItem}>
                        <span style={styles.rankNumber}>#{index + 4}</span>
                        <div style={styles.userInfo}>
                            {user.profile_pic ?
                                <img src={`http://localhost:5000/${user.profile_pic}`} style={styles.avatarSmall} alt="av" /> :
                                <div style={styles.avatarSmallPlaceholder}>{user.name.charAt(0)}</div>
                            }
                            <span style={{ color: 'white', fontWeight: 'bold' }}>{user.name}</span>
                        </div>
                        <div style={styles.pointsBadge}>
                            ✨ {user.total_points} pts
                        </div>
                    </div>
                ))}
                {users.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No data available yet.</p>}
            </div>
        </div>
    );
};

const PodiumCard = ({ user, rank, color, height, isFirst }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: isFirst ? 10 : 1 }}>
        <div style={{ position: 'relative', marginBottom: '10px' }}>
            {isFirst && <div style={styles.crown}>👑</div>}
            {user.profile_pic ?
                <img src={`http://localhost:5000/${user.profile_pic}`} style={{ ...styles.avatarLarge, border: `4px solid ${color}` }} alt="av" /> :
                <div style={{ ...styles.avatarLargePlaceholder, border: `4px solid ${color}` }}>{user.name.charAt(0)}</div>
            }
            <div style={{ ...styles.rankBadge, background: color }}>{rank}</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: isFirst ? '1.2rem' : '1rem' }}>{user.name}</div>
            <div style={{ color: color, fontWeight: 'bold', fontSize: '0.9rem' }}>{user.total_points} pts</div>
        </div>

        <div style={{
            width: isFirst ? '120px' : '100px',
            height: height,
            background: `linear-gradient(to top, rgba(30,41,59,0.8), ${color}40)`,
            borderRadius: '15px 15px 0 0',
            borderTop: `4px solid ${color}`
        }}></div>
    </div>
);

const styles = {
    container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' },
    header: { color: 'white', fontSize: '2.5rem', margin: 0 },
    podiumContainer: { display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', marginBottom: '50px', height: '350px' },
    crown: { position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '2rem', animation: 'float 2s infinite ease-in-out' },
    avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
    avatarLargePlaceholder: { width: '80px', height: '80px', borderRadius: '50%', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold' },
    rankBadge: { position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '25px', height: '25px', borderRadius: '50%', color: '#0f172a', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.9rem', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' },
    listContainer: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '20px', padding: '20px' },
    listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' },
    rankNumber: { color: '#64748b', fontWeight: 'bold', width: '40px', fontSize: '1.2rem' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '15px', flex: 1 },
    avatarSmall: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
    avatarSmallPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', background: '#4facfe', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    pointsBadge: { backgroundColor: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes float { 0% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-5px); } 100% { transform: translateX(-50%) translateY(0); } }
`;
document.head.appendChild(styleSheet);

export default LeaderboardView;