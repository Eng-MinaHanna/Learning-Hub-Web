import React, { useState, useEffect } from 'react';
import API from './api'; 

const CalendarView = ({ onOpenCourse }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);

    // ✅ 1. إضافة حساس حجم الشاشة للموبايل
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        API.get('/schedule/all')
            .then(res => {
                setEvents(res.data);
            })
            .catch(err => console.error("Error loading schedule:", err));
    }, []);

    // --- Helpers ---
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysArray = [...Array(firstDay).fill(null), ...Array(daysInMonth).keys()];

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getEventsForDay = (dateObj) => {
        return events.filter(ev => {
            if (!ev.video_date) return false;
            const videoDate = new Date(ev.video_date);
            return isSameDay(dateObj, videoDate);
        }).sort((a, b) => new Date(a.video_date) - new Date(b.video_date));
    };

    const handleDayClick = (day) => {
        if (day !== null) {
            const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
            setSelectedDate(newSelectedDate);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const selectedDayEvents = getEventsForDay(selectedDate);

    return (
        <div style={{ ...styles.container, padding: isMobile ? '15px' : '30px' }}>
            {/* Header: يقلب عمودي في الموبايل */}
            <div style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '20px' : '0' }}>
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: isMobile ? '1.4rem' : '1.8rem' }}>📅 Academic Schedule</h2>
                    <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>Plan your learning journey.</p>
                </div>
                <div style={{ ...styles.controls, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                    <button onClick={() => changeMonth(-1)} style={styles.navBtn}>◀</button>
                    <span style={{ ...styles.monthTitle, fontSize: isMobile ? '1rem' : '1.2rem', minWidth: isMobile ? '120px' : '150px' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button onClick={() => changeMonth(1)} style={styles.navBtn}>▶</button>
                </div>
            </div>

            {/* Layout: يقلب عمودي في الموبايل */}
            <div style={{ ...styles.layout, flexDirection: isMobile ? 'column' : 'row' }}>
                
                {/* الجزء الخاص بالتقويم */}
                <div style={{ ...styles.calendarSection, minWidth: isMobile ? '100%' : '400px' }}>
                    <div style={styles.weekGrid}>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                            <div key={d} style={{ ...styles.weekDay, fontSize: isMobile ? '0.6rem' : '0.8rem' }}>{d}</div>
                        ))}
                    </div>

                    <div style={{ ...styles.daysGrid, gap: isMobile ? '4px' : '8px' }}>
                        {daysArray.map((day, index) => {
                            const cellDate = day !== null ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1) : null;
                            const dayEvents = cellDate ? getEventsForDay(cellDate) : [];
                            const isToday = cellDate && isSameDay(new Date(), cellDate);
                            const isSelected = cellDate && isSameDay(selectedDate, cellDate);

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleDayClick(day)}
                                    style={{
                                        ...(day === null ? styles.emptyDay : styles.dayCell),
                                        minHeight: isMobile ? '60px' : '100px', // تصغير الارتفاع للموبايل
                                        border: isSelected ? '2px solid #ffd700' : (isToday ? '1px solid #4facfe' : '1px solid rgba(255,255,255,0.05)'),
                                        backgroundColor: isSelected ? 'rgba(255, 215, 0, 0.05)' : (isToday ? 'rgba(79, 172, 254, 0.05)' : 'rgba(255,255,255,0.02)'),
                                        cursor: day !== null ? 'pointer' : 'default'
                                    }}
                                >
                                    {day !== null && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                <span style={{
                                                    ...styles.dayNumber,
                                                    fontSize: isMobile ? '0.75rem' : '0.9rem',
                                                    color: isSelected ? '#ffd700' : (isToday ? '#4facfe' : (dayEvents.length > 0 ? 'white' : '#555')),
                                                    fontWeight: (isToday || isSelected) ? '900' : 'bold'
                                                }}>
                                                    {day + 1}
                                                </span>
                                                {dayEvents.length > 0 && <span style={{ ...styles.dot, width: isMobile ? '4px' : '6px', height: isMobile ? '4px' : '6px' }}></span>}
                                            </div>
                                            <div style={styles.miniEvents}>
                                                {dayEvents.slice(0, 1).map(ev => (
                                                    <div key={ev.id} style={{ ...styles.miniBar, width: '100%' }}></div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* جزء التفاصيل (التسلسل الزمني) */}
                <div style={{ ...styles.detailsSidebar, minWidth: isMobile ? '100%' : '250px', marginTop: isMobile ? '20px' : '0' }}>
                    <div style={styles.sidebarHeader}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                            {selectedDate.getDate()}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', color: '#4facfe', fontWeight: 'bold' }}>
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#888' }}>
                                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <div style={styles.timelineContainer}>
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map((ev) => (
                                <div key={ev.id} style={styles.timelineItem}>
                                    <div style={styles.timelineTime}>
                                        {formatTime(ev.video_date)}
                                        <div style={styles.timelineLine}></div>
                                    </div>
                                    <div style={styles.timelineContent}>
                                        <div style={styles.timelineBadge}>{ev.course_title}</div>
                                        <h4 style={{ margin: '5px 0', color: 'white', fontSize: '0.9rem' }}>🎥 {ev.video_title}</h4>
                                        <button onClick={() => onOpenCourse(ev.course_id)} style={styles.joinBtn}>View</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.noEventsState}>
                                <div style={{ fontSize: '2rem', opacity: 0.5 }}>☕</div>
                                <p style={{ color: '#aaa', fontSize: '0.8rem' }}>Free Day!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- الـ Styles الأصلية مع تعديلات طفيفة للمرونة ---
const styles = {
    container: { backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', minHeight: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    controls: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 15px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)' },
    navBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '0 10px' },
    monthTitle: { color: '#4facfe', fontWeight: 'bold', textAlign: 'center' },
    layout: { display: 'flex', gap: '20px' },
    calendarSection: { flex: 2 },
    detailsSidebar: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '15px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' },
    weekGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '15px' },
    weekDay: { textAlign: 'center', color: '#64748b', fontWeight: 'bold', padding: '5px' },
    daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
    dayCell: { borderRadius: '12px', padding: '8px', position: 'relative', transition: '0.2s', display: 'flex', flexDirection: 'column' },
    emptyDay: { minHeight: '60px' },
    dayNumber: { fontSize: '0.9rem' },
    dot: { borderRadius: '50%', backgroundColor: '#4facfe', boxShadow: '0 0 5px #4facfe' },
    miniEvents: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' },
    miniBar: { height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' },
    sidebarHeader: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
    timelineContainer: { display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '400px', paddingRight: '5px' },
    timelineItem: { display: 'flex', gap: '15px' },
    timelineTime: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px', color: '#ccc', fontSize: '0.75rem', fontWeight: 'bold', paddingTop: '5px' },
    timelineLine: { width: '2px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: '5px', borderRadius: '2px' },
    timelineContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', borderLeft: '3px solid #4facfe' },
    timelineBadge: { fontSize: '0.6rem', color: '#4facfe', fontWeight: 'bold', textTransform: 'uppercase' },
    joinBtn: { marginTop: '8px', padding: '4px 10px', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid #4facfe', color: '#4facfe', borderRadius: '20px', cursor: 'pointer' },
    noEventsState: { textAlign: 'center', marginTop: '30px' }
};

export default CalendarView;
