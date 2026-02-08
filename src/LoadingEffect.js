import React from 'react';

const LoadingEffect = ({ message = "Loading..." }) => {
    return (
        <div style={styles.container}>
            <div style={styles.spinner}></div>
            <p style={styles.text}>{message}</p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        width: '100%',
        height: '100%',
        minHeight: '200px', // ارتفاع أدنى عشان ميكونش لازق
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid rgba(79, 172, 254, 0.2)',
        borderTop: '4px solid #4facfe',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
    },
    text: {
        color: '#94a3b8',
        fontSize: '0.9rem',
        letterSpacing: '1.5px',
        fontWeight: '600',
        animation: 'pulse 1.5s infinite'
    }
};

// إضافة الـ Keyframes للـ Animation جوه الصفحة دي
const styleSheet = document.styleSheets[0];
const keyframesSpin = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
const keyframesPulse = `
    @keyframes pulse {
        0% { opacity: 0.6; }
        50% { opacity: 1; }
        100% { opacity: 0.6; }
    }
`;

// التأكد من عدم تكرار إضافة الـ Keyframes
try {
    styleSheet.insertRule(keyframesSpin, styleSheet.cssRules.length);
    styleSheet.insertRule(keyframesPulse, styleSheet.cssRules.length);
} catch (e) {}

export default LoadingEffect;
