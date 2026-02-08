import React, { useEffect, useState } from 'react';
import API from './api'; 
import './App.css'; 
import AddCourseModal from './AddCourseModal';
import CourseDetailsModal from './CourseDetailsModal';
import EditActivityModal from './EditActivityModal';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import CalendarView from './CalendarView';
import CommunityView from './CommunityView';
import NotificationsModal from './NotificationsModal';
import SponsorsPartnersBoard from './SponsorsPartnersBoard'; 
import AdminUsersView from './AdminUsersView';
import SettingsView from './SettingsView';
import LeaderboardView from './LeaderboardView';
import Sidebar from './Sidebar';
import LoadingEffect from './LoadingEffect';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ieee_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const [activities, setActivities] = useState([]); 
  const [stats, setStats] = useState({ total_activities: 0, total_students: 0, total_workshops: 0 });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentView, setCurrentView] = useState(() => {
      return localStorage.getItem('activeView') || 'home';
  });

  const [progressData, setProgressData] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
      else setIsSidebarOpen(false); // Close on mobile resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeView', currentView);
    if (isMobile) setIsSidebarOpen(false);
  }, [currentView, isMobile]);

  useEffect(() => {
      if (user?.role === 'company' && currentView === 'home') {
          setCurrentView('leaderboard');
      }
  }, [user, currentView]);

  const fetchData = async () => {
    if (activities.length === 0) setLoading(true); 
    try {
      const actsRes = await API.get('/activities/all');
      const data = Array.isArray(actsRes.data) ? actsRes.data : [];
      setActivities(data);

      const savedCourseId = localStorage.getItem('activeCourseId');
      if (savedCourseId) {
          const courseToRestore = data.find(c => c.id == savedCourseId);
          if (courseToRestore) setSelectedCourse(courseToRestore);
      }

      if (user?.email && user.role !== 'company') {
        const promises = data.map(course => 
           API.get(`/progress/calculate/${course.id}/${user.email}`)
             .then(res => ({id: course.id, val: res.data?.percent || 0}))
             .catch(()=>null)
        );
        const results = await Promise.all(promises);
        const newProgress = {};
        results.forEach(r => { if(r) newProgress[r.id] = r.val });
        setProgressData(newProgress);

        if (user.role === 'admin') {
          API.get('/stats').then(res => setStats(res.data || stats));
        }
        checkNotifications();
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [user?.id]);

  const handleLogout = () => { setUser(null); localStorage.clear(); setCurrentView('home'); };

  const handleUserUpdate = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('ieee_user', JSON.stringify(newUser));
  };

  const filteredActivities = (activities || []).filter(act =>
    act?.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (window.confirm("⚠️ Confirm Delete?")) {
      try { await API.delete(`/activities/delete/${id}`); fetchData(); } 
      catch (err) { alert("Error deleting"); }
    }
  };

  if (!user) {
    return (
      <div style={styles.appContainer}>
        <div style={styles.backgroundGrid}></div>
        {showAuth ? <AuthPage onLogin={(u) => {setUser(u); setShowAuth(false);}} /> : <LandingPage onGetStarted={() => setShowAuth(true)} />}
      </div>
    );
  }

  if (loading && activities.length === 0) {
      return (
          <div style={styles.loadingContainer}>
              <LoadingEffect message="INITIALIZING SYSTEM..." />
          </div>
      );
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.backgroundGrid}></div>
      
      {/* ✅ الزرار المعدل: يتحرك بذكاء مع الـ Sidebar */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        style={{
          ...styles.toggleBtn, 
          left: (isSidebarOpen && !isMobile) ? '290px' : '20px', 
        }}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        
        <Sidebar 
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          user={user}
          currentView={currentView}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />

        <main style={{ 
          ...styles.mainArea, 
          marginLeft: (isSidebarOpen && !isMobile) ? '280px' : '0px',
          width: (isSidebarOpen && !isMobile) ? 'calc(100% - 280px)' : '100%'
        }}>
          <div style={styles.pageHeader}>
             {currentView === 'dashboard' && !selectedCourse && user.role !== 'company' && (
                <h1 style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}! ⚡</h1>
             )}
             {user.role === 'company' && currentView === 'leaderboard' && (
                <h1 style={styles.welcomeText}>Welcome, {user.name} 👋 <span style={{fontSize:'1rem', color:'#888'}}>Explore our talents</span></h1>
             )}
             {currentView === 'dashboard' && !selectedCourse && (
               <div style={styles.searchContainer}>
                  <input placeholder="Search tracks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
               </div>
             )}
          </div>
          
          {currentView === 'dashboard' && !selectedCourse && user.role !== 'company' && (
            <div style={styles.contentFadeIn}>
              <div style={styles.statsGrid}>
                <DashboardCard title="Total Tracks" value={stats.total_activities} icon="📚" color="#4facfe" />
                <DashboardCard title="Total Students" value={stats.total_students} icon="👨‍🎓" color="#43e97b" />
                <DashboardCard title="Workshops" value={stats.total_workshops} icon="⚡" color="#fa709a" />
              </div>

              <div style={styles.coursesGrid}>
                {filteredActivities.map(act => (
                  <div key={act.id} style={styles.courseCard} className="hover-card">
                    <div style={styles.imageBox}>
                       {act.file_path ? <img src={act.file_path} alt="C" style={styles.courseImg} /> : <div style={styles.coursePlaceholder}>IEEE</div>}
                       <div style={styles.typeBadge}>{act.type}</div>
                    </div>
                    <div style={{ padding: '20px' }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                          <h3 style={styles.courseTitle}>{act.title}</h3>
                          {(user.role === 'admin' || (user.role === 'instructor' && act.created_by === user.id)) && (
                            <div style={{display: 'flex', gap: '8px'}}>
                                <button onClick={() => setEditingActivity(act)} style={styles.editBtnSmall}>✏️</button>
                                <button onClick={() => handleDelete(act.id)} style={styles.deleteBtnSmall}>🗑️</button>
                            </div>
                          )}
                      </div>
                      <div style={styles.progressSection}>
                          <div style={styles.progressText}>Progress: {progressData[act.id] || 0}%</div>
                          <div style={styles.barBg}><div style={{...styles.barFill, width: `${progressData[act.id] || 0}%`}}></div></div>
                      </div>
                      <button onClick={() => handleOpenCourse(act)} style={styles.continueBtn}>Continue ▶️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'team' && <TeamView />}
          {currentView === 'leaderboard' && <LeaderboardView />}
          {currentView === 'home' && <LandingPage user={user} onGetStarted={() => setCurrentView('dashboard')} />}
          {currentView === 'schedule' && <CalendarView onOpenCourse={(c)=>setSelectedCourse(activities.find(a=>a.id===c))} />}
          {currentView === 'users' && <AdminUsersView currentUser={user} />}
          {currentView === 'community' && <CommunityView />}
          {currentView === 'sponsors' && user.role === 'admin' && <SponsorsPartnersBoard />}
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
      <div style={styles.statLabel}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  </div>
);

// ✅ الأنماط المحدثة (Styles)
const styles = {
  appContainer: { fontFamily: "'Cairo', sans-serif", backgroundColor: '#050810', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(79, 172, 254, 0.03) 2px, transparent 2px)', backgroundSize: '50px 50px', zIndex: 0 },
  loadingContainer: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#050810', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  mainArea: { padding: '40px 20px', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', zIndex: 1, minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px', paddingLeft: '70px', paddingTop: '10px' },
  welcomeText: { color: 'white', margin: 0, fontSize: '1.6rem', fontWeight: '800' },
  searchContainer: { background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', width: '280px' },
  searchInput: { background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '50px' },
  statCard: { background: 'rgba(15, 23, 42, 0.4)', padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' },
  statLabel: { color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: '1.8rem', fontWeight: '900', color: 'white' },
  coursesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  courseCard: { backgroundColor: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' },
  imageBox: { position: 'relative', height: '180px' },
  courseImg: { width: '100%', height: '100%', objectFit: 'cover' },
  coursePlaceholder: { width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4facfe', fontWeight: '900', fontSize: '2rem' },
  typeBadge: { position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(15, 23, 42, 0.8)', padding: '5px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', color: '#4facfe', backdropFilter: 'blur(5px)' },
  courseTitle: { color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: '700' },
  progressSection: { margin: '20px 0' },
  progressText: { fontSize: '11px', color: '#64748b', marginBottom: '8px' },
  barBg: { width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' },
  barFill: { height: '100%', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', borderRadius: '10px', transition: '1s ease' },
  continueBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#050810', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
  deleteBtnSmall: { width: '35px', height:'35px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  editBtnSmall: { width: '35px', height:'35px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  
  // ✅ ستايل زر التبديل العصري مع خاصية التحرك الذكي
  toggleBtn: { 
    position: 'fixed', 
    zIndex: 3000, 
    top: '20px',
    background: 'rgba(79, 172, 254, 0.9)', 
    backdropFilter: 'blur(5px)',
    color: '#050810', 
    border: 'none', 
    borderRadius: '12px', 
    width: '45px', 
    height: '45px', 
    cursor: 'pointer', 
    fontSize: '1.4rem', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    boxShadow: '0 4px 15px rgba(79,172,254,0.3)', 
    transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)' // نفس سرعة الـ Sidebar
  },
  
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '65px', height: '65px', borderRadius: '22px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#050810', fontSize: '35px', border: 'none', cursor: 'pointer', boxShadow: '0 15px 30px rgba(79,172,254,0.5)', zIndex:100, fontWeight: 'bold' }
};

export default App;
