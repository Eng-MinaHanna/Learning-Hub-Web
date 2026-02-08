import React, { useEffect, useState } from 'react';
import API from './api'; 
import AddCourseModal from './AddCourseModal';
import CourseDetailsModal from './CourseDetailsModal';
import EditActivityModal from './EditActivityModal';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import CalendarView from './CalendarView';
import CommunityView from './CommunityView';
import NotificationsModal from './NotificationsModal';

// ⚠️ تم إزالة الـ imports المتكررة (AdminUsersView, SettingsView, LeaderboardView) لأنهم مكتوبين تحت في نفس الملف

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
  }, [user]);

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

  const checkNotifications = () => {
    if (!user?.id) return;
    API.get(`/notifications/${user.id}`)
      .then(res => setUnreadCount(Array.isArray(res.data) ? res.data.filter(n => !n.is_read).length : 0))
      .catch(() => {});
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user?.id]);

  const handleLogout = () => {
    setUser(null); localStorage.clear(); setCurrentView('home');
  };

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
        {showAuth ? <AuthPage onLogin={(u) => {setUser(u); setShowAuth(false);}} /> : <LandingPage onGetStarted={() => setShowAuth(true)} />}
      </div>
    );
  }

  if (loading && activities.length === 0) {
      return (
          <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <h3 style={{color: '#4facfe', marginTop: '20px', letterSpacing: '2px', fontFamily: 'monospace'}}>INITIALIZING SYSTEM...</h3>
          </div>
      );
  }

  return (
    <div style={styles.appContainer}>
      <div style={styles.backgroundGrid}></div>
      
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{
          ...styles.toggleBtn, 
          left: isSidebarOpen && !isMobile ? '300px' : '20px', 
          top: '25px'
      }}>
        {isSidebarOpen ? '◀' : '☰'}
      </button>

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        
        <aside style={{ 
          ...styles.sidebar, 
          width: isSidebarOpen ? '280px' : '0px', 
          transform: (isMobile && !isSidebarOpen) ? 'translateX(-100%)' : 'translateX(0)',
          visibility: (!isSidebarOpen && !isMobile) ? 'hidden' : 'visible'
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
            {user.role !== 'company' && <NavBtn icon="🏠" label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />}
            
            <NavBtn icon="💎" label={user.role === 'company' ? "Find Talent (CVs)" : "Top Performances"} active={currentView === 'leaderboard'} onClick={() => setCurrentView('leaderboard')} />
            
            <NavBtn icon="🎖️" label="Our Team" active={currentView === 'team'} onClick={() => setCurrentView('team')} />

            {user.role !== 'company' && (
                <>
                    <NavBtn icon="📊" label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
                    <NavBtn icon="📅" label="Schedule" active={currentView === 'schedule'} onClick={() => setCurrentView('schedule')} />
                    <NavBtn icon="🌍" label="Community" active={currentView === 'community'} onClick={() => setCurrentView('community')} />
                </>
            )}

            {user?.role === 'admin' && <NavBtn icon="👥" label="Admin Panel" active={currentView === 'users'} onClick={() => setCurrentView('users')} />}
            <NavBtn icon="⚙️" label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
            
            <div style={{marginTop: 'auto', paddingTop: '10px'}}>
                <div style={{...styles.divider, margin: '5px 0'}}></div>
                <NavBtn 
                    icon="🌐" 
                    label="Main Website" 
                    active={false} 
                    onClick={() => window.open('https://studentbranches.ieee.org/eg-hiet-sb/', '_blank')} 
                />
                <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
            </div>
          </nav>
        </aside>

        <main style={{ 
          ...styles.mainArea, 
          marginLeft: (isSidebarOpen && !isMobile) ? '280px' : '0px',
          width: (isSidebarOpen && !isMobile) ? 'calc(100% - 280px)' : '100%'
        }}>
          <div style={{ 
              ...styles.pageHeader, 
              paddingLeft: '70px',  
              marginTop: isMobile ? '10px' : '0'     
          }}>
             {currentView === 'dashboard' && !selectedCourse && user.role !== 'company' && (
                <h1 style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0]}! ⚡</h1>
             )}
             {user.role === 'company' && currentView === 'leaderboard' && (
                <h1 style={styles.welcomeText}>Welcome, {user.name} 👋 <span style={{fontSize:'1rem', color:'#888'}}>Explore our top talents</span></h1>
             )}
             {currentView === 'dashboard' && (
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
                  <div key={act.id} style={styles.courseCard}>
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

const AdminUsersView = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'company' });

    const fetchUsers = () => {
        API.get('/users').then(res => setUsers(res.data)).catch(() => {});
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreateUser = (e) => {
        e.preventDefault();
        API.post('/admin/add-user', newUser)
           .then(res => {
               if (res.data.status === 'Success') {
                   alert("User Created Successfully! 🎉");
                   setShowAddForm(false);
                   setNewUser({ name: '', email: '', phone: '', password: '', role: 'company' });
                   fetchUsers();
               } else {
                   alert(res.data.message);
               }
           });
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                <h2 style={{ color: 'white', margin:0 }}>👥 User Management</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{...styles.actionBtn, background:'#00e676', color:'#050810'}}>
                    {showAddForm ? 'Cancel' : '➕ Add Company/User'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleCreateUser} style={{background:'rgba(255,255,255,0.05)', padding:'20px', borderRadius:'15px', marginBottom:'30px', border:'1px solid #4facfe'}}>
                    <h4 style={{color:'#4facfe', marginTop:0}}>Create New Account</h4>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                        <input placeholder="Name (e.g. Vodafone)" value={newUser.name} onChange={e=>setNewUser({...newUser, name: e.target.value})} style={styles.sidebarInput} required />
                        <input placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email: e.target.value})} style={styles.sidebarInput} required />
                        <input placeholder="Phone" value={newUser.phone} onChange={e=>setNewUser({...newUser, phone: e.target.value})} style={styles.sidebarInput} />
                        <input placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} style={styles.sidebarInput} required />
                        <select value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})} style={styles.sidebarInput}>
                            <option value="company">🏢 Company</option>
                            <option value="instructor">🎓 Instructor</option>
                            <option value="student">👨‍🎓 Student</option>
                            <option value="admin">🛡️ Admin</option>
                        </select>
                    </div>
                    <button type="submit" style={{...styles.continueBtn, marginTop:'15px', width:'auto', padding:'10px 30px'}}>Create Account</button>
                </form>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
                            <th style={{ padding: '15px' }}>User</th>
                            <th style={{ padding: '15px' }}>Role</th>
                            <th style={{ padding: '15px' }}>Email</th>
                            <th style={{ padding: '15px' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                        {u.profile_pic ? <img src={u.profile_pic} alt="P" style={{ width: '100%', height: '100%' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>{u.name.charAt(0)}</div>}
                                    </div>
                                    {u.name}
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ 
                                        padding: '5px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
                                        background: u.role === 'admin' ? 'rgba(255, 215, 0, 0.1)' : u.role === 'company' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(79, 172, 254, 0.1)',
                                        color: u.role === 'admin' ? '#ffd700' : u.role === 'company' ? '#00e676' : '#4facfe'
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: '#aaa' }}>{u.email}</td>
                                <td style={{ padding: '15px', color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SettingsView = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
      name: user.name || '', email: user.email || '', phone: user.phone || '',
      oldPassword: '', newPassword: '', 
      linkedin: user.linkedin || '', cv_link: user.cv_link || '', job_title: user.job_title || ''
  });
  const [avatar, setAvatar] = useState(null);

  const handleSubmit = async (e) => {
      e.preventDefault();
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('id', user.id);
      if (avatar) data.append('avatar', avatar);

      try {
          const res = await API.put('/user/update', data);
          if (res.data.status === 'Success') {
              alert("Profile Updated! ✅");
              onUpdateUser({ ...formData, profile_pic: res.data.newProfilePic || user.profile_pic });
          } else { alert(res.data.message || "Failed"); }
      } catch (e) { alert("Error updating"); }
  };

  return (
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.5)', padding: '30px', borderRadius: '20px' }}>
          <h2 style={{ color: '#4facfe', marginBottom: '20px' }}>⚙️ Profile Settings</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{textAlign:'center', marginBottom:'10px'}}>
                  <div style={{width:'80px', height:'80px', borderRadius:'50%', overflow:'hidden', margin:'0 auto', border:'2px solid #4facfe'}}>
                      {avatar ? <img src={URL.createObjectURL(avatar)} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="P"/> : <img src={user.profile_pic} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="P"/>}
                  </div>
                  <input type="file" onChange={e => setAvatar(e.target.files[0])} style={{marginTop:'10px', fontSize:'0.8rem'}} />
              </div>
              <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.sidebarInput} />
              <input placeholder="Job Title (e.g. React Developer)" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} style={styles.sidebarInput} />
              <input placeholder="LinkedIn Profile URL" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} style={styles.sidebarInput} />
              <input placeholder="CV / Portfolio Link" value={formData.cv_link} onChange={e => setFormData({...formData, cv_link: e.target.value})} style={styles.sidebarInput} />
              <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.sidebarInput} disabled />
              <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={styles.sidebarInput} />
              <hr style={{borderColor:'rgba(255,255,255,0.1)', width:'100%'}}/>
              <input type="password" placeholder="Old Password" value={formData.oldPassword} onChange={e => setFormData({...formData, oldPassword: e.target.value})} style={styles.sidebarInput} />
              <input type="password" placeholder="New Password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} style={styles.sidebarInput} />
              <button type="submit" style={styles.continueBtn}>Update Profile</button>
          </form>
      </div>
  );
};

