import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoModal = ({ course, onClose }) => {
    const [videos, setVideos] = useState([]);
    const [newVideo, setNewVideo] = useState({ title: '', link: '' });

    useEffect(() => {
        fetchVideos();
    }, [course]);

    const fetchVideos = () => {
        axios.get(`http://localhost:5000/api/videos/${course.id}`)
            .then(res => setVideos(res.data))
            .catch(err => console.error(err));
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/videos/add', {
                course_id: course.id,
                video_title: newVideo.title,
                video_link: newVideo.link
            });
            setNewVideo({ title: '', link: '' });
            fetchVideos();
        } catch (error) {
            alert("فشل إضافة الفيديو");
        }
    };

    // دالة سحرية لتحويل لينكات اليوتيوب لفيديوهات تشتغل جوه الموقع
    const getEmbedUrl = (url) => {
        if (!url) return "";
        let videoId = "";

        // لو اللينك جاي من المتصفح (v=...)
        if (url.includes("youtube.com/watch?v=")) {
            videoId = url.split("v=")[1].split("&")[0];
        }
        // لو اللينك مختصر (youtu.be/...)
        else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // لو مش يوتيوب، رجعه زي ما هو (ممكن يكون درايف)
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3>📺 فيديوهات كورس: {course.title}</h3>
                    <button onClick={onClose} style={closeBtnStyle}>✖</button>
                </div>

                <div style={bodyStyle}>
                    {/* فورم الإضافة */}
                    <form onSubmit={handleAddVideo} style={formStyle}>
                        <input type="text" placeholder="عنوان الفيديو"
                            value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} required style={inputStyle} />
                        <input type="url" placeholder="رابط اليوتيوب"
                            value={newVideo.link} onChange={e => setNewVideo({ ...newVideo, link: e.target.value })} required style={inputStyle} />
                        <button type="submit" style={addBtnStyle}>إضافة ➕</button>
                    </form>

                    <hr style={{ margin: '15px 0' }} />

                    {/* قائمة الفيديوهات (Embedded) */}
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                        {videos.length === 0 ? <p style={{ textAlign: 'center', color: '#777' }}>لا يوجد فيديوهات حتى الآن.</p> :
                            videos.map(vid => (
                                <div key={vid.id} style={videoItemStyle}>
                                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🎥 {vid.video_title}</h4>

                                    {/* هنا التغيير الكبير: عرض الفيديو مباشرة */}
                                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                                        <iframe
                                            src={getEmbedUrl(vid.video_link)}
                                            title={vid.video_title}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles محدثة عشان تستوعب الفيديو
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalStyle = {
    backgroundColor: 'white', width: '600px', maxHeight: '90vh', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column'
};
const headerStyle = {
    backgroundColor: '#00629B', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};
const closeBtnStyle = { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' };
const bodyStyle = { padding: '20px', overflowY: 'auto' };
const formStyle = { display: 'flex', gap: '10px', marginBottom: '10px' };
const inputStyle = { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };
const addBtnStyle = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const videoItemStyle = { marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '20px' };

export default VideoModal;