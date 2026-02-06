import React, { useState, useEffect } from 'react';
import API from './api'; 
import UserProfileModal from './UserProfileModal';

const CommunityView = () => {
    const [posts, setPosts] = useState([]);
    const [userReactions, setUserReactions] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const [selectedUserId, setSelectedUserId] = useState(null);
    const [activeCommentBox, setActiveCommentBox] = useState(null);
    const [commentInputs, setCommentInputs] = useState({});
    const [postComments, setPostComments] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");

    const user = JSON.parse(localStorage.getItem('ieee_user'));

    const reactionIcons = {
        like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡'
    };

    useEffect(() => {
        fetchPosts();
        fetchReactions();
    }, []);

    const fetchPosts = () => {
        API.get('/posts').then(res => setPosts(res.data)).catch(err => console.error(err));
    };

    const fetchReactions = () => {
        API.get('/reactions').then(res => setUserReactions(res.data)).catch(err => console.error(err));
    };

    const fetchComments = (postId) => {
        API.get(`/comments/${postId}`).then(res => {
            setPostComments(prev => ({ ...prev, [postId]: res.data }));
        }).catch(err => console.error(err));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost && !image) return alert("Write something!");
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('user_name', user.name);
        formData.append('user_role', user.role);
        // ✅ نبعت لينك الصورة السحابية الحالي
        formData.append('user_avatar', user.profile_pic || '');
        formData.append('content', newPost);
        if (image) formData.append('image', image);

        try {
            await API.post('/posts/add', formData);
            setNewPost(""); setImage(null); setPreview(null);
            fetchPosts();
        } catch (err) {
            alert("Error posting");
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this post?")) {
            API.delete(`/posts/delete/${id}`).then(() => {
                fetchPosts();
                fetchReactions();
            }).catch(err => alert("Error deleting post"));
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const saveEdit = async (id) => {
        await API.put(`/posts/update/${id}`, { content: editContent });
        setEditingPostId(null);
        fetchPosts();
    };

    const handleReact = async (postId, type) => {
        await API.post('/posts/react', {
            post_id: postId,
            user_id: user.id,
            reaction_type: type
        });
        fetchReactions();
        fetchPosts();
    };

    const getMyReaction = (postId) => {
        const myReact = userReactions.find(r => r.post_id === postId && r.user_id === user.id);
        return myReact ? myReact.reaction_type : null;
    };

    const toggleComments = (postId) => {
        if (activeCommentBox === postId) {
            setActiveCommentBox(null);
        } else {
            setActiveCommentBox(postId);
            fetchComments(postId);
        }
    };

    const submitComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text) return;

        await API.post('/comments/add', {
            post_id: postId,
            user_id: user.id,
            user_name: user.name,
            user_avatar: user.profile_pic || '', // ✅ توحيد الصورة السحابية
            comment_text: text
        });

        setCommentInputs({ ...commentInputs, [postId]: '' });
        fetchComments(postId);
        fetchPosts();
    };

    const deleteComment = async (commentId, postId) => {
        if (window.confirm("Delete this comment?")) {
            await API.delete(`/comments/delete/${commentId}`);
            fetchComments(postId);
            fetchPosts();
        }
    };

    const startEditingComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.comment_text);
    };

    const saveCommentEdit = async (commentId, postId) => {
        if (!editCommentText.trim()) return;
        await API.put(`/comments/update/${commentId}`, { comment_text: editCommentText });
        setEditingCommentId(null);
        fetchComments(postId);
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>🌍 IEEE Community</h2>

            <div style={styles.createBox}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    {/* ✅ عرض صورة الناشر الحالية من السحابة في صندوق الكتابة */}
                    <div style={styles.avatar}>
                        {user.profile_pic ? (
                            <img src={user.profile_pic} alt="Me" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
                        ) : user.name.charAt(0)}
                    </div>
                    <textarea style={styles.textArea} placeholder={`What's on your mind, ${user.name}?`} value={newPost} onChange={(e) => setNewPost(e.target.value)} />
                </div>
                {preview && <img src={preview} alt="Preview" style={styles.imagePreview} />}
                <div style={styles.actions}>
                    <label style={styles.uploadBtn}>📷 Photo<input type="file" onChange={handleImageChange} style={{ display: 'none' }} /></label>
                    <button onClick={handlePost} style={styles.postBtn}>Post 🚀</button>
                </div>
            </div>

            <div style={styles.feed}>
                {posts.map(post => {
                    const myReaction = getMyReaction(post.id);
                    return (
                        <div key={post.id} style={styles.postCard}>
                            <div style={styles.postHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setSelectedUserId(post.user_id)}>
                                    {/* ✅ تم حذف localhost - الصورة تقرأ من اللينك المباشر */}
                                    {post.user_avatar ? (
                                        <img src={post.user_avatar} style={styles.avatarSmall} alt="Av" />
                                    ) : (
                                        <div style={styles.avatarSmallPlaceholder}>{post.user_name.charAt(0)}</div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: 'white' }}>{post.user_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#aaa' }}>{post.user_role} • {new Date(post.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                {(user.role === 'admin' || user.id === post.user_id) && (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => startEditing(post)} style={styles.iconBtn}>✏️</button>
                                        <button onClick={() => handleDelete(post.id)} style={{ ...styles.iconBtn, color: '#ff6b6b' }}>🗑️</button>
                                    </div>
                                )}
                            </div>

                            {editingPostId === post.id ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={styles.editInput} />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                        <button onClick={() => saveEdit(post.id)} style={styles.saveBtn}>Save</button>
                                        <button onClick={() => setEditingPostId(null)} style={styles.cancelBtn}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p style={styles.content}>{post.content}</p>
                            )}

                            {/* ✅ تم حذف localhost - صورة البوست تقرأ من اللينك المباشر */}
                            {post.post_image && <img src={post.post_image} alt="Post" style={styles.postImage} />}

                            <div style={styles.statsRow}>
                                <span>❤️ {post.reaction_count} Reactions</span>
                                <span onClick={() => toggleComments(post.id)} style={{ cursor: 'pointer' }}>
                                    💬 {post.comment_count} Comments
                                </span>
                            </div>

                            <div style={styles.actionsRow}>
                                <div style={styles.reactionWrapper} className="reactionWrapper">
                                    <button
                                        onClick={() => handleReact(post.id, myReaction ? myReaction : 'like')}
                                        style={{ ...styles.actionBtn, color: myReaction ? '#4facfe' : '#ccc' }}
                                    >
                                        {myReaction ? `${reactionIcons[myReaction]} ${myReaction}` : '👍 Like'}
                                    </button>
                                    <div style={styles.reactionPopup} className="reactionPopup">
                                        {Object.entries(reactionIcons).map(([type, icon]) => (
                                            <span key={type} onClick={(e) => { e.stopPropagation(); handleReact(post.id, type); }} style={styles.reactionIcon} className="reactionIcon">
                                                {icon}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => toggleComments(post.id)} style={styles.actionBtn}>💬 Comment</button>
                            </div>

                            {activeCommentBox === post.id && (
                                <div style={styles.commentsSection}>
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '15px', paddingRight: '5px' }}>
                                        {(postComments[post.id] || []).length > 0 ? (
                                            (postComments[post.id]).map(comment => (
                                                <div key={comment.id} style={styles.commentBubbleContainer}>
                                                    {editingCommentId === comment.id ? (
                                                        <div style={{ width: '100%' }}>
                                                            <input
                                                                value={editCommentText}
                                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                                style={styles.commentEditInput}
                                                                autoFocus
                                                            />
                                                            <div style={{ fontSize: '0.7rem', marginTop: '5px', color: '#aaa' }}>
                                                                <span onClick={() => saveCommentEdit(comment.id, post.id)} style={{ cursor: 'pointer', color: '#4facfe', marginRight: '10px' }}>Save</span>
                                                                <span onClick={() => setEditingCommentId(null)} style={{ cursor: 'pointer', color: 'gray' }}>Cancel</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div style={styles.commentBubble}>
                                                                <div
                                                                    style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#4facfe', marginBottom: '2px', cursor: 'pointer' }}
                                                                    onClick={() => setSelectedUserId(comment.user_id)}
                                                                >
                                                                    {comment.user_name}
                                                                </div>
                                                                <div style={{ fontSize: '0.9rem', color: '#ddd', lineHeight: '1.4' }}>{comment.comment_text}</div>
                                                            </div>
                                                            {(user.role === 'admin' || user.id === comment.user_id) && (
                                                                <div style={styles.commentActions}>
                                                                    <span onClick={() => startEditingComment(comment)} style={styles.commentActionBtn}>Edit</span>
                                                                    <span onClick={() => deleteComment(comment.id, post.id)} style={{ ...styles.commentActionBtn, color: '#ff6b6b' }}>Delete</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>No comments yet.</p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            value={commentInputs[post.id] || ''}
                                            onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                            placeholder="Write a comment..."
                                            style={styles.commentInput}
                                            onKeyPress={e => e.key === 'Enter' && submitComment(post.id)}
                                        />
                                        <button onClick={() => submitComment(post.id)} style={styles.sendBtn}>➤</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedUserId && <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
        </div>
    );
};

// ... Styles كما هي تماماً ...
const styles = {
    container: { maxWidth: '700px', margin: '0 auto', paddingBottom: '50px' },
    header: { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' },
    createBox: { backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '15px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#4facfe', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', overflow:'hidden' },
    textArea: { flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '1rem', outline: 'none', resize: 'none', minHeight: '60px' },
    actions: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' },
    uploadBtn: { cursor: 'pointer', color: '#4facfe', display: 'flex', alignItems: 'center', gap: '5px' },
    postBtn: { padding: '8px 25px', background: 'linear-gradient(90deg, #4facfe, #00f2fe)', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
    imagePreview: { width: '100%', marginTop: '10px', borderRadius: '10px', maxHeight: '300px', objectFit: 'cover' },
    postCard: { backgroundColor: '#1e293b', padding: '0', borderRadius: '15px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
    postHeader: { display: 'flex', justifyContent: 'space-between', padding: '15px' },
    avatarSmall: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
    avatarSmallPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', background: '#64748b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    content: { color: '#e2e8f0', lineHeight: '1.5', padding: '0 15px 15px', whiteSpace: 'pre-wrap' },
    editInput: { width: '90%', margin: '0 15px', padding: '10px', borderRadius: '8px', border: '1px solid #4facfe', background: 'rgba(0,0,0,0.2)', color: 'white' },
    postImage: { width: '100%', display: 'block' },
    statsRow: { padding: '10px 15px', display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    actionsRow: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    actionBtn: { flex: 1, background: 'transparent', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', position: 'relative' },
    reactionWrapper: { flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' },
    reactionPopup: { position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '25px', padding: '5px 10px', display: 'flex', gap: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', opacity: 0, pointerEvents: 'none', transition: '0.3s', marginBottom: '0px', zIndex: 10 },
    reactionIcon: { fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', userSelect: 'none' },
    commentsSection: { padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)' },
    commentBubbleContainer: { marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    commentBubble: { backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', width: 'fit-content', maxWidth: '90%' },
    commentActions: { fontSize: '0.7rem', color: '#888', marginTop: '3px', marginLeft: '5px' },
    commentActionBtn: { cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' },
    commentInput: { flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' },
    commentEditInput: { width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #4facfe', background: 'rgba(0,0,0,0.3)', color: 'white' },
    sendBtn: { background: 'transparent', border: 'none', color: '#4facfe', fontSize: '1.2rem', cursor: 'pointer' },
    iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: '5px' },
    saveBtn: { padding: '5px 15px', background: '#4facfe', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: '15px' },
    cancelBtn: { padding: '5px 15px', background: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .reactionWrapper:hover .reactionPopup { opacity: 1 !important; pointer-events: all !important; transform: translateX(-50%) translateY(-10px); }
  .reactionIcon:hover { transform: scale(1.3); }
`;
document.head.appendChild(styleSheet);

export default CommunityView;
