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

                {/* ✅ ADMIN SECTION */}
                {user?.role === 'admin' && (
                    <>
                        <div style={{...styles.divider, margin: '10px 0'}}></div>
                        <span style={{fontSize:'0.75rem', color:'#64748b', paddingLeft:'15px', marginBottom:'5px', fontWeight:'bold'}}>ADMIN CONTROLS</span>
                        
                        <NavBtn icon="👥" label="Users Management" active={currentView === 'users'} onClick={() => onNavigate('users')} />
                        <NavBtn icon="🤝" label="Sponsors & Partners" active={currentView === 'sponsors'} onClick={() => onNavigate('sponsors')} />
                    </>
                )}

                <div style={{...styles.divider, margin: '10px 0'}}></div>
                <NavBtn icon="⚙️" label="Settings" active={currentView === 'settings'} onClick={() => onNavigate('settings')} />
                
                <div style={styles.bottomSection}>
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

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={active ? styles.navActive : styles.navInactive}>
    <span style={{fontSize: '1.2rem'}}>{icon}</span>
    {label}
  </button>
);

const styles = {
  sidebar: { 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      height: '100vh', 
      backgroundColor: 'rgba(10, 15, 28, 0.95)', 
      backdropFilter: 'blur(15px)', 
      borderRight: '1px solid rgba(255,255,255,0.05)', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
      zIndex: 1000, 
      
      // ✅ حل مشكلة السكرول
      overflowY: 'auto', 
      overflowX: 'hidden',
      overscrollBehavior: 'contain', // يمنع انتقال السكرول للصفحة اللي تحتها (Scroll
