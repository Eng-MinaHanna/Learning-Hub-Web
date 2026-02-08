import React, { useState, useEffect } from 'react';
import API from './api';

const AdminUsersView = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);
    
    // بيانات المستخدم للفورم (سواء جديد أو تعديل)
    const [userData, setUserData] = useState({ 
        id: null, name: '', email: '', phone: '', password: '', role: 'company' 
    });
    
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = () => {
        API.get('/users').then(res => setUsers(res.data)).catch(() => {});
    };

    useEffect(() => { fetchUsers(); }, []);

    // فتح فورم الإضافة
    const openAddForm = () => {
        setUserData({ id: null, name: '', email: '', phone: '', password: '', role: 'company' });
        setIsEditing(false);
        setShowForm(true);
    };

    // فتح فورم التعديل
    const openEditForm = (user) => {
        setUserData({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            phone: user.phone || '', 
            password: '', 
            role: user.role 
        });
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // حفظ البيانات (إضافة أو تعديل)
    const handleSaveUser = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            const formData = new FormData();
            formData.append('id', userData.id);
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            formData.append('phone', userData.phone);
            formData.append('role', userData.role);
            if(userData.password) formData.append('newPassword', userData.password);

            API.put('/user/update', formData)
               .then(res => {
                   if (res.data.status === 'Success') {
                       alert("User Updated Successfully! ✅");
                       setShowForm(false);
                       fetchUsers();
                   } else {
                       alert(res.data.message || "Failed to update");
                   }
               });

        } else {
            API.post('/admin/add-user', userData)
               .then(res => {
                   if (res.data.status === 'Success') {
                       alert("User Created Successfully! 🎉");
                       setShowForm(false);
                       fetchUsers();
                   } else {
                       alert(res.data.message);
                   }
               });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("⚠️ Are you sure? This cannot be undone.")) {
            API.delete(`/user/delete/${id}`)
                .then(res => {
                    if (res.data.status === "Success") {
                        alert("Deleted ✅");
                        fetchUsers();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch(() => alert("Connection Error"));
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
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Manage members, companies, and roles.</p>
                </div>
                
                <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
                    <button onClick={showForm ? () => setShowForm(false) : openAddForm} 
                            style={{...styles.actionBtn, background: showForm ? '#ff6b6b' : '#00e676', color: showForm ? 'white' : '#050810'}}>
                        {showForm ? 'Cancel' : '➕ Add User'}
                    </button>
                    <input
                        placeholder="🔍 Search..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSaveUser} style={styles.formContainer}>
                    <h4 style={{color:'#4facfe', marginTop:0, marginBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px'}}>
                        {isEditing ? `✏️ Edit User: ${userData.name}` : '✨ Create New Account'}
                    </h4>
                    
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div>
                            <label style={styles.label}>Full Name</label>
                            <input placeholder="Name" value={userData.name} onChange={e=>setUserData({...userData, name: e.target.value})} style={styles.sidebarInput} required />
                        </div>
                        <div>
                            <label style={styles.label}>Email Address</label>
                            <input placeholder="Email" value={userData.email} onChange={e=>setUserData({...userData, email: e.target.value})} style={styles.sidebarInput} required />
                        </div>
                        <div>
                            <label style={styles.label}>Phone</label>
                            <input placeholder="Phone" value={userData.phone} onChange={e=>setUserData({...userData, phone: e.target.value})} style={styles.sidebarInput} />
                        </div>
                        <div>
                            <label style={styles.label}>{isEditing ? "New Password (Optional)" : "Password"}</label>
                            <input type="password" placeholder={isEditing ? "Leave blank to keep" : "Password"} value={userData.password} onChange={e=>setUserData({...userData, password: e.target.value})} style={styles.sidebarInput} required={!isEditing} />
                        </div>
                        <div style={{gridColumn: '1 / -1'}}>
                            <label style={styles.label}>Role</label>
                            <select value={userData.role} onChange={e=>setUserData({...userData, role: e.target.value})} style={styles.sidebarInput}>
                                <option value="company">🏢 Company</option>
                                <option value="instructor">🎓 Instructor</option>
                                <option value="student">👨‍🎓 Student</option>
                                <option value="admin">🛡️ Admin</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" style={{...styles.continueBtn, marginTop:'20px'}}>
                        {isEditing ? "Save Changes 💾" : "Create Account 🚀"}
                    </button>
                </form>
            )}

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                            {user.profile_pic ? <img src={user.profile_pic} alt="P" style={{ width: '100%', height: '100%' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>{user.name.charAt(0)}</div>}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</div>
                                            <small style={{color:'#64748b'}}>Joined: {new Date(user.created_at).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{color:'#ccc'}}>{user.email}</div>
                                    {user.phone && <div style={{color:'#64748b', fontSize:'0.8rem'}}>📞 {user.phone}</div>}
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
                                    {user.id !== currentUser?.id ? (
                                        <div style={{display:'flex', gap:'8px'}}>
                                            <button onClick={() => openEditForm(user)} style={{...styles.iconBtn, background: 'rgba(253, 224, 71, 0.1)', color: '#fde047'}} title="Edit">✏️</button>
                                            <button onClick={() => handleDelete(user.id)} style={{...styles.iconBtn, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}} title="Delete">🗑️</button>
                                        </div>
                                    ) : (
                                        <span style={{ color: '#4facfe', fontSize: '0.8rem', fontWeight: 'bold' }}>⭐ YOU</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', flexWrap:'wrap', gap:'15px' },
    searchInput: { padding: '10px 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '250px', fontSize: '0.9rem' },
    formContainer: { background: 'rgba(30, 41, 59, 0.6)', padding: '25px', borderRadius: '16px', marginBottom: '30px', border: '1px solid rgba(79, 172, 254, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s' },
    label: { display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '15px', padding: '20px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse', color: '#ccc' },
    th: { padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' },
    td: { padding: '15px', fontSize: '0.9rem', verticalAlign: 'middle' },
    roleBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.5px' },
    iconBtn: { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '5px', fontSize:'0.8rem' },
    actionBtn: { padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize:'0.9rem' },
    sidebarInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', boxSizing: 'border-box' },
    continueBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#050810', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
};

export default AdminUsersView;
