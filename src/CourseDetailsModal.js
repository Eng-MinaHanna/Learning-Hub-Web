import React, { useState, useEffect } from 'react';
import API from './api'; 
import ReactPlayer from 'react-player';
import CertificateModal from './CertificateModal';

const CourseDetailsModal = ({ course, onClose, currentUser }) => {
    const [editData, setEditData] = useState({
        title: course?.title || '',
        description: course?.description || ''
    });

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [videos, setVideos] = useState([]); // دايماً مصفوفة فاضية في البداية لمنع الشاشة البيضاء
    const [comments, setComments] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizScore, setQuizScore] = useState(null);
    const [newQuestion, setNewQuestion] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'a' });
    const [materials, setMaterials] = useState([]);
    const [newMaterial, setNewMaterial] = useState({ title: '', file: null });

    const [isVideoWatched, setIsVideoWatched] = useState(false);
    const [attemptsCount, setAttemptsCount] = useState(0);
    const [bestScore, setBestScore] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);

    const [activeVideo, setActiveVideo] = useState(null);
    const [activeTab, setActiveTab] = useState('lesson');
    const [isEditing, setIsEditing] = useState(false);

    const [editingVideoId, setEditingVideoId] = useState(null);
    const [newVideoLink, setNewVideoLink] = useState({ title: '', link: '', date: '' });
    const [newComment, setNewComment] = useState("");
    const [realVideoEnded, setRealVideoEnded] = useState(false);

    const isOwner = currentUser && course && course.created_by === currentUser.id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isUnlocked = isSubscribed || isAdmin || isOwner;
    const canEdit = isAdmin || isOwner;

    // ✅ تصحيح روابط الفيديو: دلوقت كله سحابي
    const getVideoUrl = (link) => {
        if (!link) return "";
        return link; // الرابط بيجي كامل من Cloudinary أو YouTube
    };

    const isDriveLink = (url) => url && url.includes("drive.google.com");
    const isYouTubeLink = (url) => url && (url.includes("youtube.com") || url.includes("youtu.be"));

    const getDriveEmbedUrl = (url) => {
        if (!url) return "";
        let id = null;
        const pathMatch = url.match(/\/d\/(.*?)(?:\/|$)/);
        if (pathMatch) id = pathMatch[1];
        else {
            const queryMatch = url.match(/[?&]id=([^&]+)/);
            if (queryMatch) id = queryMatch[1];
        }
        return id ? `https://drive.google.com/file/d/${id}/preview` : url;
    };

    // ✅ جلب الفيديوهات بأمان (تأمين الـ Playlist)
    const fetchVideos = () => { 
        API.get(`/videos/${course.id}`)
            .then(res => { 
                const data = Array.isArray(res.data) ? res.data : [];
                setVideos(data); 
                // إظهار الفيديو الأول تلقائياً لو متاح
                if (data.length > 0 && !activeVideo) {
                    setActiveVideo(data[0]);
                }
            })
            .catch(err => console.error("Videos Load Error", err)); 
    };

    const fetchVideoStatus = () => { 
        if (!activeVideo) return;
        API.get(`/progress/status/${course.id}/${activeVideo.id}/${currentUser.email}`)
            .then(res => { 
                setIsVideoWatched(res.data.isWatched); 
                setAttemptsCount(res.data.attempts); 
                setBestScore(res.data.bestScore); 
            })
            .catch(() => {}); 
    };

    const fetchCourseProgress = () => { API.get(`/progress/calculate/${course.id}/${currentUser.email}`).then(res => setProgressPercent(res.data.percent)); };
    const checkSubscription = () => { API.post('/check-subscription', { course_id: course.id, student_name: currentUser.name }).then(res => setIsSubscribed(res.data.isSubscribed)); };
    const fetchComments = () => { API.get(`/comments/${course.id}`).then(res => setComments(res.data)); };
    const fetchQuiz = () => { API.get(`/quiz/${course.id}`).then(res => setQuestions(res.data)); };
    const fetchMaterials = () => { API.get(`/materials/${course.id}`).then(res => setMaterials(res.data)); };
    
    useEffect(() => {
        if (currentUser && course) {
            checkSubscription();
            fetchVideos();
            fetchComments();
            fetchQuiz();
            fetchMaterials();
            fetchCourseProgress();
        }
    }, [course, currentUser]);

    useEffect(() => {
        if (currentUser && activeVideo) {
            fetchVideoStatus();
            setRealVideoEnded(false);
        }
    }, [activeVideo]);

    const handleSubscribe = () => { API.post('/subscribe', { course_id: course.id, student_name: currentUser.name, student_email: currentUser.email }).then(() => { alert("تم الاشتراك! 🚀"); setIsSubscribed(true); }); };

    const handleVideoEnd = () => {
        setRealVideoEnded(true);
        handleMarkWatched(true);
    };

    const handleMarkWatched = (auto = false) => {
        if (!activeVideo) return;
        const isDrive = isDriveLink(activeVideo.video_link);
        if (!auto && !realVideoEnded && !canEdit && !isDrive) {
            alert("⚠️ Please watch the full video to mark it as completed.");
            return;
        }
        API.post('/progress/mark-watched', {
            user_email: currentUser.email,
            video_id: activeVideo.id
        }).then(() => {
            setIsVideoWatched(true);
            if (!auto) alert("Marked as Completed ✅");
            fetchCourseProgress();
        });
    };

    // ✅ تصحيح إضافة الفيديو للسحابة
    const handleSaveVideo = async (e) => { 
        e.preventDefault(); 
        if (!newVideoLink.date) return alert("⚠️ Date needed"); 
        
        const videoData = { 
            course_id: course.id, 
            video_title: newVideoLink.title, 
            video_link: newVideoLink.link, 
            video_date: newVideoLink.date 
        };

        try {
            if (editingVideoId) { 
                await API.put(`/videos/update/${editingVideoId}`, videoData); 
            } else { 
                await API.post('/videos/add', videoData); 
            } 
            setNewVideoLink({ title: '', link: '', date: '' }); 
            setEditingVideoId(null); 
            fetchVideos(); 
        } catch(err) { alert("Error saving video"); }
    };

    const handleSubmitQuiz = () => { if (attemptsCount >= 2) return alert("No attempts left."); let score = 0; questions.forEach(q => { if (userAnswers[q.id] === q.correct_answer) score++; }); setQuizScore(score); API.post('/quiz/attempt', { user_email: currentUser.email, course_id: course.id, score: score }).then(() => { setAttemptsCount(prev => prev + 1); alert(`Score: ${score}/${questions.length}`); }); };
    const handleAddMaterial = (e) => { e.preventDefault(); if (!newMaterial.file) return alert("Select file"); const formData = new FormData(); formData.append('course_id', course.id); formData.append('title', newMaterial.title); formData.append('file', newMaterial.file); API.post('/materials/add', formData).then(() => { alert("Uploaded"); setNewMaterial({ title: '', file: null }); fetchMaterials(); }); };

    // ✅ تصفية الفيديوهات: عرض الكل للـ Admin، وعرض المتاح فقط للطلاب
    const visibleVideos = Array.isArray(videos) ? videos.filter(vid => 
        canEdit || !vid.video_date || new Date(vid.video_date) <= new Date()
    ) : [];

    return (
        <div style={styles.fullScreenOverlay}>
            <div style={styles.headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onClose} style={styles.backBtnStyle}>🔙 Exit Course</button>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{editData.title}</h2>
                </div>
                {canEdit && <button onClick={() => setIsEditing(!isEditing)} style={styles.editBtn}>{isEditing ? '✅ Done' : '⚙️ Manage'}</button>}
            </div>

            <div style={styles.mainLayout}>
                <div style={styles.sidebarStyle}>
                    <div style={styles.sidebarHeader}><h3 style={{ margin: 0, color: '#4facfe', fontSize: '1rem' }}>▶️ Playlist</h3></div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {visibleVideos.length > 0 ? visibleVideos.map((vid, index) => (
                            <div key={vid.id} onClick={() => { setActiveVideo(vid); setActiveTab('lesson'); }}
                                style={{ ...styles.videoItemStyle, backgroundColor: activeVideo?.id === vid.id ? 'rgba(79, 172, 254, 0.1)' : 'transparent', borderLeft: activeVideo?.id === vid.id ? '4px solid #4facfe' : '4px solid transparent' }}>
                                <div style={{ width: '100%' }}>
                                    <div style={{ color: activeVideo?.id === vid.id ? '#4facfe' : 'white', fontWeight: 'bold' }}>{index + 1}. {vid.video_title}</div>
                                    <small style={{ color: '#666' }}>{vid.video_date ? new Date(vid.video_date).toLocaleDateString() : 'Available'}</small>
                                </div>
                                {isEditing && (
                                    <button onClick={(e) => { e.stopPropagation(); API.delete(`/videos/delete/${vid.id}`).then(fetchVideos); }} style={{color:'#ff6b6b', border:'none', background:'none', cursor:'pointer'}}>🗑️</button>
                                )}
                            </div>
                        )) : <div style={{padding:'20px', color:'#555', textAlign:'center'}}>No videos yet.</div>}
                    </div>
                    {isEditing && (
                        <div style={styles.addVideoForm}>
                            <input placeholder="Title" value={newVideoLink.title} onChange={e => setNewVideoLink({ ...newVideoLink, title: e.target.value })} style={styles.sidebarInput} />
                            <input type="datetime-local" value={newVideoLink.date} onChange={e => setNewVideoLink({ ...newVideoLink, date: e.target.value })} style={{ ...styles.sidebarInput, marginTop: '5px', colorScheme: 'dark' }} />
                            <input placeholder="Link" value={newVideoLink.link} onChange={e => setNewVideoLink({ ...newVideoLink, link: e.target.value })} style={{ ...styles.sidebarInput, marginTop: '5px' }} />
                            <button onClick={handleSaveVideo} style={styles.addVideoBtn}>Add Video</button>
                        </div>
                    )}
                </div>

                <div style={styles.contentAreaStyle}>
                    {!isUnlocked ? (
                        <div style={styles.lockScreenStyle}><h1>🔒 Locked</h1><button onClick={handleSubscribe} style={styles.bigSubscribeBtn}>Subscribe Now</button></div>
                    ) : (
                        <>
                            <div style={styles.tabsWrapper}>
                                <div style={styles.tabsContainer}>
                                    <button onClick={() => setActiveTab('lesson')} style={activeTab === 'lesson' ? styles.activeTabBtn : styles.tabBtn}>📺 Lesson</button>
                                    <button onClick={() => setActiveTab('quiz')} style={activeTab === 'quiz' ? styles.activeTabBtn : styles.tabBtn}>🧩 Quiz ({questions.length})</button>
                                    <button onClick={() => setActiveTab('materials')} style={activeTab === 'materials' ? styles.activeTabBtn : styles.tabBtn}>📁 Materials ({materials.length})</button>
                                </div>
                            </div>

                            <div style={styles.tabContent}>
                                {activeTab === 'lesson' && (
                                    <div style={styles.fadeIn}>
                                        <div style={styles.playerContainer}>
                                            {activeVideo ? (
                                                isYouTubeLink(activeVideo.video_link) ? (
                                                    <ReactPlayer url={activeVideo.video_link} width="100%" height="100%" controls onEnded={handleVideoEnd} />
                                                ) : (
                                                    <iframe src={getDriveEmbedUrl(activeVideo.video_link)} width="100%" height="100%" allow="autoplay" allowFullScreen style={{border:'none'}}></iframe>
                                                )
                                            ) : <div style={{ color: '#aaa', textAlign: 'center', marginTop: '100px' }}>Select a video from the playlist</div>}
                                        </div>
                                        {activeVideo && (
                                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                                                <div>
                                                    <h3 style={{margin:0}}>{activeVideo.video_title}</h3>
                                                    <span style={{ color: isVideoWatched ? '#00e676' : '#f59e0b' }}>{isVideoWatched ? "✅ Completed" : "⏳ Not Finished"}</span>
                                                </div>
                                                {!isVideoWatched && <button onClick={() => handleMarkWatched(false)} style={styles.markWatchedBtn}>Complete ✅</button>}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* ... (باقي التابات Quiz و Materials كما هي في كودك مع حذف localhost) ... */}
                                {activeTab === 'materials' && (
                                    <div style={{display:'grid', gap:'10px'}}>
                                        {materials.map(m => (
                                            <div key={m.id} style={styles.materialCard}>
                                                <span>📄 {m.title}</span>
                                                {/* ✅ حذف localhost من رابط التحميل */}
                                                <a href={m.file_path} target="_blank" rel="noreferrer" style={styles.downloadBtn}>Download</a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showCertificate && <CertificateModal studentName={currentUser.name} courseName={course.title} date={new Date().toLocaleDateString()} onClose={() => setShowCertificate(false)} />}
        </div>
    );
};

// ... Styles كما هي ...
const styles = {
    fullScreenOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#0f172a', zIndex: 9999, display: 'flex', flexDirection: 'column', fontFamily: "'Cairo', sans-serif" },
    headerStyle: { height: '60px', backgroundColor: '#1e293b', padding: '0 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    backBtnStyle: { background: 'rgba(255,255,255,0.05)', border: 'none', color: '#aaa', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' },
    mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
    sidebarStyle: { width: '300px', backgroundColor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    videoItemStyle: { padding: '15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    contentAreaStyle: { flex: 1, backgroundColor: '#0f172a', overflowY: 'auto' },
    playerContainer: { width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden' },
    tabsContainer: { display: 'flex', gap: '20px', padding: '15px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    tabBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
    activeTabBtn: { background: 'none', border: 'none', color: '#4facfe', borderBottom: '2px solid #4facfe', fontWeight: 'bold', paddingBottom: '5px' },
    markWatchedBtn: { background: '#4facfe', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    materialCard: { background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' },
    downloadBtn: { color: '#4facfe', textDecoration: 'none', fontWeight: 'bold' },
    sidebarInput: { width: '90%', padding: '8px', margin: '5px auto', display: 'block', background: '#1e293b', border: '1px solid #333', color: 'white' },
    addVideoBtn: { width: '90%', padding: '10px', margin: '10px auto', display: 'block', background: '#4facfe', border: 'none', borderRadius: '5px', fontWeight: 'bold' },
    bigSubscribeBtn: { padding: '15px 40px', background: '#4facfe', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' },
    lockScreenStyle: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }
};

export default CourseDetailsModal;
