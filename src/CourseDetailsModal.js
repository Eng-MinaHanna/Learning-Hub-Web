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
    const [videos, setVideos] = useState([]);
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

    // --- Helpers ---
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

    // ✅ التعديل التقني الوحيد: حذف localhost لأن الروابط أصبحت سحابية مباشرة
    const getLocalVideoUrl = (link) => {
        if (!link) return "";
        return link; 
    };

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
    }, [activeVideo, currentUser]);

    const fetchVideoStatus = () => { API.get(`/progress/status/${course.id}/${activeVideo.id}/${currentUser.email}`).then(res => { setIsVideoWatched(res.data.isWatched); setAttemptsCount(res.data.attempts); setBestScore(res.data.bestScore); }).catch(err => console.log(err)); };
    const fetchCourseProgress = () => { API.get(`/progress/calculate/${course.id}/${currentUser.email}`).then(res => setProgressPercent(res.data.percent)); };
    const checkSubscription = () => { API.post('/check-subscription', { course_id: course.id, student_name: currentUser.name }).then(res => setIsSubscribed(res.data.isSubscribed)); };
    
    // ✅ تأمين جلب الفيديوهات
    const fetchVideos = () => { 
        API.get(`/videos/${course.id}`).then(res => { 
            const data = Array.isArray(res.data) ? res.data : [];
            setVideos(data); 
            const validVideos = data.filter(v => canEdit || !v.video_date || new Date(v.video_date) <= new Date()); 
            if (validVideos.length > 0 && !activeVideo) setActiveVideo(validVideos[0]); 
        }); 
    };
    
    const fetchComments = () => { API.get(`/comments/${course.id}`).then(res => setComments(res.data)); };
    const fetchQuiz = () => { API.get(`/quiz/${course.id}`).then(res => setQuestions(res.data)); };
    const fetchMaterials = () => { API.get(`/materials/${course.id}`).then(res => setMaterials(res.data)); };
    const handleSubscribe = () => { API.post('/subscribe', { course_id: course.id, student_name: currentUser.name, student_email: currentUser.email }).then(() => { alert("تم الاشتراك! 🚀"); setIsSubscribed(true); }); };

    const handleVideoEnd = () => {
        setRealVideoEnded(true);
        handleMarkWatched(true);
    };

    const handleMarkWatched = (auto = false) => {
        if (!activeVideo) return;
        const isDrive = isDriveLink(activeVideo?.video_link);
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

    const handleSubmitQuiz = () => { if (attemptsCount >= 2) return alert("No attempts left."); let score = 0; questions.forEach(q => { if (userAnswers[q.id] === q.correct_answer) score++; }); setQuizScore(score); API.post('/quiz/attempt', { user_email: currentUser.email, course_id: course.id, score: score }).then(() => { setAttemptsCount(prev => prev + 1); alert(`Score: ${score}/${questions.length}`); }); };
    const handleRetakeQuiz = () => { if (attemptsCount >= 2) return; setUserAnswers({}); setQuizScore(null); };
   // ✅ تعديل إضافة التعليق
const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    API.post('/comments/add', {
        course_id: course.id, // نبعته كـ id للمنشور
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.profile_pic || '',
        comment_text: newComment
    }).then(() => {
        setNewComment("");
        fetchComments(); // تحديث القائمة فوراً
    }).catch(err => alert("Comment failed: " + err.message));
};

