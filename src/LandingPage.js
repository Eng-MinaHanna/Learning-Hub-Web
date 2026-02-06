import React from 'react';

const LandingPage = ({ onGetStarted, user }) => {
    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>
            <div style={styles.glow}></div>

            {/* Navbar */}
            <nav style={styles.navbar}>

                {/* --- اللوجو الجديد الموحد --- */}
                <div style={{ lineHeight: '1' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>
                        IEEE <span style={{ color: '#4facfe' }}>ET5 SB</span>
                    </h2>
                    <span style={{
                        fontSize: '0.9rem',
                        color: '#e2e8f0',
                        fontWeight: '600',
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginTop: '5px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                        Learning Hub
                    </span>
                </div>
                {/* --------------------------- */}

                {!user && (
                    <button onClick={onGetStarted} style={styles.loginBtn}>Login / Register</button>
                )}
            </nav>

            {/* Hero Section */}
            <div style={styles.heroSection}>
                <span style={styles.badge}>🚀 Welcome to the Future of Learning</span>

                <h1 style={styles.title}>
                    {user ? (
                        <>
                            Welcome Back, <br />
                            <span style={styles.gradientText}>{user.name}</span> 👋
                        </>
                    ) : (
                        <>
                            Master <span style={styles.gradientText}>Engineering</span> Skills <br />
                            With Top Experts.
                        </>
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
                    <div>
                        <h3>High-Quality Courses</h3>
                        <p>Learn from the best with curated video content.</p>
                    </div>
                </div>
                <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🧩</span>
                    <div>
                        <h3>Interactive Quizzes</h3>
                        <p>Test your knowledge and track your growth.</p>
                    </div>
                </div>
                <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🎓</span>
                    <div>
                        <h3>Earn Certificates</h3>
                        <p>Get certified upon completing tracks.</p>
                    </div>
                </div>
            </div>

            <footer style={styles.footer}>
                <p>© 2026 IEEE ET5 Student Branch. All rights reserved.</p>
                <p style={{ color: '#666', fontSize: '0.8rem' }}>Built with ❤️ for Engineers</p>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'transparent',
        color: 'white',
        fontFamily: "'Cairo', 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
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
    logo: { margin: 0, fontSize: '1.8rem', fontWeight: 'bold' },
    loginBtn: {
        padding: '10px 25px',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: '0.3s'
    },
    heroSection: {
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        position: 'relative', zIndex: 10
    },
    badge: {
        background: 'rgba(79, 172, 254, 0.1)',
        color: '#4facfe',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '0.9rem',
        marginBottom: '20px',
        fontWeight: 'bold',
        border: '1px solid rgba(79, 172, 254, 0.2)'
    },
    title: {
        fontSize: '3.5rem',
        fontWeight: '800',
        margin: '0 0 20px 0',
        lineHeight: '1.2'
    },
    gradientText: {
        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#94a3b8',
        maxWidth: '700px',
        marginBottom: '40px',
        lineHeight: '1.6'
    },
    ctaGroup: { display: 'flex', gap: '20px' },
    primaryBtn: {
        padding: '15px 40px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#0f172a',
        border: 'none',
        borderRadius: '50px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(79, 172, 254, 0.4)',
        transition: 'transform 0.2s'
    },
    secondaryBtn: {
        padding: '15px 40px',
        background: 'transparent',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '50px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: '0.3s'
    },
    featuresStrip: {
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        padding: '30px',
        background: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '15px',
        margin: '20px',
        position: 'relative', zIndex: 10,
        flexWrap: 'wrap'
    },
    featureItem: {
        display: 'flex', alignItems: 'center', gap: '15px',
        textAlign: 'left',
        maxWidth: '300px'
    },
    featureIcon: {
        fontSize: '2rem',
        background: 'rgba(255,255,255,0.05)',
        padding: '15px',
        borderRadius: '12px'
    },
    footer: {
        padding: '20px',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#aaa',
        position: 'relative', zIndex: 10
    }
};

export default LandingPage;