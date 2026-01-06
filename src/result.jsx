import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const videoLinks = {
  Percentage: {
    Hard: "https://example.com/percentage-hard",
    Medium: "https://example.com/percentage-medium",
    Basic: "https://example.com/percentage-basic",
  },
  Algebra: {
    Hard: "https://example.com/algebra-hard",
    Medium: "https://example.com/algebra-medium",
    Basic: "https://example.com/algebra-basic",
  },
  Geometry: {
    Hard: "https://example.com/geometry-hard",
    Medium: "https://example.com/geometry-medium",
    Basic: "https://example.com/geometry-basic",
  },
};

const classifyDifficulty = (score, total) => {
  const percentage = (score / total) * 100;
  if (percentage >= 60) return "Hard";
  if (percentage >= 35) return "Medium";
  return "Basic";
};

const classifyTotalScore = (score) => {
  if (score === 30) return "🌟 Outstanding Performance! You demonstrated exceptional mastery.";
  if (score >= 25) return "👏 Excellent Work! Your strong grasp of the concepts is evident.";
  if (score >= 20) return "👍 Great Effort! You're making significant progress.";
  return "💡 Keep Striving! Every attempt is a step toward improvement.";
};

const getAppreciationMessage = (difficulty) => {
  if (difficulty === "Hard") return "🚀 Exceptional! Your expertise in this topic is truly commendable.";
  if (difficulty === "Medium") return "📈 Well Done! A little more practice will take you to the next level.";
  return "📚 Keep Learning! Building a strong foundation is the key to success.";
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalScore, scoreByTopic } = location.state || {};

  if (!scoreByTopic) {
    alert("Invalid result data. Redirecting to the quiz...");
    navigate("/quiz");
    return null;
  }

  // Assume each topic has an equal number of questions (total/3)
  const totalQuestionsPerTopic = Math.ceil(30 / 3) || 1; // Assuming 30 total questions

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <style>
          {`
            body {
              background: #25252b;
              margin: 0;
              padding: 0;
              min-height: 100vh;
            }

            @keyframes fadeIn {
              from { 
                opacity: 0; 
                transform: translateY(20px);
                filter: blur(10px);
              }
              to { 
                opacity: 1; 
                transform: translateY(0);
                filter: blur(0);
              }
            }

            @keyframes glowingBorder {
              0% { border-color: rgba(69, 243, 255, 0.3); }
              50% { border-color: rgba(69, 243, 255, 0.8); }
              100% { border-color: rgba(69, 243, 255, 0.3); }
            }

            @keyframes floatingCard {
              0% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
              100% { transform: translateY(0); }
            }

            .topic-card {
              animation: floatingCard 3s ease-in-out infinite;
            }

            .progress-fill {
              animation: glowingProgress 2s infinite;
            }

            @keyframes glowingProgress {
              0% { box-shadow: 0 0 5px rgba(69, 243, 255, 0.5); }
              50% { box-shadow: 0 0 15px rgba(69, 243, 255, 0.8); }
              100% { box-shadow: 0 0 5px rgba(69, 243, 255, 0.5); }
            }
          `}
        </style>
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
        }}></div>
        <h1 style={styles.header}>📊 Quiz Results</h1>
        <div style={styles.totalScoreCard}>
          <h2 style={styles.totalScoreText}>Your Total Score: {totalScore}</h2>
          <p style={styles.totalScoreMessage}>{classifyTotalScore(totalScore)}</p>
        </div>

        <h3 style={styles.topicHeader}>📝 Performance by Topic</h3>
        {Object.entries(scoreByTopic).map(([topic, score]) => {
          const difficulty = classifyDifficulty(score, totalQuestionsPerTopic);
          const percentage = ((score / totalQuestionsPerTopic) * 100).toFixed(2);
          return (
            <div key={topic} style={styles.topicCard}>
              <h4 style={styles.topicTitle}>{topic}</h4>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${percentage}%`,
                    backgroundColor:
                      difficulty === "Hard" ? "#4CAF50" : difficulty === "Medium" ? "#FFC107" : "#F44336",
                  }}
                ></div>
              </div>
              <p style={styles.topicScore}>
                Score: {score}/{totalQuestionsPerTopic} ({percentage}%)
              </p>
              <p style={styles.topicMessage}>{getAppreciationMessage(difficulty)}</p>
              {videoLinks[topic] && videoLinks[topic][difficulty] ? (
                <a
                  href={videoLinks[topic][difficulty]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.videoLink}
                >
                  🎥 Watch Video for {topic}
                </a>
              ) : (
                <p style={styles.noVideoMessage}>
                  📚 Video resources for {topic} coming soon!
                </p>
              )}
            </div>
          );
        })}

        <button onClick={() => navigate("/userdashboard")} style={styles.homeButton}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Result;

// Internal CSS Styles
const styles = {
  outerContainer: {
    background: '#25252b',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem 0',
  },
  container: {
    maxWidth: "800px",
    width: '90%',
    padding: "2rem",
    textAlign: "center",
    animation: "fadeIn 0.5s ease-in-out",
    background: 'rgba(37, 37, 43, 0.9)',
    borderRadius: '20px',
    boxShadow: '0 0 30px rgba(69, 243, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  header: {
    fontSize: "3rem",
    color: "#45f3ff",
    marginBottom: "2rem",
    textShadow: '0 0 10px #45f3ff',
    fontWeight: '600',
    letterSpacing: '2px',
  },
  totalScoreCard: {
    background: 'rgba(69, 243, 255, 0.1)',
    color: "#ffffff",
    borderRadius: "20px",
    padding: "2rem",
    marginBottom: "2rem",
    boxShadow: '0 0 20px rgba(69, 243, 255, 0.3)',
    border: '1px solid rgba(69, 243, 255, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  totalScoreText: {
    fontSize: "2.5rem",
    margin: "0",
    color: "#45f3ff",
    textShadow: '0 0 10px #45f3ff',
  },
  totalScoreMessage: {
    fontSize: "1.3rem",
    margin: "1rem 0 0",
    color: "#ffffff",
  },
  topicHeader: {
    fontSize: "2rem",
    color: "#ff2770",
    marginBottom: "2rem",
    textShadow: '0 0 10px #ff2770',
  },
  topicCard: {
    background: 'rgba(255, 39, 112, 0.1)',
    borderRadius: "20px",
    padding: "2rem",
    marginBottom: "1.5rem",
    boxShadow: '0 0 20px rgba(255, 39, 112, 0.2)',
    border: '1px solid rgba(255, 39, 112, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 0 30px rgba(255, 39, 112, 0.4)',
    },
  },
  topicTitle: {
    fontSize: "1.8rem",
    color: "#ff2770",
    margin: "0 0 1.5rem",
    textShadow: '0 0 5px #ff2770',
  },
  progressBar: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: "15px",
    height: "15px",
    overflow: "hidden",
    marginBottom: "1.5rem",
    border: '1px solid rgba(69, 243, 255, 0.3)',
  },
  progressFill: {
    height: "100%",
    borderRadius: "15px",
    transition: "width 0.5s ease",
    boxShadow: '0 0 10px rgba(69, 243, 255, 0.5)',
  },
  topicScore: {
    fontSize: "1.3rem",
    color: "#ffffff",
    margin: "1rem 0",
  },
  topicMessage: {
    fontSize: "1.2rem",
    color: "#ffffff",
    margin: "1rem 0",
    textShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
  },
  videoLink: {
    display: "inline-block",
    background: "#45f3ff",
    color: "#25252b",
    padding: "0.8rem 1.5rem",
    borderRadius: "30px",
    textDecoration: "none",
    marginTop: "1.5rem",
    transition: "all 0.3s ease",
    fontWeight: '600',
    boxShadow: '0 0 15px rgba(69, 243, 255, 0.3)',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 0 30px rgba(69, 243, 255, 0.5)',
    },
  },
  noVideoMessage: {
    fontSize: "1rem",
    color: "#ffffff",
    marginTop: "1.5rem",
    opacity: 0.7,
    fontStyle: "italic",
  },
  homeButton: {
    background: "#ff2770",
    color: "#ffffff",
    border: "none",
    borderRadius: "30px",
    padding: "1rem 2rem",
    fontSize: "1.2rem",
    cursor: "pointer",
    marginTop: "2rem",
    transition: "all 0.3s ease",
    fontWeight: '600',
    boxShadow: '0 0 15px rgba(255, 39, 112, 0.3)',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 0 30px rgba(255, 39, 112, 0.5)',
    },
  },
};