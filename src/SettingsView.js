import React, { useState } from 'react';
import API from './api';

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
              
              {/* حقول التميز */}
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

const styles = {
    sidebarInput: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' },
    continueBtn: { width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', color: '#050810', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
};

export default SettingsView;
