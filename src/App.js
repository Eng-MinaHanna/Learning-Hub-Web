import React, { useEffect, useState } from 'react';
import API from './api'; 
import AddCourseModal from './AddCourseModal';
import CourseDetailsModal from './CourseDetailsModal';
import EditActivityModal from './EditActivityModal';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import CalendarView from './CalendarView';
import SettingsView from './SettingsView';
import CommunityView from './CommunityView';
import LeaderboardView from './LeaderboardView';
import AdminUsersView from './AdminUsersView';
import NotificationsModal from './NotificationsModal';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ieee_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const [showAuth, setShowAuth] = useState(false);
  const [activities, setActivities] = useState([]); 
  const [stats, setStats] = useState({ total_activities: 0, total_students: 0, total_workshops: 0 });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState(localStorage.getItem('activeView') || 'dashboard');
  const [progressData, setProgressData] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // ✅ حساسات الموبايل واللاب
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeView', currentView);
  }, [currentView]);

  const fetchData = async () => {
    try {
      const actsRes = await API.get('/activities/all');
      const data = Array.isArray(actsRes.data) ? actsRes.data : [];
      setActivities(data);

      if (user?.email) {
        data.forEach(course => {
          if (course?.id) {
            API.get(`/progress/calculate/${course.id}/${user.email}`)
              .then(res => setProgressData(prev => ({ ...prev, [course.id]: res.data?.percent || 0 })))
              .catch(() => {});
          }
        });

        if (user.role === 'admin') {
          API.get('/stats').then(res => setStats(res.data || stats)).catch(() => {});
        }
        checkNotifications();
      }
    } catch (err) { console.error("Fetch Error", err); }
  };

  const checkNotifications = () => {
    if (!user?.id) return;
    API.get(`/notifications/${user.id}`)
      .then(res => setUnreadCount(Array.isArray(res.data) ? res.data.filter(n => !n.is_read).length : 0))
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ieee_user', JSON.stringify(userData));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null); 
    localStorage.clear();
    setSelectedCourse(null); 
    setCurrentView('dashboard');
  };

  // ✅ الدالة اللي كانت ناقصة وسببت الـ Error
  const handleUserUpdate = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('ieee_user', JSON.stringify(newUser));
  };

  const filteredActivities = (activities || []).filter(act =>
    act?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCourse = (course) => { 
    setSelectedCourse(course); 
    localStorage.setItem('activeCourseId', course?.id); 
  };

  const handleCloseCourse = () => {
    setSelectedCourse(null);
    localStorage.removeItem('activeCourseId');
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ هل أنت متأكد من الحذف؟")) {
      try {
        await API.delete(`/activities/delete/${id}`);
        fetchData();
      } catch (err) { alert("Error deleting"); }
    }
  };

  if (!user) {
    return (
      <div style={styles.appContainer}>
        <div style={styles.backgroundGrid}></div>
        {showAuth ? <AuthPage onLogin={handleLogin} /> : <LandingPage onGetStarted={() => setShowAuth(true)} />}
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.backgroundGrid}></div>
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 10 }}>

        {/* ✅ Sidebar متطور لا يتمط */}
        <aside style={{ 
          ...styles.sidebar, 
          width: isSidebarOpen ? (isMobile ? '280px' : '280px') : '0px', 
          position: isMobile ? 'fixed' : 'relative',
          opacity: isSidebarOpen ? 1 : (isMobile ? 0 : 0),
          left: isSidebarOpen ? '0px' : (isMobile ? '-280px' : '0px'),
          zIndex: 2000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', minWidth: '240px' }}>
            <h2 style={{ color: 'white' }}>IEEE <span style={{ color: '#4facfe' }}>ET5 SB</span></h2>
          </div>

          <div style={{ ...styles.userInfo, minWidth: '240px' }}>
            <div style={styles.avatar}>
              {user?.profile_pic ? <img src={user.profile_pic} alt="U" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'white' }}>{user?.name || "Member"}</div>
              <div style={styles.roleBadge}>{user?.role?.toUpperCase()}</div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
            <button onClick={() => { setCurrentView('dashboard'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'dashboard' ? styles.navItemActive : styles.navItem}>📊 Dashboard</button>
            <button onClick={() => { setCurrentView('schedule'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'schedule' ? styles.navItemActive : styles.navItem}>📅 Schedule</button>
            <button onClick={() => { setCurrentView('leaderboard'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'leaderboard' ? styles.navItemActive : styles.navItem}>🏆 Leaderboard</button>
            {user?.role === 'admin' && <button onClick={() => { setCurrentView('users'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'users' ? styles.navItemActive : styles.navItem}>👥 Users</button>}
            <button onClick={() => { setCurrentView('community'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'community' ? styles.navItemActive : styles.navItem}>🌍 Community</button>
            <button onClick={() => { setCurrentView('settings'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'settings' ? styles.navItemActive : styles.navItem}>⚙️ Settings</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
          </nav>
        </aside>

        {/* ✅ Main محمي من التمطيط */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '20px' : '40px', 
          overflowY: 'auto',
          maxWidth: (isSidebarOpen && !isMobile) ? 'calc(100% - 280px)' : '100%',
          transition: '0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px' }}>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.toggleBtn}>{isSidebarOpen ? '◀' : '☰'}</button>
             {currentView === 'dashboard' && !selectedCourse && <h1 style={{ color: 'white', margin: 0, fontSize: isMobile ? '1.2rem' : '2rem' }}>Hello, {user?.name?.split(' ')[0]}! 👋</h1>}
          </div>
          
          {currentView === 'dashboard' && !selectedCourse && (
            <>
              <div style={styles.statsGrid}>
                <DashboardCard title="Tracks" value={stats.total_activities} icon="📚" color="#4facfe" />
                <DashboardCard title="Students" value={stats.total_students} icon="👨‍🎓" color="#43e97b" />
                <DashboardCard title="Workshops" value={stats.total_workshops} icon="⚡" color="#fa709a" />
              </div>

              <div style={styles.coursesGrid}>
                {filteredActivities.map(act => (
                  <div key={act.id} style={styles.courseCard}>
                    {act.file_path && <img src={act.file_path} alt="C" style={{width:'100%', height:'160px', objectFit:'cover'}} />}
                    <div style={{ padding: '20px' }}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                         <span style={styles.typeBadge}>{act.type}</span>
                         {(user.role === 'admin' || (user.role === 'instructor' && act.created_by === user.id)) && (
                           <div style={{display:'flex', gap:'5px'}}>
                             <button onClick={() => setEditingActivity(act)} style={styles.actionBtn}>✏️</button>
                             <button onClick={() => handleDelete(act.id)} style={{...styles.actionBtn, color:'#ff4d4d'}}>🗑️</button>
                           </div>
                         )}
                      </div>
                      <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>{act.title}</h3>
                      <button onClick={() => handleOpenCourse(act)} style={styles.viewBtn}>Continue ▶️</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {currentView === 'home' && <LandingPage user={user} onGetStarted={() => setCurrentView('dashboard')} />}
          {currentView === 'schedule' && <CalendarView onOpenCourse={handleOpenCourse} />}
          {currentView === 'leaderboard' && <LeaderboardView />}
          {currentView === 'users' && <AdminUsersView currentUser={user} />}
          {currentView === 'community' && <CommunityView />}
          {currentView === 'settings' && <SettingsView user={user} onUpdateUser={handleUserUpdate} />}
        </main>
      </div>

      {showAddModal && <AddCourseModal onClose={() => setShowAddModal(false)} onAdd={fetchData} currentUser={user} />}
      {selectedCourse && <CourseDetailsModal course={selectedCourse} onClose={handleCloseCourse} currentUser={user} />}
      {editingActivity && <EditActivityModal activity={editingActivity} onClose={() => setEditingActivity(null)} onUpdate={fetchData} />}
      {showNotifications && <NotificationsModal userId={user.id} onClose={() => setShowNotifications(false)} />}
      
      {(user.role === 'admin' || user.role === 'instructor') && currentView === 'dashboard' && (
        <button onClick={() => setShowAddModal(true)} style={styles.fab}>+</button>
      )}
    </div>
  );
}

const DashboardCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderBottom: `4px solid ${color}` }}>
    <div style={{ fontSize: '2rem' }}>{icon}</div>
    <div>
      <div style={{ color: '#aaa', fontSize: '10px', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

const styles = {
  appContainer: { fontFamily: "'Cairo', sans-serif", backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 },
  sidebar: { backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(15px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow:'hidden' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '15px', marginBottom: '20px' },
  avatar: { width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', overflow:'hidden' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color:'#4facfe' },
  navItem: { background: 'transparent', color: '#aaa', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', width:'100%', display:'block', fontSize: '1rem' },
  navItemActive: { background: 'linear-gradient(90deg, rgba(79,172,254,0.2), transparent)', color: '#4facfe', borderLeft: '3px solid #4facfe', padding: '12px', width:'100%', fontWeight:'bold', cursor: 'pointer', textAlign: 'left' },
  logoutBtn: { marginTop: '20px', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  courseCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' },
  viewBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' },
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: '#4facfe', color: 'white', fontSize: '30px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(79,172,254,0.5)', zIndex:100 },
  toggleBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#4facfe', padding: '10px', borderRadius: '8px', cursor: 'pointer', zIndex: 3000 },
  typeBadge: { backgroundColor: 'rgba(79,172,254,0.1)', color: '#4facfe', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' },
  statCard: { background: 'rgba(30, 41, 59, 0.8)', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' },
  actionBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }
};

export default App;
