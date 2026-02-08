import React, { useState, useEffect } from 'react';
import API from './api'; // تأكد من مسار ملف الـ API

const SponsorsPartnersBoard = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'partner', // default
        website_link: '',
        logoFile: null
    });

    // جلب البيانات
    const fetchItems = () => {
        API.get('/public/sponsors') // الـ API الجديد
            .then(res => {
                setItems(res.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // التعامل مع الإضافة
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('website_link', formData.website_link);
        if (formData.logoFile) {
            data.append('logo', formData.logoFile);
        }

        API.post('/admin/sponsors/add', data)
            .then(res => {
                if (res.data.status === 'Success') {
                    alert('Added Successfully! ✅');
                    setFormData({ name: '', type: 'partner', website_link: '', logoFile: null }); // Reset
                    fetchItems(); // Refresh
                } else {
                    alert('Failed to add');
                }
            })
            .catch(err => alert('Error uploading'));
    };

    // التعامل مع الحذف
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            API.delete(`/admin/sponsors/delete/${id}`)
                .then(res => {
                    if (res.data.status === 'Deleted') fetchItems();
                });
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ color: 'white', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                🤝 Manage Partners & Sponsors
            </h2>

            {/* --- Form Section --- */}
            <div style={styles.formCard}>
                <h4 style={{ color: '#4facfe', marginTop: 0 }}>Add New Entity</h4>
                <form onSubmit={handleSubmit} style={styles.formGrid}>
                    
                    <div>
                        <label style={styles.label}>Name</label>
                        <input 
                            style={styles.input} 
                            placeholder="Ex: Google, Vodafone..." 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Type</label>
                        <select 
                            style={styles.input} 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="partner">🤝 Partner (Strategic)</option>
                            <option value="sponsor">💎 Sponsor (Funder)</option>
                        </select>
                    </div>

                    <div>
                        <label style={styles.label}>Website Link (Optional)</label>
                        <input 
                            style={styles.input} 
                            placeholder="https://..." 
                            value={formData.website_link}
                            onChange={(e) => setFormData({...formData, website_link: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Logo Image</label>
                        <input 
                            type="file" 
                            style={{...styles.input, paddingTop: '10px'}} 
                            onChange={(e) => setFormData({...formData, logoFile: e.target.files[0]})}
                            required
                        />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" style={styles.addBtn}>➕ Add to Website</button>
                    </div>
                </form>
            </div>

            {/* --- List Section --- */}
            <div style={styles.listContainer}>
                {loading ? <p style={{color:'white'}}>Loading...</p> : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={{textAlign:'left', color:'#888'}}>
                                <th style={{padding:'10px'}}>Logo</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Link</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} style={{borderBottom:'1px solid #333'}}>
                                    <td style={{padding:'10px'}}>
                                        <img src={item.logo_url} alt="logo" style={{width:'50px', height:'50px', objectFit:'contain', background:'white', borderRadius:'5px'}} />
                                    </td>
                                    <td style={{color:'white', fontWeight:'bold'}}>{item.name}</td>
                                    <td>
                                        <span style={{
                                            padding: '5px 10px', borderRadius: '15px', fontSize: '0.8rem',
                                            background: item.type === 'sponsor' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(79, 172, 254, 0.2)',
                                            color: item.type === 'sponsor' ? '#00f2fe' : '#4facfe'
                                        }}>
                                            {item.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {item.website_link ? <a href={item.website_link} target="_blank" rel="noreferrer" style={{color:'#aaa'}}>Visit 🔗</a> : '-'}
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#666'}}>No partners added yet.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
    formCard: { background: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '15px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.1)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    label: { display: 'block', color: '#ccc', marginBottom: '5px', fontSize: '0.9rem' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #444', background: '#0f172a', color: 'white' },
    addBtn: { width: '100%', padding: '12px', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' },
    listContainer: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    deleteBtn: { background: 'rgba(255,0,0,0.2)', color: 'red', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }
};

export default SponsorsPartnersBoard;
