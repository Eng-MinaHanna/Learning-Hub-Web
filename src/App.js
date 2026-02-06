import React, { useEffect, useState } from 'react';
import API from './api'; // ✅ استيراد السنترال
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
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('ieee_user')) || null);
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

  useEffect(() => {
    localStorage.setItem('activeView', currentView);
  }, [currentView]);

  // ✅ تم حذف الـ Interceptor اليدوي لأنه موجود في api.js

  const fetchData = async () => {
    try {
      // ✅ تم التعديل لـ API والمسارات المختصرة
      const actsRes = await API.get('/activities/all');
      setActivities(actsRes.data);

      const savedCourseId = localStorage.getItem('activeCourseId');
      if (savedCourseId) {
        const courseToRestore = actsRes.data.find(c => c.id === parseInt(savedCourseId));
        if (courseToRestore) setSelectedCourse(courseToRestore);
      }

      if (user) {
        actsRes.data.forEach(course => {
          API.get(`/progress/calculate/${course.id}/${user.email}`)
            .then(res => setProgressData(prev => ({ ...prev, [course.id]: res.data.percent })));
        });

        if (user.role === 'admin') {
          const statsRes = await API.get('/stats');
          setStats(statsRes.data);
        }
        checkNotifications();
      }
    } catch (err) { console.error(err); }
  };

  const checkNotifications = () => {
    if (!user) return;
    API.get(`/notifications/${user.id}`)
      .then(res => {
        const unread = res.data.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(checkNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('ieee_user', JSON.stringify(userData));
    fetchData(); // لجلب البيانات فور تسجيل الدخول
  };

  const handleLogout = () => {
    setUser(null); setShowAuth(false);
    localStorage.removeItem('ieee_user'); localStorage.removeItem('ieee_token');
    localStorage.removeItem('activeCourseId'); localStorage.removeItem('activeView');
    setSelectedCourse(null); setCurrentView('dashboard');
  };

  const handleOpenCourse = (course) => { setSelectedCourse(course); localStorage.setItem('activeCourseId', course.id); };

  const handleCloseCourse = () => {
    setSelectedCourse(null);
    localStorage.removeItem('activeCourseId');
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("⚠️ هل أنت متأكد؟")) {
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
              <span style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', display: 'block', marginTop: '5px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Learning Hub</span>
            </h2>
          </div>

          <div style={{ ...styles.userInfo, minWidth: '240px' }}>
            <div style={styles.avatar}>
              {user.profile_pic ? <img src={`http://localhost:5000/${user.profile_pic}`} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}><span style={styles.roleBadge}>{user.role.toUpperCase()}</span></div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '240px' }}>
            <button onClick={() => setCurrentView('home')} style={currentView === 'home' ? styles.navItemActive : styles.navItem}>🏠 Home</button>
            <button onClick={() => setCurrentView('dashboard')} style={currentView === 'dashboard' ? styles.navItemActive : styles.navItem}>📊 Dashboard</button>
            <button onClick={() => setCurrentView('schedule')} style={currentView === 'schedule' ? styles.navItemActive : styles.navItem}>📅 Schedule</button>
            <button onClick={() => setCurrentView('leaderboard')} style={currentView === 'leaderboard' ? styles.navItemActive : styles.navItem}>🏆 Leaderboard</button>
            {user.role === 'admin' && <button onClick={() => setCurrentView('users')} style={currentView === 'users' ? styles.navItemActive : styles.navItem}>👥 Users</button>}
            <button onClick={() => setCurrentView('community')} style={currentView === 'community' ? styles.navItemActive : styles.navItem}>🌍 Community</button>
            <button onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }} style={styles.navItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                <span>🔔 Notifications</span>
                {unreadCount > 0 && <span style={styles.notifBadge}>{unreadCount}</span>}
              </div>
            </button>
            <button onClick={() => setCurrentView('settings')} style={currentView === 'settings' ? styles.navItemActive : styles.navItem}>⚙️ Settings</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
          </nav>
        </aside>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto', transition: '0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '20px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.toggleBtn}>{isSidebarOpen ? '◀' : '☰'}</button>
            {currentView === 'dashboard' && !selectedCourse && <h1 style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>Hello, {user.name.split(' ')[0]}! 👋</h1>}
          </div>

          {currentView === 'home' && <LandingPage user={user} onGetStarted={() => setCurrentView('dashboard')} />}

          {currentView === 'dashboard' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '30px', marginTop: '-50px' }}>
                <div style={styles.searchBox}>
                  <span>🔍</span>
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
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
                {filteredActivities.length > 0 ? (
                  filteredActivities.map(act => (
                    <div key={act.id} style={styles.courseCard}>
                      <div style={{ ...styles.cardAccent, backgroundColor: act.type === 'session' ? '#4facfe' : '#fa709a' }}></div>
                      <div style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                          <span style={styles.typeBadge}>{act.type}</span>
                          {(user.role === 'admin' || (user.role === 'instructor' && act.created_by === user.id)) && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => setEditingActivity(act)} style={styles.actionBtn}>✏️</button>
                              <button onClick={() => handleDelete(act.id)} style={{ ...styles.actionBtn, color: '#ff6b6b', borderColor: '#ff6b6b' }}>🗑️</button>
                            </div>
                          )}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '1.3rem' }}>{act.title}</h3>
                        <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px', height: '45px', overflow: 'hidden' }}>{act.description}</p>
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ccc', marginBottom: '5px' }}>
                            <span>Progress</span>
                            <span>{progressData[act.id] || 0}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressData[act.id] || 0}%`, height: '100%', backgroundColor: (progressData[act.id] === 100) ? '#00e676' : '#4facfe', transition: 'width 1s ease-in-out' }}></div>
                          </div>
                        </div>
                        <div style={styles.metaInfo}>
                          <span>👨‍🏫 {act.instructor}</span>
                          <span>📅 {new Date(act.event_date).toLocaleDateString()}</span>
                        </div>
                        <button onClick={() => handleOpenCourse(act)} style={styles.viewBtn}>
                          {(progressData[act.id] === 100) ? 'Course Completed 🎓' : 'Continue Learning ▶️'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#aaa', width: '100%', textAlign: 'center' }}>No courses found</p>
                )}
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

// Stats Card Component
const DashboardCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderBottom: `4px solid ${color}` }}>
    <div style={{ fontSize: '2.5rem', opacity: 0.9 }}>{icon}</div>
    <div>
      <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{value}</div>
    </div>
  </div>
);

// Styles (المعدلة كما هي في كودك الأخير)
const styles = {
  appContainer: { fontFamily: "'Cairo', 'Segoe UI', sans-serif", backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.5, zIndex: 0 },
  glowingOrb: { position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79,172,254,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' },
  sidebar: { backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(15px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease-in-out', overflow: 'hidden', whiteSpace: 'nowrap' },
  toggleBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#4facfe', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: '0.2s' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '15px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' },
  avatar: { width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a', minWidth: '45px' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', letterSpacing: '1px' },
  navItem: { background: 'transparent', color: '#aaa', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '10px', width: '100%' },
  navItemActive: { background: 'linear-gradient(90deg, rgba(79,172,254,0.2) 0%, transparent 100%)', color: '#4facfe', borderLeft: '3px solid #4facfe', padding: '12px 20px', borderRadius: '0 10px 10px 0', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 'bold', width: '100%' },
  logoutBtn: { marginTop: 'auto', background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', width: '300px' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none', width: '100%' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' },
  statCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  countBadge: { backgroundColor: '#4facfe', color: '#0f172a', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  courseCard: { backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  cardAccent: { height: '4px', width: '100%' },
  typeBadge: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#aaa', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase' },
  metaInfo: { display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.85rem', marginBottom: '20px' },
  viewBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)', transition: '0.3s' },
  actionBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '6px', padding: '5px', cursor: 'pointer', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'fixed', bottom: '40px', right: '40px', width: '65px', height: '65px', borderRadius: '50%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0f172a', fontSize: '30px', border: 'none', boxShadow: '0 0 20px rgba(79, 172, 254, 0.6)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, transition: 'transform 0.2s' },
  notifBadge: { backgroundColor: '#ff4757', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.7rem', fontWeight: 'bold', marginLeft: 'auto' }
};

export default App;