const LeaderboardView = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => { API.get('/leaderboard').then(res => setUsers(res.data)).catch(() => {}); }, []);

  return (
      <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#ffd700', fontSize: '2rem' }}>🏆 Top Talent & Performers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {users.map((u, idx) => {
                  const totalPoints = (u.video_points || 0) + (u.quiz_points || 0) + (u.post_points || 0) + (u.comment_points || 0);
                  return (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: idx === 0 ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(30, 41, 59, 0.6))' : 'rgba(30, 41, 59, 0.6)', padding: '15px 25px', borderRadius: '15px', border: idx === 0 ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#64748b', width: '30px' }}>#{idx + 1}</div>
                              <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                                  {u.profile_pic ? <img src={u.profile_pic} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{u.name.charAt(0)}</div>}
                              </div>
                              <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{u.name} {idx === 0 && '👑'}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#4facfe' }}>{u.job_title || 'Student Member'}</div>
                              </div>
                          </div>
                          
                          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                              {u.linkedin && <a href={u.linkedin} target="_blank" rel="noreferrer" title="LinkedIn Profile" style={{fontSize:'1.5rem', textDecoration:'none', cursor:'pointer'}}>🔗</a>}
                              {u.cv_link && <a href={u.cv_link} target="_blank" rel="noreferrer" title="View CV" style={{fontSize:'1.5rem', textDecoration:'none', cursor:'pointer'}}>📄</a>}
                              
                              <div style={{ textAlign: 'right', borderLeft:'1px solid rgba(255,255,255,0.1)', paddingLeft:'15px' }}>
                                  <div style={{ fontWeight: '900', color: '#4facfe', fontSize: '1.2rem' }}>{totalPoints}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>POINTS</div>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
  );
};

