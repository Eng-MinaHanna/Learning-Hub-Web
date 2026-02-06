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
  const [currentView, setCurrentView] = useState(localStorage.getItem('activeView') || 'home');
  const [progressData, setProgressData] = useState({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
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
    setCurrentView('home');
  };

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

        {/* Sidebar */}
        <aside style={{ 
          ...styles.sidebar, 
          width: isSidebarOpen ? (isMobile ? '80%' : '280px') : '0px', 
          position: isMobile ? 'fixed' : 'relative',
          opacity: isSidebarOpen ? 1 : 0,
          left: isSidebarOpen ? '0px' : (isMobile ? '-100%' : '0px'),
          zIndex: 2000
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', minWidth: '240px' }}>
            <h2 style={{ color: 'white', letterSpacing: '1px' }}>IEEE <span style={{ color: '#4facfe' }}>ET5</span></h2>
          </div>

          <div style={{ ...styles.userInfo, minWidth: '240px' }}>
            <div style={styles.avatar}>
              {user?.profile_pic ? <img src={user.profile_pic} alt="U" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.name?.charAt(0) || 'U')}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>{user?.name}</div>
              <div style={styles.roleBadge}>{user?.role?.toUpperCase()}</div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
            {/* ✅ رجوع تابة الصفحة الرئيسية */}
            <button onClick={() => { setCurrentView('home'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'home' ? styles.navItemActive : styles.navItem}>🏠 Home</button>
            <button onClick={() => { setCurrentView('dashboard'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'dashboard' ? styles.navItemActive : styles.navItem}>📊 Dashboard</button>
            <button onClick={() => { setCurrentView('schedule'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'schedule' ? styles.navItemActive : styles.navItem}>📅 Schedule</button>
            <button onClick={() => { setCurrentView('leaderboard'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'leaderboard' ? styles.navItemActive : styles.navItem}>🏆 Leaderboard</button>
            {user?.role === 'admin' && <button onClick={() => { setCurrentView('users'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'users' ? styles.navItemActive : styles.navItem}>👥 Users</button>}
            <button onClick={() => { setCurrentView('community'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'community' ? styles.navItemActive : styles.navItem}>🌍 Community</button>
            <button onClick={() => { setCurrentView('settings'); if(isMobile) setIsSidebarOpen(false); }} style={currentView === 'settings' ? styles.navItemActive : styles.navItem}>⚙️ Settings</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '20px' : '40px', 
          maxWidth: (isSidebarOpen && !isMobile) ? 'calc(100% - 280px)' : '100%',
          transition: '0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '20px', justifyContent: 'space-between' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.toggleBtn}>{isSidebarOpen ? '◀' : '☰'}</button>
                {currentView === 'dashboard' && !selectedCourse && <h1 style={{ color: 'white', margin: 0, fontSize: isMobile ? '1.2rem' : '1.8rem' }}>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>}
             </div>
             {currentView === 'dashboard' && !selectedCourse && (
               <div style={styles.searchBox}>
                  <input type="text" placeholder="Search tracks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
               </div>
             )}
          </div>
          
          {currentView === 'dashboard' && !selectedCourse && (
            <>
              <div style={styles.statsGrid}>
                <DashboardCard title="Total Tracks" value={stats.total_activities} icon="📚" color="#4facfe" />
                <DashboardCard title="Active Students" value={stats.total_students} icon="👨‍🎓" color="#43e97b" />
                <DashboardCard title="Workshops" value={stats.total_workshops} icon="⚡" color="#fa709a" />
              </div>

              <div style={styles.coursesGrid}>
                {filteredActivities.map(act => (
                  <div key={act.id} style={styles.courseCard}>
                    <div style={styles.cardImageContainer}>
                       {act.file_path ? <img src={act.file_path} alt="C" style={styles.cardImage} /> : <div style={styles.cardPlaceholder}>IEEE</div>}
                       <span style={styles.typeBadgeOnImage}>{act.type}</span>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '1.1rem' }}>{act.title}</h3>
                      <div style={styles.progressContainer}>
                         <div style={{fontSize: '11px', color: '#888', marginBottom: '5px'}}>Progress: {progressData[act.id] || 0}%</div>
                         <div style={styles.progressBarBg}><div style={{...styles.progressBarFill, width: `${progressData[act.id] || 0}%`}}></div></div>
                      </div>
                      <div style={{display:'flex', gap:'10px', marginTop: '15px'}}>
                         <button onClick={() => handleOpenCourse(act)} style={styles.viewBtn}>Continue ▶️</button>
                         {user.role === 'admin' && (
                           <button onClick={() => handleDelete(act.id)} style={styles.deleteBtnSmall}>🗑️</button>
                         )}
                      </div>
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
      
      {(user.role === 'admin' || user.role === 'instructor') && currentView === 'dashboard' && (
        <button onClick={() => setShowAddModal(true)} style={styles.fab}>+</button>
      )}
    </div>
  );
}

const DashboardCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `5px solid ${color}` }}>
    <div style={{ ...styles.iconCircle, backgroundColor: `${color}22`, color: color }}>{icon}</div>
    <div>
      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>{value}</div>
    </div>
  </div>
);

const styles = {
  appContainer: { fontFamily: "'Cairo', 'Segoe UI', sans-serif", backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(79, 172, 254, 0.05) 1.5px, transparent 1.5px)', backgroundSize: '40px 40px', zIndex: 0 },
  sidebar: { backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease', padding: '30px 20px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' },
  avatar: { width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', overflow:'hidden', border: '2px solid rgba(79, 172, 254, 0.3)' },
  roleBadge: { backgroundColor: 'rgba(79, 172, 254, 0.1)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', color:'#4facfe', marginTop: '4px', display: 'inline-block' },
  navItem: { background: 'transparent', color: '#94a3b8', border: 'none', padding: '12px 15px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', width:'100%', display:'flex', alignItems: 'center', gap: '10px', transition: '0.2s', fontSize: '0.95rem' },
  navItemActive: { background: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', borderRight: '4px solid #4facfe', padding: '12px 15px', width:'100%', fontWeight:'bold', borderRadius: '0 12px 12px 0', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' },
  logoutBtn: { marginTop: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  searchBox: { background: 'rgba(255,255,255,0.05)', padding: '8px 20px', borderRadius: '25px', width: '220px', border: '1px solid rgba(255,255,255,0.1)' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { background: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  iconCircle: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  courseCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', transition: '0.3s' },
  cardImageContainer: { position: 'relative', height: '160px', overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: { width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4facfe', fontWeight: 'bold' },
  typeBadgeOnImage: { position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.7)', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', backdropFilter: 'blur(5px)', color: '#4facfe', border: '1px solid rgba(79,172,254,0.3)' },
  viewBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  deleteBtnSmall: { width: '45px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', cursor: 'pointer' },
  progressContainer: { marginTop: '10px' },
  progressBarBg: { width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' },
  progressBarFill: { height: '100%', background: 'linear-gradient(90deg, #4facfe, #43e97b)', borderRadius: '10px', transition: '0.5s' },
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '20px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#0f172a', fontSize: '30px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(79,172,254,0.4)', zIndex:100, fontWeight: 'bold' },
  toggleBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#4facfe', padding: '10px', borderRadius: '12px', cursor: 'pointer', width: '45px', height: '45px' }
};

export default App;
