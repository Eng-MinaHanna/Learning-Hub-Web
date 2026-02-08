import React, { useState, useEffect } from 'react';
// import API from './api'; // 👈 سنحتاج هذا لاحقاً لجلب البيانات الحقيقية

const LandingPage = ({ onGetStarted, user }) => {
    // ----------------------------------------------------------------
    // 1️⃣ إعداد البيانات (هنا بيانات وهمية مؤقتاً لحد ما تربطها بالباك إند)
    // ----------------------------------------------------------------
    const [partners, setPartners] = useState([
        { id: 1, name: "Partner 1", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" },
        { id: 2, name: "Partner 2", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
        { id: 3, name: "Partner 3", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    ]);

    const [sponsors, setSponsors] = useState([
        { id: 1, name: "Sponsor A", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
        { id: 2, name: "Sponsor B", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
        { id: 3, name: "Sponsor C", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/2048px-Octicons-mark-github.svg.png" },
        { id: 4, name: "Sponsor D", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png" },
    ]);

    /* // ✅ 2️⃣ كود جلب البيانات من السيرفر (يتم تفعيله لما الباك إند يجهز)
    useEffect(() => {
        API.get('/public/partners').then(res => setPartners(res.data));
        API.get('/public/sponsors').then(res => setSponsors(res.data));
    }, []);
    */

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
            {/* ✅ 3️⃣ PARTNERS & SPONSORS SECTIONS (جديد) */}
            {/* ------------------------------------------------------ */}
            
            {/* Partners Section */}
            <div style={styles.brandsSection}>
                <h3 style={styles.sectionTitle}>🤝 Our Strategic <span style={{color:'#4facfe'}}>Partners</span></h3>
                <div style={styles.logosGrid}>
                    {partners.length > 0 ? partners.map((partner) => (
                        <div key={partner.id} style={styles.logoWrapper} title={partner.name}>
                            <img src={partner.logo} alt={partner.name} style={styles.brandLogo} />
                        </div>
                    )) : <p style={{color:'#666'}}>Coming Soon...</p>}
                </div>
            </div>

            {/* Sponsors Section */}
            <div style={{...styles.brandsSection, background: 'rgba(0,0,0,0.2)'}}>
                <h3 style={styles.sectionTitle}>💎 Official <span style={{color:'#00f2fe'}}>Sponsors</span></h3>
                <div style={styles.logosGrid}>
                    {sponsors.length > 0 ? sponsors.map((sponsor) => (
                        <div key={sponsor.id} style={styles.logoWrapper} title={sponsor.name}>
                            <img src={sponsor.logo} alt={sponsor.name} style={styles.brandLogo} />
                        </div>
                    )) : <p style={{color:'#666'}}>Coming Soon...</p>}
                </div>
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
// ✅ 4️⃣ STYLES UPDATED
// ------------------------------------------------------
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'white',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        position: 'relative',
        overflowX: 'hidden', // لمنع السكرول العرضي
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
        padding: '40px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        borderTop: '1px solid rgba(255,255,255,0.05)'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '30px',
        color: '#e2e8f0',
        letterSpacing: '1px'
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
        width: '120px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // هذا الفلتر يجعل اللوجو أبيض بالكامل ليناسب الخلفية الداكنة
        // وعند الوقوف عليه يظهر بلونه الأصلي
        filter: 'grayscale(100%) brightness(0) invert(1)',
        opacity: 0.7,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    brandLogo: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
    },
    
    footer: {
        padding: '30px 20px', textAlign: 'center', fontSize: '0.9rem', color: '#aaa',
        position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)'
    }
};

// 💡 إضافة صغيرة للـ Styles عشان الـ Hover يشتغل (React Inline Styles مش بتدعم hover selectors مباشرة)
// الحل الأفضل هو إضافة كلاس CSS خارجي، لكن بما إننا شغالين Inline
// ممكن تضيف السطر ده في ملف index.css عندك عشان التأثير يبان:
/*
.logo-hover-effect:hover {
    filter: none !important;
    opacity: 1 !important;
    transform: scale(1.1);
}
*/

export default LandingPage;
