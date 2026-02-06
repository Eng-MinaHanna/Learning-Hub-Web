import React, { useEffect, useState } from 'react';
import API from './api'; 
// المكونات
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
  // ✅ 1. قراءة المستخدم بأمان (عشان لو الـ LocalStorage فاضي الموقع ما يفرقعش)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ieee_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ حفظ الصفحة الحالية عند التغيير
  useEffect(() => {
    localStorage.setItem('activeView', currentView);
  }, [currentView]);

  // ✅ جلب البيانات الرئيسية
  const fetchData = async () => {
    try {
      const actsRes = await API.get('/activities/all');
      setActivities(actsRes.data);

      const savedCourseId = localStorage.getItem('activeCourseId');
      if (savedCourseId) {
        const courseToRestore = actsRes.data.find(c => c.id === parseInt(savedCourseId));
        if (courseToRestore) setSelectedCourse(courseToRestore);
      }

      if (user?.email) {
        // حساب التقدم لكل كورس
        actsRes.data.forEach(course => {
          API.get(`/progress/calculate/${course.id}/${user.email}`)
            .then(res => setProgressData(prev => ({ ...prev, [course.id]: res.data.percent })))
            .catch(() => {});
        });

        if (user.role === 'admin') {
          API.get('/stats').then(res => setStats(res.data)).catch(() => {});
        }
        checkNotifications();
      }
    } catch (err) { 
        console.error("Fetch Error:", err); 
    }
  };

  const checkNotifications = () => {
    if (!user?.id) return;
    API.get(`/notifications/${user.id}`)
      .then(res => {
        const unread = res.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ieee_user', JSON.stringify(userData));
    fetchData();
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null); 
    setShowAuth(false);
    localStorage.clear();
    setSelectedCourse(null); 
    setCurrentView('dashboard');
  };

  const handleOpenCourse = (course) => { 
    setSelectedCourse(course); 
    localStorage.setItem('activeCourseId', course.id); 
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
      } catch (err) { alert("Error deleting activity"); }
    }
  };

  const handleUserUpdate = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('ieee_user', JSON.stringify(newUser));
  };

  const filteredActivities = activities.filter(act =>
    act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenFromCalendar = (courseId) => {
    const courseToOpen = activities.find(c => c.id === courseId);
    if (courseToOpen) {
      handleOpenCourse(courseToOpen);
      setCurrentView('dashboard');
    }
  };

  // --- شاشة اللوجين والترحيب ---
  if (!user) {
    return (
      <div style={styles.appContainer}>
        <div style={styles.backgroundGrid}></div>
        <div style={styles.glowingOrb}></div>
        {showAuth ? <AuthPage onLogin={handleLogin} /> : <LandingPage onGetStarted={() => setShowAuth(true)} />}
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.backgroundGrid}></div>
      <div style={styles.glowingOrb}></div>

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 10 }}>

        {/* Sidebar */}
        <aside style={{
          ...styles.sidebar,
          width: isSidebarOpen ? '280px' : '0px',
          padding: isSidebarOpen ? '30px 20px' : '0px',
          opacity: isSidebarOpen ? 1 : 0
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', minWidth: '240px' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'white', lineHeight: '1.2' }}>
              IEEE <span style={{ color: '#4facfe' }}>ET5 SB</span>
              <br />
              <span style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginTop: '5px' }}>Learning Hub</span>
            </h2>
          </div>

          <div style={{ ...styles.userInfo, minWidth: '240px' }}>
            <div style={styles.avatar}>
              {/* ✅ صورة البروفايل السحابية */}
              {user?.profile_pic ? (
                <img 
                  src={user.profile_pic} 
                  alt="User" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                />
              ) : user?.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'white' }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                <span style={styles.roleBadge}>{user?.role?.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '240px' }}>
            <button onClick={() => setCurrentView('home')} style={currentView === 'home' ? styles.navItemActive : styles.navItem}>🏠 Home</button>
            <button onClick={() => setCurrentView('dashboard')} style={currentView === 'dashboard' ? styles.navItemActive : styles.navItem}>📊 Dashboard</button>
            <button onClick={() => setCurrentView('schedule')} style={currentView === 'schedule' ? styles.navItemActive : styles.navItem}>📅 Schedule</button>
            <button onClick={() => setCurrentView('leaderboard')} style={currentView === 'leaderboard' ? styles.navItemActive : styles.navItem}>🏆 Leaderboard</button>
            {user?.role === 'admin' && <button onClick={() => setCurrentView('users')} style={currentView === 'users' ? styles.navItemActive : styles.navItem}>👥 Users</button>}
            <button onClick={() => setCurrentView('community')} style={currentView === 'community' ? styles.navItemActive : styles.navItem}>🌍 Community</button>
            <button onClick={() => { setShowNotifications(true); setUnreadCount(0); }} style={styles.navItem}>
              🔔 Notifications {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount}</span>}
            </button>
            <button onClick={() => setCurrentView('settings')} style={currentView === 'settings' ? styles.navItemActive : styles.navItem}>⚙️ Settings</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto', transition: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.toggleBtn}>{isSidebarOpen ? '◀' : '☰'}</button>
            {currentView === 'dashboard' && !selectedCourse && <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>Hello, {user?.name?.split(' ')[0]}! 👋</h1>}
          </div>

          {currentView === 'home' && <LandingPage user={user} onGetStarted={() => setCurrentView('dashboard')} />}

          {currentView === 'dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '30px', marginTop: '-50px' }}>
                <div style={styles.searchBox}>
                  <span>🔍</span>
                  <input type="text" placeholder="Search tracks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
                </div>
              </div>

              {user.role === 'admin' && (
                <div style={styles.statsGrid}>
                  <DashboardCard title="Total Activities" value={stats.total_activities} icon="📚" color="#4facfe" />
                  <DashboardCard title="Active Students" value={stats.total_students} icon="👨‍🎓" color="#43e97b" />
                  <DashboardCard title="Workshops" value={stats.total_workshops} icon="⚡" color="#fa709a" />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'white', margin: 0 }}>My Learning Tracks</h2>
                <span style={styles.countBadge}>{filteredActivities.length} Tracks</span>
              </div>

              <div style={styles.coursesGrid}>
                {filteredActivities.map(act => (
                  <div key={act.id} style={styles.courseCard}>
                    {/* ✅ عرض صورة الكورس من Cloudinary */}
                    {act.file_path ? (
                        <img src={act.file_path} alt="Cover" style={{width:'100%', height:'160px', objectFit:'cover'}} />
                    ) : (
                        <div style={{ ...styles.cardAccent, backgroundColor: act.type === 'session' ? '#4facfe' : '#fa709a', height:'160px' }}></div>
                    )}
                    <div style={{ padding: '25px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span style={styles.typeBadge}>{act.type}</span>
                        {(user.role === 'admin' || (user.role === 'instructor' && act.created_by === user.id)) && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setEditingActivity(act)} style={styles.actionBtn}>✏️</button>
                            <button onClick={() => handleDelete(act.id)} style={{ ...styles.actionBtn, color: '#ff6b6b' }}>🗑️</button>
                          </div>
                        )}
                      </div>
                      <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>{act.title}</h3>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', height:'45px', overflow:'hidden' }}>{act.description}</p>
                      
                      <div style={{ margin: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ccc', marginBottom: '5px' }}>
                          <span>Progress</span>
                          <span>{progressData[act.id] || 0}%</span>
                        </div>
                        <div style={styles.progressBarBg}>
                          <div style={{ ...styles.progressBarFill, width: `${progressData[act.id] || 0}%`, backgroundColor: progressData[act.id] === 100 ? '#00e676' : '#4facfe' }}></div>
                        </div>
                      </div>

                      <div style={styles.metaInfo}>
                        <span>👨‍🏫 {act.instructor}</span>
                        <span>📅 {new Date(act.event_date).toLocaleDateString()}</span>
                      </div>
                      <button onClick={() => handleOpenCourse(act)} style={styles.viewBtn}>
                        {progressData[act.id] === 100 ? 'Course Completed 🎓' : 'Continue Learning ▶️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(user.role === 'admin' || user.role === 'instructor') && (
                <button onClick={() => setShowAddModal(true)} style={styles.fab} title="Add New Course"><span>+</span></button>
              )}
            </>
          )}

          {currentView === 'schedule' && <CalendarView onOpenCourse={handleOpenFromCalendar} />}
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
    </div>
  );
}

// Helper Components
const DashboardCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderBottom: `4px solid ${color}` }}>
    <div style={{ fontSize: '2.5rem' }}>{icon}</div>
    <div>
      <div style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{value}</div>
    </div>
  </div>
);

