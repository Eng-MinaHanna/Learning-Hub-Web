import React, { useState, useEffect } from 'react';
import API from './api'; 
import LoadingEffect from './LoadingEffect'; // ✅ 1. استيراد المكون

const LandingPage = ({ onGetStarted, user }) => {
    // ----------------------------------------------------------------
    // 1️⃣ إعداد البيانات
    // ----------------------------------------------------------------
    const [partners, setPartners] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ حالة التحميل

    // ✅ 2️⃣ كود جلب البيانات
    useEffect(() => {
        API.get('/public/sponsors')
            .then(res => {
                const allData = res.data;
                setPartners(allData.filter(item => item.type === 'partner'));
                setSponsors(allData.filter(item => item.type === 'sponsor'));
            })
            .catch(err => {
                console.error("Failed to fetch sponsors:", err);
            })
            .finally(() => {
                // ✅ 3. لازم نوقف التحميل هنا عشان البيانات تظهر
                setLoading(false);
            });
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>
            <div style={styles.glow}></div>

            {/* Navbar */}
            <nav style={styles.navbar}>
                <div style={{ lineHeight: '1' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>
                        IEEE <span style={{ color: '#4facfe' }}>ET5 SB</span>
                    </h2>
                    <span style={styles.logoSubtitle}>Learning Hub</span>
                </div>

                {!user && (
                    <button onClick={onGetStarted} style={styles.loginBtn}>Login / Register</button>
                )}
            </nav>

            {/* Hero Section */}
            <div style={styles.heroSection}>
                <span style={styles.badge}>🚀 Welcome to the Future of Learning</span>

                <h1 style={styles.title}>
                    {user ? (
                        <>Welcome Back, <br /> <span style={styles.gradientText}>{user.name}</span> 👋</>
                    ) : (
                        <>Master <span style={styles.gradientText}>Engineering</span> Skills <br /> With Top Experts.</>
                    )}
                </h1>

                <p style={styles.subtitle}>
                    {user
                        ? "Continue your learning journey, track your progress, and achieve new certificates today."
                        : "Join the IEEE ET5 SB Learning Hub. Access exclusive workshops, track your progress, solve quizzes, and earn certificates."
                    }
                </p>

                <div style={styles.ctaGroup}>
                    <button onClick={onGetStarted} style={styles.primaryBtn}>
                        {user ? 'Go to Dashboard ▶️' : 'Get Started Now'}
                    </button>
                    {!user && (
                        <button onClick={onGetStarted} style={styles.secondaryBtn}>Explore Tracks</button>
                    )}
                </div>
            </div>

            {/* Features Strip */}
            <div style={styles.featuresStrip}>
                <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>📺</span>
                    <div><h3>High-Quality Courses</h3><p>Learn from the best with curated video content.</p></div>
                </div>
                <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🧩</span>
                    <div><h3>Interactive Quizzes</h3><p>Test your knowledge and track your growth.</p></div>
                </div>
                <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🎓</span>
                    <div><h3>Earn Certificates</h3><p>Get certified upon completing tracks.</p></div>
                </div>
            </div>

            {/* ------------------------------------------------------ */}
            {/* ✅ 3️⃣ PARTNERS & SPONSORS SECTIONS (With Loading Effect) */}
            {/* ------------------------------------------------------ */}
            
            {/* Partners Section */}
            <div style={styles.brandsSection}>
                <h3 style={styles.sectionTitle}>🤝 Our Strategic <span style={{color:'#4facfe'}}>Partners</span></h3>
                
                {/* ✅ استخدام LoadingEffect هنا */}
                {loading ? (
                    <LoadingEffect message="Loading Partners..." />
                ) : (
                    <div style={styles.logosGrid}>
                        {partners.length > 0 ? partners.map((partner) => (
                            <a 
                                key={partner.id} 
                                href={partner.website_link || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                style={styles.logoWrapper} 
                                title={partner.name}
                                className="logo-hover-effect"
                            >
                                <img src={partner.logo_url} alt={partner.name} style={styles.brandLogo} />
                            </a>
                        )) : <p style={{color:'#666'}}>Wait for our new partners...</p>}
                    </div>
                )}
            </div>

            {/* Sponsors Section */}
            <div style={{...styles.brandsSection, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'}}>
                <h3 style={styles.sectionTitle}>💎 Official <span style={{color:'#00f2fe'}}>Sponsors</span></h3>
                
                {/* ✅ استخدام LoadingEffect هنا */}
                {loading ? (
                    <LoadingEffect message="Loading Sponsors..." />
                ) : (
                    <div style={styles.logosGrid}>
                        {sponsors.length > 0 ? sponsors.map((sponsor) => (
                            <a 
                                key={sponsor.id} 
                                href={sponsor.website_link || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                style={styles.logoWrapper} 
                                title={sponsor.name}
                                className="logo-hover-effect"
                            >
                                <img src={sponsor.logo_url} alt={sponsor.name} style={styles.brandLogo} />
                            </a>
                        )) : <p style={{color:'#666'}}>Wait for our new sponsors...</p>}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <p>© 2026 IEEE ET5 Student Branch. All rights reserved.</p>
                <p style={{ color: '#666', fontSize: '0.8rem' }}>Built with ❤️ for Engineers</p>
            </footer>
        </div>
    );
};

// ------------------------------------------------------
// ✅ 4️⃣ STYLES
// ------------------------------------------------------
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'white',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        position: 'relative',
        overflowX: 'hidden', 
        display: 'flex',
        flexDirection: 'column',
    },
    overlay: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        zIndex: 0
    },
    glow: {
        position: 'absolute', top: '-30%', right: '-10%', width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(79,172,254,0.1) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
    },
    navbar: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 50px',
        position: 'relative', zIndex: 10,
    },
    logoSubtitle: {
        fontSize: '0.9rem', color: '#e2e8f0', fontWeight: '600', letterSpacing: '3px',
        textTransform: 'uppercase', display: 'block', marginTop: '5px',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
    },
    loginBtn: {
        padding: '10px 25px', background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px',
        color: 'white', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s'
    },
    heroSection: {
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 10
    },
    badge: {
        background: 'rgba(79, 172, 254, 0.1)', color: '#4facfe', padding: '8px 16px',
        borderRadius: '20px', fontSize: '0.9rem', marginBottom: '20px', fontWeight: 'bold',
        border: '1px solid rgba(79, 172, 254, 0.2)'
    },
    title: {
        fontSize: '3.5rem', fontWeight: '800', margin: '0 0 20px 0', lineHeight: '1.2'
    },
    gradientText: {
        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        fontSize: '1.1rem', color: '#94a3b8', maxWidth: '700px', marginBottom: '40px', lineHeight: '1.6'
    },
    ctaGroup: { display: 'flex', gap: '20px' },
    primaryBtn: {
        padding: '15px 40px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#0f172a', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 0 20px rgba(79, 172, 254, 0.4)', transition: 'transform 0.2s'
    },
    secondaryBtn: {
        padding: '15px 40px', background: 'transparent', color: 'white',
        border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50px',
        fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s'
    },
    featuresStrip: {
        display: 'flex', justifyContent: 'center', gap: '30px', padding: '30px',
        background: 'rgba(30, 41, 59, 0.3)', borderRadius: '15px', margin: '20px 5%',
        position: 'relative', zIndex: 10, flexWrap: 'wrap', backdropFilter: 'blur(5px)'
    },
    featureItem: {
        display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left', maxWidth: '300px'
    },
    featureIcon: {
        fontSize: '2rem', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px'
    },
    
    // --- Styles for Partners & Sponsors ---
    brandsSection: {
        padding: '60px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))',
        borderTop: '1px solid rgba(255,255,255,0.05)'
    },
    sectionTitle: {
        fontSize: '1.8rem',
        fontWeight: '800',
        marginBottom: '50px',
        color: 'white',
        letterSpacing: '1px',
        textShadow: '0 4px 10px rgba(0,0,0,0.5)'
    },
    logosGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px', 
        flexWrap: 'wrap',
        maxWidth: '1000px',
        margin: '0 auto'
    },
    logoWrapper: {
        width: '140px',       
        height: '80px',       
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    brandLogo: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    footer: {
        padding: '30px 20px', textAlign: 'center', fontSize: '0.9rem', color: '#aaa',
        position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)'
    }
};

export default LandingPage;
