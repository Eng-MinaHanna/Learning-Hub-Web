import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateModal = ({ studentName, courseName, date, onClose }) => {
    const certificateRef = useRef(null);

    const handleDownload = async () => {
        const element = certificateRef.current;

        // تحسين الجودة ودعم الصور الخارجية
        const canvas = await html2canvas(element, {
            scale: 3, // زيادة الدقة لـ 3 لضمان وضوح النصوص عند الطباعة
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`IEEE_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modalContent}>
                <h2 style={{ color: 'white', textAlign: 'center', margin: '0 0 5px 0' }}>🎉 Congratulations!</h2>
                <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '15px' }}>Your hard work has paid off. Download your official certificate below.</p>

                {/* --- تصميم الشهادة --- */}
                <div ref={certificateRef} style={styles.certificateContainer}>
                    <div style={styles.border}>
                        <div style={styles.header}>
                            <h1 style={styles.orgName}>IEEE <span style={{ color: '#00629B' }}>ET5</span> STUDENT BRANCH</h1>
                            <p style={styles.subHeader}>Certificate of Completion</p>
                        </div>

                        <div style={styles.body}>
                            <p style={styles.text}>This is to certify that</p>
                            <h2 style={styles.studentName}>{studentName}</h2>
                            <p style={styles.text}>Has successfully completed the training course:</p>
                            <h3 style={styles.courseName}>{courseName}</h3>
                            <p style={styles.text}>Demonstrating dedication and technical proficiency.</p>
                        </div>

                        <div style={styles.footer}>
                            <div style={styles.signature}>
                                <div style={styles.line}></div>
                                <p style={styles.sigText}>Instructor Signature</p>
                            </div>
                            <div style={styles.date}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '1.1rem' }}>{date}</p>
                                <div style={styles.line}></div>
                                <p style={styles.sigText}>Date</p>
                            </div>
                            <div style={styles.signature}>
                                <div style={styles.line}></div>
                                <p style={styles.sigText}>Chairman Signature</p>
                            </div>
                        </div>

                        <div style={styles.badge}>🏅</div>
                    </div>
                </div>

                <div style={styles.actions}>
                    <button onClick={handleDownload} style={styles.downloadBtn}>Download PDF ⬇️</button>
                    <button onClick={onClose} style={styles.closeBtn}>Close</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' },
    modalContent: { width: '100%', maxWidth: '950px', display: 'flex', flexDirection: 'column', gap: '10px' },

    certificateContainer: { background: '#fff', padding: '15px', color: '#333', position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '1.414/1', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },
    border: { border: '8px double #00629B', height: '100%', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', position: 'relative' },

    header: { textAlign: 'center', marginBottom: '10px' },
    orgName: { fontSize: '2.2rem', margin: 0, letterSpacing: '1px', color: '#1e293b', fontFamily: 'serif' },
    subHeader: { fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '4px', marginTop: '8px', color: '#00629B', fontWeight: 'bold' },

    body: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    text: { fontSize: '1.1rem', margin: '8px 0', fontStyle: 'italic', color: '#475569' },
    studentName: { fontSize: '3.2rem', margin: '10px 0', color: '#1e293b', fontFamily: "'Times New Roman', serif", textTransform: 'capitalize', borderBottom: '1px solid #e2e8f0', display: 'inline-block', paddingBottom: '5px' },
    courseName: { fontSize: '1.8rem', margin: '12px 0', color: '#00629B', fontWeight: 'bold' },

    footer: { display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '0 40px' },
    signature: { textAlign: 'center', width: '180px' },
    date: { textAlign: 'center', width: '150px' },
    line: { height: '1px', background: '#1e293b', marginBottom: '8px' },
    sigText: { fontSize: '0.85rem', margin: 0, fontWeight: 'bold', color: '#64748b' },

    badge: { position: 'absolute', bottom: '20px', right: '40px', fontSize: '5rem', opacity: 0.15 },

    actions: { display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' },
    downloadBtn: { padding: '12px 30px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.2s' },
    closeBtn: { padding: '12px 30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }
};

export default CertificateModal;