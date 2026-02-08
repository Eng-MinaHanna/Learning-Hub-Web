import React from 'react';

const Sidebar = ({ isOpen, isMobile, user, currentView, onNavigate, onLogout }) => {
    return (
        <aside style={{ 
            ...styles.sidebar, 
            width: isOpen ? '280px' : '0px', 
            transform: (isMobile && !isOpen) ? 'translateX(-100%)' : 'translateX(0)',
            visibility: (!isOpen && !isMobile) ? 'hidden' : 'visible'
        }}>
            <div style={{ padding: '40px 20px 20px', textAlign: 'center' }}>
                <h2 style={{...styles.brandText, fontSize: '1.2rem', lineHeight: '1.5'}}>
                    IEEE <span style={{ color: '#4facfe' }}>ET5 SB</span>
                    <br />
                    <span style={{fontSize: '0.9rem', color: '#ccc', fontWeight: 'normal', letterSpacing: '1px'}}>Learning Hub</span>
                </h2>
                <div style={styles.divider}></div>
            </div>

            <div style={styles.userInfo}>
                <div style={styles.avatar}>
                    {user?.profile_pic ? <img src={user.profile_pic} alt="P" style={styles.avatarImg} /> : user?.name?.charAt(0)}
                </div>
                <div style={{overflow:'hidden'}}>
                    <div style={styles.userName}>{user?.name}</div>
                    <div style={styles.userRole}>{user?.role}</div>
                </div>
            </div>

            <nav style={styles.navStack}>
                {user.role !== 'company' && <NavBtn icon="🏠" label="Home" active={currentView === 'home'} onClick={() => onNavigate('home')} />}
                
                <NavBtn icon="💎" label={user.role === 'company' ? "Find Talent (CVs)" : "Top Performances"} active={currentView === 'leaderboard'} onClick={() => onNavigate('leaderboard')} />
                
                <NavBtn icon="🎖️" label="Our Team" active={currentView === 'team'} onClick={() => onNavigate('team')} />

                {user.role !== 'company' && (
                    <>
                        <NavBtn icon="📊" label="Dashboard" active={currentView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                        <NavBtn icon="📅" label="Schedule" active={currentView === 'schedule'} onClick={() => onNavigate('schedule')} />
                        <NavBtn icon="🌍" label="Community" active={currentView === 'community'} onClick={() => onNavigate('community')} />
                    </>
                )}

                {user?.role === 'admin' && <NavBtn icon="👥" label="Admin Panel" active={currentView === 'users'} onClick={() => onNavigate('users')} />}
                <NavBtn icon="⚙️" label="Settings" active={currentView === 'settings'} onClick={() => onNavigate('settings')} />
                
                <div style={{marginTop: 'auto', paddingTop: '10px'}}>
                    <div style={{...styles.divider, margin: '5px 0'}}></div>
                    <NavBtn 
                        icon="🌐" 
                        label="Main Website" 
                        active={false} 
                        onClick={() => window.open('https://studentbranches.ieee.org/eg-hiet-sb/', '_blank')} 
                    />
                    <button onClick={onLogout} style={styles.logoutBtn}>🚪 Logout</button>
                </div>
            </nav>
        </aside>
    );
};

// Helper Component for Sidebar
const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={active ? styles.navActive : styles.navInactive}>
    <span style={{fontSize: '1.2rem'}}>{icon}</span>
    {label}
  </button>
);

// Styles specific to Sidebar
const styles = {
  sidebar: { position: 'fixed', top: 0, left: 0, height: '100vh', backgroundColor: 'rgba(10, 15, 28, 0.95)', backdropFilter: 'blur(15px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1000, overflow:'hidden' },
  brandText: { margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'white', letterSpacing: '2px' },
  divider: { height: '1px', background: 'linear-gradient(90deg, transparent, rgba(79,172,254,0.3), transparent)', margin: '15px 0' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', margin: '0 20px 30px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' },
  avatar: { width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#050810' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' },
  userName: { fontWeight: 'bold', fontSize: '0.85rem', whiteSpace:'nowrap' },
  userRole: { fontSize: '10px', color: '#4facfe', textTransform: 'uppercase', letterSpacing: '1px' },
  navStack: { display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 15px', flex: 1 }, 
  navInactive: { background: 'transparent', color: '#64748b', border: 'none', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s', fontSize: '0.9rem', width: '100%' },
  navActive: { background: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', borderRight: '3px solid #4facfe', padding: '12px 15px', borderRadius: '4px 12px 12px 4px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' },
  logoutBtn: { marginTop: '10px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize:'0.8rem', width: '100%' },
};

export default Sidebar;