// ✅ تعديل إضافة الماتريال
const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.file || !newMaterial.title) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append('course_id', course.id);
    formData.append('title', newMaterial.title);
    formData.append('file', newMaterial.file);

    API.post('/materials/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(() => {
        alert("Material Uploaded! 📄");
        setNewMaterial({ title: '', file: null });
        fetchMaterials();
    }).catch(err => alert("Upload failed"));
};
    const handleAddQuestion = (e) => { e.preventDefault(); API.post('/quiz/add', { course_id: course.id, question_text: newQuestion.text, option_a: newQuestion.a, option_b: newQuestion.b, option_c: newQuestion.c, option_d: newQuestion.d, correct_answer: newQuestion.correct }).then(() => { alert("Added"); setNewQuestion({ text: '', a: '', b: '', c: '', d: '', correct: 'a' }); fetchQuiz(); }); };
    const handleDeleteQuestion = (id) => { if (window.confirm("Delete?")) API.delete(`/quiz/delete/${id}`).then(() => fetchQuiz()); };
    const handleAddMaterial = (e) => { e.preventDefault(); if (!newMaterial.file) return alert("Select file"); const formData = new FormData(); formData.append('course_id', course.id); formData.append('title', newMaterial.title); formData.append('file', newMaterial.file); API.post('/materials/add', formData).then(() => { alert("Uploaded"); setNewMaterial({ title: '', file: null }); fetchMaterials(); }); };
    const handleDeleteMaterial = (id) => { if (window.confirm("Delete?")) API.delete(`/materials/delete/${id}`).then(() => fetchMaterials()); };
    const handleOptionSelect = (qId, opt) => { if (quizScore !== null || attemptsCount >= 2) return; setUserAnswers({ ...userAnswers, [qId]: opt }); };
    const handleSaveChanges = async () => { try { await API.put(`/activities/update/${course.id}`, { ...course, title: editData.title, description: editData.description, event_date: course.event_date.split('T')[0] }); setIsEditing(false); } catch (error) { alert("Error"); } };
    const startEditingVideo = (vid) => { setEditingVideoId(vid.id); let formattedDate = ''; if (vid.video_date) { const d = new Date(vid.video_date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); formattedDate = d.toISOString().slice(0, 16); } setNewVideoLink({ title: vid.video_title, link: vid.video_link, date: formattedDate }); };
    const handleSaveVideo = async (e) => { e.preventDefault(); if (!newVideoLink.date) { alert("⚠️ Date needed"); return; } if (editingVideoId) { await API.put(`/videos/update/${editingVideoId}`, { video_title: newVideoLink.title, video_link: newVideoLink.link, video_date: newVideoLink.date }); } else { await API.post('/videos/add', { course_id: course.id, video_title: newVideoLink.title, video_link: newVideoLink.link, video_date: newVideoLink.date }); } setNewVideoLink({ title: '', link: '', date: '' }); setEditingVideoId(null); fetchVideos(); };
    const handleDeleteVideo = async (videoId) => { if (window.confirm("Delete Video?")) { await API.delete(`/videos/delete/${videoId}`); fetchVideos(); } };
    const formatDateTime = (ds) => { if (!ds) return 'Soon'; const d = new Date(ds); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };

    const visibleVideos = Array.isArray(videos) ? videos.filter(vid => canEdit || !vid.video_date || new Date(vid.video_date) <= new Date()) : [];

    return (
        <div style={styles.fullScreenOverlay}>
            <div style={styles.headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={onClose} style={styles.backBtnStyle}>🔙 Exit Course</button>
                    {isEditing ? <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} style={styles.headerInput} /> : <h2 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{editData.title}</h2>}
                </div>
                {canEdit && <button onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)} style={styles.editBtn}>{isEditing ? '💾 Save' : '⚙️ Edit'}</button>}
            </div>

            <div style={styles.mainLayout}>
                <div style={styles.sidebarStyle}>
                    <div style={styles.sidebarHeader}><h3 style={{ margin: 0, color: '#ecf0f1', fontSize: '1rem' }}>▶️ Playlist</h3></div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {visibleVideos.map((vid, index) => (
                            <div key={vid.id} onClick={() => { if (!isEditing) { setActiveVideo(vid); setActiveTab('lesson'); } }}
                                style={{ ...styles.videoItemStyle, backgroundColor: activeVideo?.id === vid.id ? 'rgba(79, 172, 254, 0.15)' : 'transparent', borderLeft: activeVideo?.id === vid.id ? '4px solid #4facfe' : '4px solid transparent', opacity: activeVideo?.id === vid.id ? 1 : 0.7 }}>
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: activeVideo?.id === vid.id ? '#4facfe' : '#666', fontWeight: 'bold' }}>{index + 1}</span><span style={{ color: 'white' }}>{vid.video_title}</span></div>
                                    <small style={{ color: '#888', marginLeft: '20px', display: 'block' }}>{formatDateTime(vid.video_date)}</small>
                                </div>
                                {isEditing && (<div style={{ display: 'flex', gap: '5px' }}><button onClick={(e) => { e.stopPropagation(); startEditingVideo(vid); }} style={{ ...styles.iconBtn, color: '#fde047' }}>✏️</button><button onClick={(e) => { e.stopPropagation(); handleDeleteVideo(vid.id); }} style={{ ...styles.iconBtn, color: '#ff6b6b' }}>🗑️</button></div>)}
                            </div>
                        ))}
                    </div>
                    {isEditing && (
                        <div style={styles.addVideoForm}>
                            <h4 style={{ color: '#4facfe', margin: '0 0 10px 0' }}>{editingVideoId ? '✏️ Edit' : '➕ Add'}</h4>
                            <input placeholder="Title" value={newVideoLink.title} onChange={e => setNewVideoLink({ ...newVideoLink, title: e.target.value })} style={styles.sidebarInput} />
                            <input type="datetime-local" value={newVideoLink.date} onChange={e => setNewVideoLink({ ...newVideoLink, date: e.target.value })} style={{ ...styles.sidebarInput, marginTop: '5px', colorScheme: 'dark' }} />
                            <input placeholder="Video Link (YouTube/Drive)" value={newVideoLink.link} onChange={e => setNewVideoLink({ ...newVideoLink, link: e.target.value })} style={{ ...styles.sidebarInput, marginTop: '8px' }} />
                            <button onClick={handleSaveVideo} style={{ ...styles.addVideoBtn, marginTop: '10px' }}>{editingVideoId ? 'Update' : 'Add'}</button>
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
                                    <button onClick={() => setActiveTab('quiz')} style={activeTab === 'quiz' ? styles.activeTabBtn : styles.tabBtn}>🧩 Quiz <span style={styles.tabBadge}>{questions.length}</span></button>
                                    <button onClick={() => setActiveTab('materials')} style={activeTab === 'materials' ? styles.activeTabBtn : styles.tabBtn}>📁 Materials <span style={styles.tabBadge}>{materials.length}</span></button>
                                    <button onClick={() => setActiveTab('comments')} style={activeTab === 'comments' ? styles.activeTabBtn : styles.tabBtn}>💬 Discussion</button>
                                </div>
                            </div>

                            <div style={styles.tabContent}>
                                {activeTab === 'lesson' && (
                                    <div style={styles.fadeIn}>
                                        <div style={styles.playerContainer}>
                                            {activeVideo ? (
                                                isDriveLink(activeVideo.video_link) ? (
                                                    <iframe src={getDriveEmbedUrl(activeVideo.video_link)} width="100%" height="100%" style={{ border: 'none', borderRadius: '16px' }} allow="autoplay; encrypted-media; allowFullScreen" allowFullScreen title="Drive Video"></iframe>
                                                ) : isYouTubeLink(activeVideo.video_link) ? (
                                                    <ReactPlayer url={activeVideo.video_link} width="100%" height="100%" controls={true} onEnded={handleVideoEnd} style={{ borderRadius: '16px', overflow: 'hidden' }} />
                                                ) : (
                                                    <video src={getLocalVideoUrl(activeVideo.video_link)} controls onEnded={handleVideoEnd} style={{ width: '100%', height: '100%', borderRadius: '16px', backgroundColor: 'black' }} controlsList="nodownload">Your browser does not support the video tag.</video>
                                                )
                                            ) : <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>Select a video</div>}
                                        </div>

                                        {activeVideo && (
                                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, color: 'white' }}>Video Status:</h4>
                                                    <span style={{ color: isVideoWatched ? '#00e676' : '#f59e0b', fontWeight: 'bold' }}>{isVideoWatched ? "✅ Completed" : "⏳ Watching..."}</span>
                                                </div>
                                                {!isVideoWatched && (
                                                    <button onClick={() => handleMarkWatched(false)} style={{ ...styles.markWatchedBtn, opacity: (realVideoEnded || canEdit || isDriveLink(activeVideo.video_link)) ? 1 : 0.5, cursor: (realVideoEnded || canEdit || isDriveLink(activeVideo.video_link)) ? 'pointer' : 'not-allowed' }}>
                                                        {(realVideoEnded || canEdit) ? "Mark as Completed ✅" : (isDriveLink(activeVideo.video_link) ? "Done Watching? Click Here ✅" : "Finish video to unlock 🔒")}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '20px', color: '#ccc', lineHeight: '1.6' }}>{editData.description}</div>
                                        {progressPercent === 100 && (
                                            <div style={styles.certificateCard}>
                                                <h2 style={{ margin: '0 0 10px 0' }}>🎉 Course Completed!</h2>
                                                <button onClick={() => setShowCertificate(true)} style={styles.downloadCertBtn}>🎓 Download Certificate</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'quiz' && (
                                    <div style={styles.fadeIn}>
                                        {!isVideoWatched && !canEdit ? (
                                            <div style={styles.lockedQuizState}><h3>🔒 Locked</h3><p>Watch video first.</p><button onClick={() => setActiveTab('lesson')} style={styles.secondaryBtn}>Go to Video</button></div>
                                        ) : (
                                            <>
                                                {canEdit && <div style={styles.adminCard}><h4>Add Question</h4><input value={newQuestion.text} onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })} style={styles.descInput} placeholder="Question" /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}><input placeholder="A" value={newQuestion.a} onChange={e => setNewQuestion({ ...newQuestion, a: e.target.value })} style={styles.sidebarInput} /><input placeholder="B" value={newQuestion.b} onChange={e => setNewQuestion({ ...newQuestion, b: e.target.value })} style={styles.sidebarInput} /><input placeholder="C" value={newQuestion.c} onChange={e => setNewQuestion({ ...newQuestion, c: e.target.value })} style={styles.sidebarInput} /><input placeholder="D" value={newQuestion.d} onChange={e => setNewQuestion({ ...newQuestion, d: e.target.value })} style={styles.sidebarInput} /></div><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><label style={{ color: '#aaa' }}>Correct:</label><select value={newQuestion.correct} onChange={e => setNewQuestion({ ...newQuestion, correct: e.target.value })} style={styles.sidebarInput}><option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option></select><button onClick={handleAddQuestion} style={styles.actionBtn}>Add</button></div></div>}
                                                <div style={{ marginBottom: '20px' }}>Attempts: {attemptsCount}/2 | Best: {bestScore}</div>
                                                {questions.map((q, idx) => (<div key={q.id} style={styles.questionCard}><h4>Q{idx + 1}: {q.question_text}</h4>{['a', 'b', 'c', 'd'].map(o => <label key={o} style={{ display: 'block', padding: '10px' }}><input type="radio" name={`q-${q.id}`} onChange={() => handleOptionSelect(q.id, o)} disabled={attemptsCount >= 2 || quizScore !== null} /> {q[`option_${o}`]}</label>)}</div>))}
                                                {attemptsCount < 2 && quizScore === null ? <button onClick={handleSubmitQuiz} style={styles.bigSubscribeBtn}>Submit</button> : <div>{attemptsCount >= 2 ? "No attempts left" : <button onClick={handleRetakeQuiz}>Retake</button>}</div>}
                                            </>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'materials' && (
                                    <div style={styles.fadeIn}>
                                        {canEdit && (
                                            <div style={styles.adminCard}>
                                                <h4 style={{ color: '#4facfe', margin: '0 0 15px 0' }}>📤 Upload Material</h4>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input placeholder="Title" value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} style={styles.commentInput} />
                                                    <input type="file" onChange={e => setNewMaterial({ ...newMaterial, file: e.target.files[0] })} style={{ color: 'white' }} />
                                                </div>
                                                <button onClick={handleAddMaterial} style={{ ...styles.actionBtn, background: '#4facfe', marginTop: '10px' }}>Upload</button>
                                            </div>
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                                            {materials.map(m => (
                                                <div key={m.id} style={styles.materialCard}>
                                                    <div style={{ fontSize: '2rem' }}>📄</div>
                                                    <div style={{ fontWeight: 'bold', margin: '10px 0' }}>{m.title}</div>
                                                    {/* ✅ حذف localhost لفتح الروابط السحابية */}
                                                    <a href={m.file_path} target="_blank" rel="noreferrer" style={styles.downloadBtn}>Download</a>
                                                    {canEdit && <button onClick={() => handleDeleteMaterial(m.id)} style={{ ...styles.deleteBtn, marginTop: '10px' }}>Delete</button>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'comments' && (
                                    <div style={styles.fadeIn}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                            <input value={newComment} onChange={e => setNewComment(e.target.value)} style={styles.commentInput} placeholder="Comment..." /><button onClick={handleAddComment} style={styles.sendCommentBtn}>Post</button>
                                        </div>
                                        {comments.map(c => <div key={c.id} style={styles.commentItem}><b>{c.user_name}</b>: {c.comment_text}</div>)}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {showCertificate && <CertificateModal studentName={currentUser?.name} courseName={course?.title} date={new Date().toLocaleDateString()} onClose={() => setShowCertificate(false)} />}
        </div>
    );
};

// ✅ الـ Styles الأصلية بتاعتك بدون تغيير حرف واحد
const styles = {
    fullScreenOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#0f172a', zIndex: 9999, display: 'flex', flexDirection: 'column', fontFamily: "'Cairo', 'Segoe UI', sans-serif" },
    headerStyle: { height: '60px', backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: '0 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    backBtnStyle: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' },
    editBtn: { background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
    headerInput: { fontSize: '1.2rem', padding: '5px', borderRadius: '5px', border: '1px solid #4facfe', background: 'transparent', color: 'white' },
    mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
    sidebarStyle: { width: '300px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' },
    sidebarHeader: { padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    videoItemStyle: { padding: '15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    contentAreaStyle: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', position: 'relative', overflowY: 'auto' },
    tabsWrapper: { position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#0f172a', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    tabsContainer: { display: 'flex', gap: '20px', paddingTop: '15px' },
    tabBtn: { padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', fontWeight: '500' },
    activeTabBtn: { padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#4facfe', borderBottom: '3px solid #4facfe', fontWeight: 'bold' },
    tabBadge: { marginLeft: '6px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' },
    tabContent: { padding: '30px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
    playerContainer: { width: '100%', aspectRatio: '16/9', backgroundColor: 'black', borderRadius: '16px', overflow: 'hidden' },
    fadeIn: { animation: 'fadeIn 0.3s ease-in' },
    markWatchedBtn: { background: '#00e676', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
    lockedQuizState: { textAlign: 'center', padding: '40px', border: '2px dashed #444', borderRadius: '20px', color: '#aaa' },
    questionCard: { backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' },
    bigSubscribeBtn: { padding: '15px 40px', background: '#4facfe', color: '#0f172a', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
    secondaryBtn: { background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    commentInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white' },
    sendCommentBtn: { padding: '8px 20px', background: '#4facfe', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    commentItem: { padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '10px' },
    materialCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px', textAlign: 'center' },
    downloadBtn: { display: 'inline-block', color: '#4facfe', textDecoration: 'none', border: '1px solid #4facfe', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' },
    lockScreenStyle: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' },
    certificateCard: { marginTop: '30px', padding: '20px', background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', borderRadius: '15px', textAlign: 'center', color: '#000', boxShadow: '0 4px 15px rgba(253, 185, 49, 0.4)' },
    downloadCertBtn: { padding: '12px 30px', background: 'black', color: '#FFD700', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' },
    adminCard: { backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '15px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' },
    sidebarInput: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' },
    descInput: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none' },
    actionBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    addVideoForm: { padding: '20px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderTop: '1px solid rgba(255,255,255,0.1)' },
    addVideoBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '5px' },
    deleteBtn: { background: 'rgba(255, 99, 99, 0.1)', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '5px 8px', borderRadius: '6px' },
};

export default CourseDetailsModal;
