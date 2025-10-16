import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const API_URL = "http://192.168.29.171:3002/api"; // Backend Base URL
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users and scores in parallel
    const fetchData = async () => {
      try {
        const [usersResponse, scoresResponse] = await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/scores`),
        ]);

        if (usersResponse.data) {
          setUsers(usersResponse.data);
        } else {
          console.log("No users found.");
        }

        if (scoresResponse.data) {
          setScores(scoresResponse.data);
        } else {
          console.log("No scores found.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Delete user by ID
  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/users/${userId}`);
        setUsers(users.filter((user) => user._id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Delete score by ID
  const deleteScore = async (scoreId) => {
    if (window.confirm("Are you sure you want to delete this score?")) {
      try {
        await axios.delete(`${API_URL}/scores/${scoreId}`);
        setScores(scores.filter((score) => score._id !== scoreId));
      } catch (error) {
        console.error("Error deleting score:", error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <style>{animations}</style>
      
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: '#45f3ff',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: '0.15',
        animation: 'floatingOrb 8s infinite ease-in-out',
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '20%',
        width: '400px',
        height: '400px',
        background: '#ff2770',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: '0.15',
        animation: 'floatingOrb 8s infinite ease-in-out reverse',
      }}></div>

      <h2 style={styles.header}>📊 Admin Dashboard</h2>
      
      <div style={styles.section} className="dashboard-section">
        <h3 style={styles.sectionHeader}>👥 User Details</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>SNo</th>
              <th style={styles.tableHeader}>Name</th>
              <th style={styles.tableHeader}>Username</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{index + 1}</td>
                  <td style={styles.tableCell}>{user.name}</td>
                  <td style={styles.tableCell}>{user.username}</td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.deleteButton}
                      onClick={() => deleteUser(user._id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={styles.tableCell}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionHeader}>🏆 Quiz Scores</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>SNo</th>
              <th style={styles.tableHeader}>User Name</th>
              <th style={styles.tableHeader}>Set Number</th>
              <th style={styles.tableHeader}>Total Score</th>
              <th style={styles.tableHeader}>Details</th>
              <th style={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {scores.length > 0 ? (
              scores.map((score, index) => {
                // Extract the actual ID from the userId object if it exists
                const scoreUserId = score.userId?._id || score.userId;
                console.log("Score userId:", scoreUserId);
                
                const user = users.find((u) => {
                  const userId = String(u._id);
                  console.log("Comparing:", scoreUserId, "with", userId);
                  return String(scoreUserId) === userId;
                });

                return (
                  <tr key={score._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      <span style={user ? styles.userName : styles.unknownUser}>
                        {user ? user.name : "Loading..."}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{score.setNumber}</td>
                    <td style={styles.tableCell}>{score.totalScore}</td>
                    <td style={styles.tableCell}>
                      {score.scoreByTopic ? (
                        Object.entries(score.scoreByTopic).map(
                          ([topic, value]) => (
                            <p key={topic} style={styles.scoreDetail}>
                              <strong>{topic}:</strong> {value}
                            </p>
                          )
                        )
                      ) : (
                        <p>No details available</p>
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        style={styles.deleteButton}
                        onClick={() => deleteScore(score._id)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={styles.tableCell}>
                  No scores found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button style={styles.homeButton} className="home-button" onClick={() => navigate("/")}>
        Go Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: "#25252b",
    minHeight: "100vh",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  header: {
    textAlign: "center",
    color: "#45f3ff",
    marginBottom: "40px",
    fontSize: "2.5rem",
    fontWeight: "bold",
    textShadow: "0 0 10px #45f3ff",
    letterSpacing: "2px",
  },
  section: {
    backgroundColor: "rgba(69, 243, 255, 0.05)",
    borderRadius: "20px",
    boxShadow: "0 0 20px rgba(69, 243, 255, 0.2)",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid rgba(69, 243, 255, 0.2)",
    backdropFilter: "blur(10px)",
    animation: "slideIn 0.5s ease-in-out",
  },
  sectionHeader: {
    color: "#ff2770",
    marginBottom: "25px",
    fontSize: "1.8rem",
    fontWeight: "bold",
    textShadow: "0 0 10px #ff2770",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
    marginBottom: "20px",
  },
  tableHeader: {
    backgroundColor: "rgba(255, 39, 112, 0.1)",
    color: "#ff2770",
    padding: "15px",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #ff2770",
    textShadow: "0 0 5px #ff2770",
  },
  tableRow: {
    transition: "all 0.3s ease",
    backgroundColor: "rgba(69, 243, 255, 0.05)",
  },
  tableCell: {
    padding: "15px",
    textAlign: "left",
    color: "#ffffff",
    borderBottom: "1px solid rgba(69, 243, 255, 0.2)",
  },
  scoreDetail: {
    margin: "4px 0",
    color: "#45f3ff",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 39, 112, 0.2)",
    color: "#ff2770",
    border: "1px solid #ff2770",
    borderRadius: "30px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
    textShadow: "0 0 5px #ff2770",
  },
  homeButton: {
    backgroundColor: "rgba(69, 243, 255, 0.1)",
    color: "#45f3ff",
    border: "1px solid #45f3ff",
    borderRadius: "30px",
    padding: "12px 30px",
    cursor: "pointer",
    fontSize: "16px",
    display: "block",
    margin: "30px auto",
    transition: "all 0.3s ease",
    textShadow: "0 0 5px #45f3ff",
    letterSpacing: "1px",
  },
  userName: {
    color: "#45f3ff",
  },
  unknownUser: {
    color: "#ff2770",
  },
};

const animations = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      filter: blur(10px);
    }
    to {
      opacity: 1;
      filter: blur(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes glowingBorder {
    0% { border-color: rgba(69, 243, 255, 0.2); }
    50% { border-color: rgba(69, 243, 255, 0.8); }
    100% { border-color: rgba(69, 243, 255, 0.2); }
  }

  .dashboard-section {
    animation: glowingBorder 2s infinite;
  }

  tr:hover {
    background-color: rgba(69, 243, 255, 0.1) !important;
    transform: translateX(10px);
    box-shadow: 0 0 20px rgba(69, 243, 255, 0.2);
  }

  .delete-button:hover {
    background-color: rgba(255, 39, 112, 0.4) !important;
    box-shadow: 0 0 15px rgba(255, 39, 112, 0.4);
    transform: translateY(-2px);
  }

  .home-button:hover {
    background-color: rgba(69, 243, 255, 0.2) !important;
    box-shadow: 0 0 20px rgba(69, 243, 255, 0.4);
    transform: translateY(-2px);
  }

  /* Add glowing orbs animation */
  @keyframes floatingOrb {
    0% { transform: translate(0, 0); }
    50% { transform: translate(30px, -30px); }
    100% { transform: translate(0, 0); }
  }
`;

export default Dashboard;