import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  // const [setNumber, setSetNumber] = useState(""); // Set number removed - strictly using Set 1
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const API_URL = API_BASE_URL; // Use centralized config
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users and scores in parallel
    const fetchData = async () => {
      try {
        const [usersResponse, scoresResponse] = await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/scores`),
        ]);

        // Handle response format: arrays are returned directly, objects are wrapped
        const usersData = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : usersResponse.data?.data || usersResponse.data || [];
        const scoresData = Array.isArray(scoresResponse.data)
          ? scoresResponse.data
          : scoresResponse.data?.data || scoresResponse.data || [];

        if (usersData && usersData.length > 0) {
          setUsers(usersData);
        } else {
          console.log("No users found.");
        }

        if (scoresData && scoresData.length > 0) {
          setScores(scoresData);
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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setUploadStatus("");
      } else {
        setUploadStatus("Please select a PDF file only.");
        setSelectedFile(null);
      }
    }
  };

  // Handle setNumber change
  // Handle setNumber change - REMOVED (Single Set Mode)
  // const handleSetNumberChange = (e) => {
  //   const value = e.target.value;
  //   // Only allow positive integers
  //   if (value === "" || /^\d+$/.test(value)) {
  //     setSetNumber(value);
  //     setUploadStatus("");
  //   }
  // };

  // Handle PDF upload
  const handleUpload = async () => {
    console.log("🚀 handleUpload clicked!");
    if (!selectedFile) {
      console.log("❌ No file selected");
      setUploadStatus("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    console.log("📂 FormData prepared with file:", selectedFile.name);

    setUploadStatus("Uploading and processing PDF...");
    setUploadProgress(0);

    try {
      console.log("📡 Sending request to:", `${API_URL}/upload-pdf`);
      const response = await axios.post(`${API_URL}/upload-pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`⏳ Progress: ${percentCompleted}%`);
          setUploadProgress(percentCompleted);
        },
      });

      console.log("✅ Response received:", response.data);
      // Handle response format: backend wraps in { success: true, data: {...} }
      const uploadData = response.data.data || response.data;
      setUploadStatus(
        `✅ PDF uploaded successfully! Generated ${uploadData.questionsGenerated || uploadData.questionsCount || 0} questions.`
      );
      setSelectedFile(null);
      // setSetNumber("");
      setUploadProgress(0);
      // Reset file input
      document.getElementById("pdf-upload-input").value = "";

      setTimeout(() => {
        setUploadStatus("");
      }, 5000);
    } catch (error) {
      console.error("Error uploading PDF:", error);
      const errorMessage = error.response?.data?.message || "❌ Error uploading PDF. Please try again.";
      setUploadStatus(errorMessage);
      setUploadProgress(0);
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

      {/* PDF Upload Section */}
      <div style={styles.section} className="dashboard-section">
        <h3 style={styles.sectionHeader}>📄 Upload PDF</h3>
        <div style={styles.uploadContainer}>
          <div style={styles.fileInputWrapper}>
            <input
              type="file"
              id="pdf-upload-input"
              accept=".pdf"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <label htmlFor="pdf-upload-input" style={styles.fileInputLabel}>
              {selectedFile ? `📎 ${selectedFile.name}` : "📎 Choose PDF File"}
            </label>
          </div>

          {selectedFile && (
            <div style={styles.fileInfo}>
              <p style={styles.fileName}>File: {selectedFile.name}</p>
              <p style={styles.fileSize}>
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadProgress > 0}
            style={{
              ...styles.uploadButton,
              opacity: !selectedFile || uploadProgress > 0 ? 0.5 : 1,
              cursor:
                !selectedFile || uploadProgress > 0 ? "not-allowed" : "pointer",
            }}
            className="upload-button"
          >
            {uploadProgress > 0 ? "Uploading..." : "🚀 Upload PDF"}
          </button>
        </div>
      </div>

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
  uploadContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
  },
  fileInputWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
  },
  fileInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    zIndex: 2,
  },
  fileInputLabel: {
    display: "block",
    padding: "15px 30px",
    backgroundColor: "rgba(69, 243, 255, 0.1)",
    border: "2px dashed #45f3ff",
    borderRadius: "15px",
    color: "#45f3ff",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontSize: "16px",
    fontWeight: "500",
    textShadow: "0 0 5px #45f3ff",
  },
  fileInfo: {
    width: "100%",
    maxWidth: "500px",
    padding: "15px",
    backgroundColor: "rgba(69, 243, 255, 0.05)",
    borderRadius: "10px",
    border: "1px solid rgba(69, 243, 255, 0.2)",
  },
  fileName: {
    color: "#45f3ff",
    margin: "5px 0",
    fontSize: "14px",
  },
  fileSize: {
    color: "#ffffff",
    margin: "5px 0",
    fontSize: "12px",
    opacity: 0.7,
  },
  setNumberContainer: {
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  setNumberLabel: {
    color: "#45f3ff",
    fontSize: "16px",
    fontWeight: "500",
    textShadow: "0 0 5px #45f3ff",
  },
  required: {
    color: "#ff2770",
    marginLeft: "4px",
  },
  setNumberInput: {
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "rgba(69, 243, 255, 0.05)",
    border: "2px solid rgba(69, 243, 255, 0.3)",
    borderRadius: "10px",
    color: "#ffffff",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s ease",
  },
  setNumberHint: {
    color: "#ffffff",
    fontSize: "12px",
    opacity: "0.7",
    margin: 0,
  },
  progressContainer: {
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "rgba(69, 243, 255, 0.1)",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid rgba(69, 243, 255, 0.2)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#45f3ff",
    borderRadius: "10px",
    transition: "width 0.3s ease",
    boxShadow: "0 0 10px #45f3ff",
  },
  progressText: {
    color: "#45f3ff",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  uploadStatus: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "500",
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "rgba(69, 243, 255, 0.05)",
  },
  uploadButton: {
    backgroundColor: "rgba(69, 243, 255, 0.1)",
    color: "#45f3ff",
    border: "2px solid #45f3ff",
    borderRadius: "30px",
    padding: "12px 40px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
    textShadow: "0 0 5px #45f3ff",
    letterSpacing: "1px",
    minWidth: "200px",
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

  .upload-button:hover:not(:disabled) {
    background-color: rgba(69, 243, 255, 0.2) !important;
    box-shadow: 0 0 20px rgba(69, 243, 255, 0.4);
    transform: translateY(-2px);
  }

  label:hover {
    background-color: rgba(69, 243, 255, 0.15) !important;
    border-color: #45f3ff !important;
    box-shadow: 0 0 15px rgba(69, 243, 255, 0.3);
  }

  input[type="text"]:focus {
    border-color: #45f3ff !important;
    box-shadow: 0 0 15px rgba(69, 243, 255, 0.4);
    background-color: rgba(69, 243, 255, 0.08) !important;
  }

  @keyframes floatingOrb {
    0% { transform: translate(0, 0); }
    50% { transform: translate(30px, -30px); }
    100% { transform: translate(0, 0); }
  }
`;

export default Dashboard;