const TeamView = () => {
    const [team, setTeam] = useState([]);
    useEffect(() => {
        API.get('/team').then(res => setTeam(res.data)).catch(() => {});
    }, []);

    const admins = team.filter(m => m.role === 'admin');
    const instructors = team.filter(m => m.role === 'instructor');

    const MemberCard = ({ m }) => (
        <div style={{background: 'rgba(30, 41, 59, 0.4)', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
            <div style={{width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', marginBottom: '15px', border: `3px solid ${m.role === 'admin' ? '#ffd700' : '#4facfe'}`}}>
                {m.profile_pic ? <img src={m.profile_pic} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="P" /> : <div style={{width:'100%', height:'100%', background:'#333', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'#fff'}}>{m.name.charAt(0)}</div>}
            </div>
            <h3 style={{margin: '0 0 5px 0', color: 'white', fontSize: '1.1rem'}}>{m.name}</h3>
            <span style={{fontSize: '0.75rem', color: m.role === 'admin' ? '#ffd700' : '#4facfe', background: m.role === 'admin' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(79, 172, 254, 0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', letterSpacing: '1px'}}>{m.role.toUpperCase()}</span>
        </div>
    );

    return (
        <div style={{paddingBottom: '50px', animation: 'fadeIn 0.5s ease'}}>
            <h2 style={{color: 'white', marginBottom: '40px', borderLeft: '5px solid #4facfe', paddingLeft: '15px', fontSize: '2rem'}}>🏆 Meet Our Heroes</h2>
            {admins.length > 0 && (
                <>
                    <h3 style={{color: '#ffd700', margin: '20px 0 20px', fontSize: '1.4rem', borderBottom: '1px solid rgba(255, 215, 0, 0.2)', paddingBottom: '10px', display: 'inline-block'}}>High Board & Admins</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px', marginBottom: '50px'}}>
                        {admins.map((m, i) => <MemberCard key={i} m={m} />)}
                    </div>
                </>
            )}
            {instructors.length > 0 && (
                <>
                    <h3 style={{color: '#4facfe', margin: '20px 0 20px', fontSize: '1.4rem', borderBottom: '1px solid rgba(79, 172, 254, 0.2)', paddingBottom: '10px', display: 'inline-block'}}>Technical Instructors</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px'}}>
                        {instructors.map((m, i) => <MemberCard key={i} m={m} />)}
                    </div>
                </>
            )}
        </div>
    );
};

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={active ? styles.navActive : styles.navInactive}>
    <span style={{fontSize: '1.2rem'}}>{icon}</span>
    {label}
  </button>
);

const DashboardCard = ({ title, value, icon, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `5px solid ${color}` }}>
    <div style={{ ...styles.iconCircle, backgroundColor: `${color}22`, color: color }}>{icon}</div>
    <div>
      <div style={styles.statLabel}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  </div>
);

const styles = {
  appContainer: { fontFamily: "'Cairo', sans-serif", backgroundColor: '#050810', color: 'white', minHeight: '100vh', position: 'relative', overflowX: 'hidden' },
  backgroundGrid: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(79, 172, 254, 0.03) 2px, transparent 2px)', backgroundSize: '50px 50px', zIndex: 0 },
  loadingContainer: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#050810', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  spinner: { width: '50px', height: '50px', border: '5px solid rgba(79, 172, 254, 0.2)', borderTop: '5px solid #4facfe', borderRadius: '50%', animation: 'spin 1s linear infinite' },
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
  mainArea: { padding: '40px 20px', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', zIndex: 1, minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' },
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
  toggleBtn: { position: 'fixed', zIndex: 3000, background: '#4facfe', color: '#050810', border: 'none', borderRadius: '10px', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(79,172,254,0.4)', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '65px', height: '65px', borderRadius: '22px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#050810', fontSize: '35px', border: 'none', cursor: 'pointer', boxShadow: '0 15px 30px rgba(79,172,254,0.5)', zIndex:100, fontWeight: 'bold' },
  actionBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  sidebarInput: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' },
  continueBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#050810', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
};

export default App;