// Styles Object (The massive part)
const styles = {
  appContainer: { fontFamily: "'Cairo', sans-serif", backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 },
  glowingOrb: { position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 },
  sidebar: { backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(15px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: '0.3s', overflowX: 'hidden' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '15px', marginBottom: '30px' },
  avatar: { width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a', overflow:'hidden' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color:'#4facfe' },
  navItem: { background: 'transparent', color: '#aaa', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' },
  navItemActive: { background: 'linear-gradient(90deg, rgba(79,172,254,0.2) 0%, transparent 100%)', color: '#4facfe', borderLeft: '3px solid #4facfe', padding: '12px 20px', cursor: 'pointer', textAlign: 'left', width: '100%', fontWeight:'bold' },
  logoutBtn: { marginTop: 'auto', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '12px', borderRadius: '10px', cursor: 'pointer' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', width: '300px' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', padding: '25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  courseCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' },
  typeBadge: { backgroundColor: 'rgba(79,172,254,0.1)', color: '#4facfe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', textTransform: 'uppercase' },
  progressBarBg: { width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' },
  progressBarFill: { height: '100%', transition: '1s ease-in-out' },
  metaInfo: { display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.85rem', marginBottom: '20px' },
  viewBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' },
  actionBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '6px', cursor: 'pointer', width: '30px', height: '30px' },
  fab: { position: 'fixed', bottom: '40px', right: '40px', width: '60px', height: '60px', borderRadius: '50%', background: '#4facfe', color: '#0f172a', fontSize: '30px', border: 'none', cursor: 'pointer', zIndex: 100 },
  notifBadge: { backgroundColor: '#ff4757', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
  toggleBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#4facfe', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer' },
  countBadge: { backgroundColor: '#4facfe', color: '#0f172a', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }
};

export default App;
