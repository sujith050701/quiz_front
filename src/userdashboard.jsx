import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [score, setScore] = useState(0);
    const [attemptNumber, setAttemptNumber] = useState(0);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        console.log("Fetched User ID:", userId);

        if (!userId) {
            console.error("No user ID found in local storage!");
            return;
        }

        // Fetch user details
        axios.get(`http://192.168.29.171:3002/api/users/${userId}`)
            .then(response => {
                setName(response.data.name);
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });

        // Fetch user score
        axios.get(`http://192.168.29.171:3002/api/scores/${userId}`)
            .then(response => {
                setScore(response.data.totalScore);
                setAttemptNumber(response.data.attemptNumber || 1);
                console.log("User score:", response.data.totalScore);
                console.log("Attempt Number:", response.data.attemptNumber);
            })
            .catch(error => {
                console.error('Error fetching user score:', error);
            });
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>User Dashboard</h1>
                <div style={styles.userInfo}>
                    <p style={styles.info}><strong>Name:</strong> {name}</p>
                    <p style={styles.info}><strong>Username:</strong> {username}</p>
                    <p style={styles.info}><strong>Score:</strong> {score}</p>
                    <p style={styles.info}><strong>Attempt Number:</strong> {attemptNumber}</p>
                </div>

                <div style={styles.instructionsCard}>
                    <h2 style={styles.instructionsTitle}>Quiz Instructions</h2>
                    <div style={styles.instructionsList}>
                        <div style={styles.instructionItem}>
                            <span style={styles.icon}>🎯</span>
                            <p>Total Questions: <strong>20</strong></p>
                        </div>
                        <div style={styles.instructionItem}>
                            <span style={styles.icon}>⏱️</span>
                            <p>Time Allotted: <strong>30 minutes</strong></p>
                        </div>
                        <div style={styles.instructionItem}>
                            <span style={styles.icon}>🎯</span>
                            <p>Marks per Question: <strong>1 mark</strong></p>
                        </div>
                        <div style={styles.instructionItem}>
                            <span style={styles.icon}>❌</span>
                            <p>No negative marking</p>
                        </div>
                        <div style={styles.warningBox}>
                            <span style={styles.warningIcon}>⚠️</span>
                            <p>This is a FREE online test. Beware of scammers who ask for money!</p>
                        </div>
                        <div style={styles.warningBox}>
                            <span style={styles.warningIcon}>⚡</span>
                            <p>DO NOT refresh the page during the test!</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={styles.buttonContainer}>
                <Link 
                    to="/quiz"
                    style={styles.startButton}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 0 30px #ff2770, 0 0 60px #ff2770';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 39, 112, 0.5)';
                    }}
                >
                    Start Test
                    <span style={{ fontSize: '24px' }}>→</span>
                </Link>
            </div>
            
            <div style={glowingOrbs}></div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#25252b',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    card: {
        backgroundColor: 'rgba(37, 37, 43, 0.9)',
        padding: '30px',
        borderRadius: '20px',
        boxShadow: `0 0 20px #45f3ff,
                    0 0 40px #45f3ff,
                    inset 0 0 60px rgba(69, 243, 255, 0.2)`,
        maxWidth: '600px',
        width: '100%',
        border: '1px solid rgba(69, 243, 255, 0.3)',
        position: 'relative',
        backdropFilter: 'blur(10px)',
    },
    title: {
        color: '#45f3ff',
        fontSize: '2.8em',
        marginBottom: '30px',
        textAlign: 'center',
        fontWeight: '700',
        textShadow: '0 0 10px #45f3ff',
        letterSpacing: '2px',
    },
    userInfo: {
        backgroundColor: 'rgba(255, 39, 112, 0.1)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '30px',
        border: '1px solid rgba(255, 39, 112, 0.3)',
        boxShadow: '0 0 15px rgba(255, 39, 112, 0.2)',
    },
    info: {
        fontSize: '16px',
        color: '#ffffff',
        margin: '12px 0',
        textShadow: '0 0 5px rgba(69, 243, 255, 0.5)',
    },
    instructionsCard: {
        backgroundColor: 'rgba(69, 243, 255, 0.1)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '30px',
        border: '1px solid rgba(69, 243, 255, 0.3)',
        boxShadow: '0 0 15px rgba(69, 243, 255, 0.2)',
    },
    instructionsTitle: {
        color: '#ff2770',
        fontSize: '1.8em',
        marginBottom: '25px',
        textAlign: 'center',
        textShadow: '0 0 10px #ff2770',
        letterSpacing: '1px',
    },
    instructionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    instructionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontSize: '16px',
        color: '#ffffff',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: 'rgba(69, 243, 255, 0.05)',
        transition: 'all 0.3s ease',
        ':hover': {
            backgroundColor: 'rgba(69, 243, 255, 0.1)',
            transform: 'translateX(5px)',
        },
    },
    icon: {
        fontSize: '24px',
        filter: 'drop-shadow(0 0 5px #45f3ff)',
    },
    warningBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        backgroundColor: 'rgba(255, 39, 112, 0.1)',
        padding: '15px',
        borderRadius: '12px',
        marginTop: '15px',
        border: '1px solid rgba(255, 39, 112, 0.3)',
        color: '#ffffff',
        boxShadow: '0 0 15px rgba(255, 39, 112, 0.2)',
    },
    warningIcon: {
        fontSize: '24px',
        filter: 'drop-shadow(0 0 5px #ff2770)',
    },
    buttonContainer: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        width: 'auto',
        textAlign: 'center',
        marginTop: '30px',
        paddingBottom: '20px',
        '@media (max-width: 768px)': {
            bottom: '15px',
            paddingBottom: '15px',
        },
        '@media (max-width: 480px)': {
            bottom: '10px',
            paddingBottom: '10px',
        },
    },
    startButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#ff2770',
        color: '#ffffff',
        padding: '15px 40px',
        borderRadius: '30px',
        textDecoration: 'none',
        fontSize: '18px',
        fontWeight: '600',
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 0 20px rgba(255, 39, 112, 0.5)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        '@media (max-width: 768px)': {
            padding: '12px 30px',
            fontSize: '16px',
        },
        '@media (max-width: 480px)': {
            padding: '10px 25px',
            fontSize: '14px',
        },
    },
};

const glowingOrbs = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    ':before': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '600px',
        height: '600px',
        background: '#45f3ff',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        filter: 'blur(100px)',
        opacity: '0.15',
    },
    ':after': {
        content: '""',
        position: 'absolute',
        top: '30%',
        right: '20%',
        width: '400px',
        height: '400px',
        background: '#ff2770',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: '0.15',
    },
};

const mediaQueries = `
    @media (max-width: 768px) {
        .buttonContainer {
            bottom: 15px;
            padding-bottom: 15px;
        }
        .startButton {
            padding: 12px 30px;
            font-size: 16px;
        }
    }

    @media (max-width: 480px) {
        .buttonContainer {
            bottom: 10px;
            padding-bottom: 10px;
        }
        .startButton {
            padding: 10px 25px;
            font-size: 14px;
        }
    }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = mediaQueries;
document.head.appendChild(styleSheet);

export default UserDashboard;
 