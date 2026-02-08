import React, { useState, useEffect } from 'react';
import API from './api';

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
                   alert("User/Company Created Successfully! 🎉");
                   setShowAddForm(false);
                   setNewUser({ name: '', email: '', phone: '', password: '', role: 'company' });
                   fetchUsers();
               } else {
                   alert(res.data.message);
               }
           });
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete User?")) {
            // (تأكد إنك ضايف مسار حذف المستخدمين في السيرفر لو مش موجود)
            // حالياً هنخفيها من الواجهة بس كمثال
            alert("Delete feature requires API implementation"); 
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
                <h2 style={{ color: 'white', margin:0 }}>👥 User Management</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{...styles.actionBtn, background:'#00e676', color:'#050810'}}>
                    {showAddForm ? 'Cancel' : '➕ Add Company/User'}
                </button>
            </div>

            {/* فورم إضافة شركة/مستخدم جديد */}
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
    const handleRoleChange = (id, newRole) => {
        if (window.confirm(`Change role to ${newRole}?`)) {
            // ✅ تم التعديل هنا ليتوافق مع السيرفر والسنترال
            API.put(`/users/role/${id}`, { role: newRole })
                .then(() => {
                    fetchUsers();
                })
                .catch(err => alert("Error updating role"));
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: 'white' }}>👮‍♂️ User Management</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>View and manage all registered members.</p>
                </div>
                <input
                    placeholder="🔍 Search name, email or phone..."
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Contact Info</th>
                            <th style={styles.th}>Phone (WhatsApp)</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</div>
                                    <small style={{ color: '#64748b' }}>Joined: {new Date(user.created_at).toLocaleDateString()}</small>
                                </td>
                                <td style={styles.td}>{user.email}</td>

                                <td style={styles.td}>
                                    {user.phone ? (
                                        <a
                                            href={`https://wa.me/2${user.phone}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={styles.whatsappLink}
                                            title="Click to chat on WhatsApp"
                                        >
                                            {user.phone} <span style={{ fontSize: '1.1rem' }}>💬</span>
                                        </a>
                                    ) : (
                                        <span style={{ color: '#475569', fontStyle: 'italic' }}>Not provided</span>
                                    )}
                                </td>

                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        backgroundColor: user.role === 'admin' ? '#ffd700' : (user.role === 'instructor' ? '#fa709a' : '#4facfe'),
                                        color: '#000'
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>

                                <td style={styles.td}>
                                    {user.id !== currentUser.id ? (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <select
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                style={styles.roleSelect}
                                                value={user.role}
                                            >
                                                <option value="student">Student</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button onClick={() => handleDelete(user.id)} style={styles.deleteBtn} title="Delete User">🗑️</button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#4facfe', fontSize: '0.8rem', fontWeight: 'bold' }}>⭐ YOU</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No users found matching your search.</div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
    searchInput: { padding: '12px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '300px', fontSize: '0.9rem' },
    tableWrapper: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '15px', padding: '20px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', color: '#ccc' },
    th: { padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' },
    td: { padding: '15px', fontSize: '0.9rem' },
    whatsappLink: { color: '#25D366', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s', padding: '5px 0' },
    roleBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.5px' },
    roleSelect: { padding: '6px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', color: 'white', cursor: 'pointer', fontSize: '0.8rem', outline: 'none' },
    deleteBtn: { background: 'rgba(255, 99, 99, 0.1)', color: '#ff6b6b', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center' }
};

export default AdminUsersView;
