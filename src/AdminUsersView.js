import React, { useState, useEffect } from 'react';
import API from './api';

const AdminUsersView = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);
    
    // User Data State
    const [userData, setUserData] = useState({ 
        id: null, name: '', email: '', phone: '', password: '', role: 'student' 
    });
    
    const [searchTerm, setSearchTerm] = useState("");

    // --- Helpers ---

    const fetchUsers = () => {
        API.get('/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Failed to load users", err));
    };

    useEffect(() => { fetchUsers(); }, []);

    // Helper to get Badge Colors based on Role
    const getRoleStyle = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return { bg: '#ffd700', color: '#000', label: '🛡️ ADMIN' };
            case 'instructor': return { bg: '#fa709a', color: '#fff', label: '🎓 INSTRUCTOR' };
            case 'student': return { bg: '#4facfe', color: '#fff', label: '👨‍🎓 STUDENT' };
            case 'company': return { bg: '#00e676', color: '#000', label: '🏢 COMPANY' };
            default: return { bg: '#333', color: '#ccc', label: role?.toUpperCase() };
        }
    };

    // --- Form Actions ---

    const openAddForm = () => {
        setUserData({ id: null, name: '', email: '', phone: '', password: '', role: 'student' });
        setIsEditing(false);
        setShowForm(true);
    };

    const openEditForm = (user) => {
        setUserData({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            phone: user.phone || '', 
            password: '', // Reset password field for security
            role: user.role 
        });
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Save Logic (Create & Update) ---

    const handleSaveUser = (e) => {
        e.preventDefault();
        
        // 1. Prepare JSON Payload (Cleaner & Safer than FormData for text)
        const payload = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            // Only include password if the user typed something new
            ...(userData.password ? { password: userData.password } : {})
        };

        if (isEditing) {
            // ✅ UPDATE Request
            // We include ID in the payload or body as required by your backend
            const updatePayload = { ...payload, id: userData.id };

            API.put('/user/update', updatePayload)
               .then(res => {
                   if (res.data.status === 'Success') {
                       alert("User Updated Successfully! ✅");
                       setShowForm(false);
                       fetchUsers(); // Refresh list
                   } else {
                       alert(res.data.message || "Failed to update user.");
                   }
               })
               .catch(err => alert("Error: " + err.message));

        } else {
            // ✅ CREATE Request
            API.post('/admin/add-user', payload)
               .then(res => {
                   if (res.data.status === 'Success') {
                       alert("User Created Successfully! 🎉");
                       setShowForm(false);
                       fetchUsers(); // Refresh list
                   } else {
                       alert(res.data.message || "Failed to create user.");
                   }
               })
               .catch(err => alert("Error: " + err.message));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("⚠️ Are you sure? This cannot be undone.")) {
            API.delete(`/user/delete/${id}`)
                .then(res => {
                    if (res.data.status === "Success") {
                        alert("User Deleted ✅");
                        fetchUsers();
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch(() => alert("Connection Error"));
        }
    };

    // --- Filtering ---

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    );

    // --- Render ---

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0, color: 'white', fontSize:'1.8rem' }}>User Management</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop:'5px' }}>Manage members, companies, and access roles.</p>
                </div>
                
                <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
                    <button onClick={showForm ? () => setShowForm(false) : openAddForm} 
                            style={{...styles.actionBtn, background: showForm ? '#ff6b6b' : '#00e676', color: showForm ? 'white' : '#050810'}}>
                        {showForm ? 'Cancel' : '➕ Add User'}
                    </button>
                    <input
                        placeholder="🔍 Search users..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Form Section */}
            {showForm && (
                <form onSubmit={handleSaveUser} style={styles.formContainer}>
                    <h4 style={{color:'#4facfe', marginTop:0, marginBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'10px'}}>
                        {isEditing ? `✏️ Edit User: ${userData.name}` : '✨ Create New Account'}
                    </h4>
                    
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <div>
                            <label style={styles.label}>Full Name</label>
                            <input placeholder="Ex: Mina Hanna" value={userData.name} onChange={e=>setUserData({...userData, name: e.target.value})} style={styles.sidebarInput} required />
                        </div>
                        <div>
                            <label style={styles.label}>Email Address</label>
                            <input type="email" placeholder="user@example.com" value={userData.email} onChange={e=>setUserData({...userData, email: e.target.value})} style={styles.sidebarInput} required />
                        </div>
                        <div>
                            <label style={styles.label}>Phone Number</label>
                            <input placeholder="+20 123 456 7890" value={userData.phone} onChange={e=>setUserData({...userData, phone: e.target.value})} style={styles.sidebarInput} />
                        </div>
                        <div>
                            <label style={styles.label}>{isEditing ? "New Password (Optional)" : "Password"}</label>
                            <input type="password" placeholder={isEditing ? "Leave blank to keep current" : "Secure Password"} value={userData.password} onChange={e=>setUserData({...userData, password: e.target.value})} style={styles.sidebarInput} required={!isEditing} />
                        </div>
                        <div style={{gridColumn: '1 / -1'}}>
                            <label style={styles.label}>Role / Permissions</label>
                            <select value={userData.role} onChange={e=>setUserData({...userData, role: e.target.value})} style={styles.sidebarInput}>
                                <option value="student">👨‍🎓 Student (Standard Access)</option>
                                <option value="company">🏢 Company (Partner)</option>
                                <option value="instructor">🎓 Instructor (Content Creator)</option>
                                <option value="admin">🛡️ Admin (Full Access)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" style={{...styles.continueBtn, marginTop:'20px'}}>
                        {isEditing ? "Save Changes 💾" : "Create Account 🚀"}
                    </button>
                </form>
            )}

            {/* Table Section */}
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                            <th style={styles.th}>Name / Profile</th>
                            <th style={styles.th}>Contact Info</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => {
                            const roleStyle = getRoleStyle(user.role);
                            return (
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                            <div style={styles.avatar}>
                                                {user.profile_pic ? 
                                                    <img src={user.profile_pic} alt="P" style={{ width: '100%', height: '100%', objectFit:'cover' }} /> 
                                                    : <span style={{fontSize:'1.2rem', color:'#fff'}}>{user.name.charAt(0).toUpperCase()}</span>
                                                }
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</div>
                                                <small style={{color:'#64748b'}}>ID: {user.id}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{color:'#e2e8f0'}}>{user.email}</div>
                                        {user.phone && <div style={{color:'#94a3b8', fontSize:'0.8rem', marginTop:'2px'}}>📞 {user.phone}</div>}
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.roleBadge,
                                            backgroundColor: roleStyle.bg,
                                            color: roleStyle.color
                                        }}>
                                            {roleStyle.label}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {user.id !== currentUser?.id ? (
                                            <div style={{display:'flex', gap:'8px'}}>
                                                <button onClick={() => openEditForm(user)} style={{...styles.iconBtn, background: 'rgba(253, 224, 71, 0.1)', color: '#fde047'}} title="Edit User">✏️</button>
                                                <button onClick={() => handleDelete(user.id)} style={{...styles.iconBtn, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}} title="Delete User">🗑️</button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#4facfe', fontSize: '0.75rem', fontWeight: 'bold', padding:'5px 10px', background:'rgba(79, 172, 254, 0.1)', borderRadius:'6px' }}>⭐ YOU</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="4" style={{padding:'30px', textAlign:'center', color:'#94a3b8'}}>No users found matching your search.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px', paddingLeft:'15px', paddingRight:'15px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', flexWrap:'wrap', gap:'15px', marginTop:'20px' },
    searchInput: { padding: '10px 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none', width: '250px', fontSize: '0.9rem' },
    formContainer: { background: 'rgba(30, 41, 59, 0.6)', padding: '25px', borderRadius: '16px', marginBottom: '30px', border: '1px solid rgba(79, 172, 254, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s' },
    label: { display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' },
    tableWrapper: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: '15px', padding: '20px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    table: { width: '100%', borderCollapse: 'collapse', color: '#ccc', minWidth: '600px' },
    th: { padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight:'700', color: '#64748b' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.03)', transition: '0.2s' },
    td: { padding: '15px', fontSize: '0.9rem', verticalAlign: 'middle' },
    roleBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '0.5px', textTransform:'uppercase' },
    iconBtn: { border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent:'center', fontSize:'1rem' },
    actionBtn: { padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize:'0.9rem', transition: '0.2s' },
    sidebarInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', outline: 'none', boxSizing: 'border-box', transition:'0.3s' },
    continueBtn: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#050810', fontWeight: '900', cursor: 'pointer', transition: '0.3s', fontSize:'1rem' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'2px solid rgba(255,255,255,0.1)' }
};

export default AdminUsersView;
