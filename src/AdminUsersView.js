import React, { useState, useEffect } from 'react';
import API from './api';

const AdminUsersView = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'company' });
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = () => {
        API.get('/users').then(res => setUsers(res.data)).catch(() => {});
    };

    useEffect(() => { fetchUsers(); }, []);

    // ✅ دالة إضافة مستخدم/شركة جديد
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

    // ✅ دالة حذف المستخدم
    const handleDelete = (id) => {
        if (window.confirm("⚠️ Are you sure you want to delete this user? This action cannot be undone.")) {
            API.delete(`/user/delete/${id}`)
                .then(res => {
                    if (res.data.status === "Success") {
                        alert("User Deleted ✅");
                        fetchUsers();
                    } else {
                        alert(res.data.message || "Error deleting user");
                    }
                })
                .catch(() => alert("Connection Error"));
        }
    };

    // ✅ دالة تغيير الرتبة (Role)
    const handleRoleChange = (id, newRole) => {
        if (window.confirm(`Change role to ${newRole}?`)) {
            // ملاحظة: تأكد إن عندك في السيرفر مسار لتحديث الرتبة، أو استخدم مسار التحديث العادي
            // لو مش موجود، ممكن نستخدم مسار التحديث العام /user/update
            // هنا بفترض إنك عندك مسار مخصص أو بتستخدم التحديث العام
            alert("Role update feature requires API implementation or use general update endpoint.");
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
                
                <div style={{display:'flex', gap:'15px'}}>
                    <button onClick={() => setShowAddForm(!showAddForm)} style={{...styles.actionBtn, background:'#00e676', color:'#050810'}}>
                        {showAddForm ? 'Cancel' : '➕ Add User/Company'}
                    </button>
                    <input
                        placeholder="🔍 Search..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* ✅ فورم إضافة شركة/مستخدم جديد */}
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
                                        <a href={`https://wa.me/2${user.phone}`} target="_blank" rel="noreferrer" style={styles.whatsappLink} title="Click to chat on WhatsApp">
                                            {user.phone} <span style={{ fontSize: '1.1rem' }}>💬</span>
                                        </a>
                                    ) : <span style={{ color: '#475569', fontStyle: 'italic' }}>Not provided</span>}
                                </td>

                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.roleBadge,
                                        backgroundColor: user.role === 'admin' ? '#ffd700' : (user.role === 'instructor' ? '#fa709a' : (user.role === 'company' ? '#00e676' : '#4facfe')),
                                        color: '#000'
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>

                                <td style={styles.td}>
                                    {user.id !== currentUser.id ? (
                                        <button onClick={() => handleDelete(user.id)} style={styles.deleteBtn} title="Delete User">🗑️ Delete</button>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', flexWrap:'wrap', gap:'15px' },
    searchInput: { padding: '10px 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '250px', fontSize: '0.9rem' },
    tableWrapper: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '15px', padding: '20px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', color: '#ccc' },
    th: { padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' },
    td: { padding: '15px', fontSize: '0.9rem' },
    whatsappLink: { color: '#25D366', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s', padding: '5px 0' },
    roleBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.5px' },
    deleteBtn: { background: 'rgba(255, 99, 99, 0.1)', color: '#ff6b6b', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center' },
    actionBtn: { padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize:'0.9rem' },
    sidebarInput: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' },
    continueBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#050810', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
};

export default AdminUsersView;
