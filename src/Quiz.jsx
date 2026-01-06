import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "./config";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always use Set 1 (Single Set Mode)
        const setNumber = "1";
        // localStorage.setItem("quizSetNumber", setNumber); // Not needed anymore

        const apiUrl = `${API_BASE_URL}/questions/${setNumber}/random`;

        console.log("=== FETCHING QUESTIONS ===");
        console.log("Set Number:", setNumber);
        console.log("API URL:", apiUrl);

        const response = await axios.get(apiUrl);

        console.log("=== API RESPONSE ===");
        console.log("Full Response:", response);
        console.log("Response Data:", response.data);
        console.log("Response Data Type:", typeof response.data);
        console.log("Is Array?", Array.isArray(response.data));

        // Handle different possible response structures
        let questionsData = null;

        // Check if response.data is directly an array
        if (Array.isArray(response.data)) {
          questionsData = response.data;
          console.log("✓ Found array directly in response.data");
        }
        // Check for nested structures
        else if (response.data) {
          // Try response.data.questions
          if (Array.isArray(response.data.questions)) {
            questionsData = response.data.questions;
            console.log("✓ Found array in response.data.questions");
          }
          // Try response.data.data
          else if (Array.isArray(response.data.data)) {
            questionsData = response.data.data;
            console.log("✓ Found array in response.data.data");
          }
          // Try response.data.results
          else if (Array.isArray(response.data.results)) {
            questionsData = response.data.results;
            console.log("✓ Found array in response.data.results");
          }
          // Try single question object
          else if (response.data.question && typeof response.data.question === 'object') {
            questionsData = [response.data.question];
            console.log("✓ Found single question object");
          }
          // Try if response.data itself is an object with question-like properties
          else if (response.data._id || response.data.question) {
            questionsData = [response.data];
            console.log("✓ Found single question in response.data");
          }
          // Log the structure to help debug
          else {
            console.log("⚠ Unknown response structure. Keys:", Object.keys(response.data));
          }
        }

        if (!questionsData || questionsData.length === 0) {
          console.error("❌ No questions extracted from response");
          console.error("Full response structure:", JSON.stringify(response.data, null, 2));
          throw new Error("No questions found in the response. Please check the API response structure.");
        }

        // Validate question structure
        const validatedQuestions = questionsData.filter(q => {
          const hasQuestion = q.question || q.Question || q.text || q.questionText;
          const hasOptions = q.options || q.Options || q.choices || q.choice;
          return hasQuestion && hasOptions && Array.isArray(hasOptions);
        });

        if (validatedQuestions.length === 0) {
          console.error("❌ No valid questions found after validation");
          console.error("Sample question structure:", questionsData[0]);
          throw new Error("Questions found but missing required fields (question or options).");
        }

        // Normalize question structure
        const normalizedQuestions = validatedQuestions.map((q, index) => {
          return {
            _id: q._id || q.id || `temp-${index}`,
            question: q.question || q.Question || q.text || q.questionText || "",
            options: q.options || q.Options || q.choices || q.choice || [],
            correctAnswer: q.correctAnswer || q.correct || q.answer || null,
            topic: q.topic || q.Topic || q.category || null,
          };
        });

        console.log("✅ Questions loaded successfully:", normalizedQuestions.length);
        console.log("Sample question:", normalizedQuestions[0]);

        setQuestions(normalizedQuestions);
        setLoading(false);
      } catch (error) {
        console.error("❌ ERROR FETCHING QUESTIONS");
        console.error("Error object:", error);
        console.error("Error message:", error.message);
        console.error("Error response:", error.response);
        console.error("Error response data:", error.response?.data);
        console.error("Error response status:", error.response?.status);

        const errorMessage = error.response?.data?.message
          || error.response?.data?.error
          || error.message
          || "Error fetching questions. Please check the console for details.";

        setError(errorMessage);
        setLoading(false);
        setQuestions([]);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (questionId, answer) => {
    // Ensure questionId is a string for consistent key matching
    const questionIdStr = String(questionId);
    setAnswers((prevAnswers) => {
      if (prevAnswers[questionIdStr] === answer) {
        // Deselect the answer if it's already selected
        const { [questionIdStr]: _, ...rest } = prevAnswers; // Remove the selected answer
        return rest;
      }
      // Select the new answer
      return { ...prevAnswers, [questionIdStr]: answer };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (questions.length === 0) {
        alert("No questions available.");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("User not logged in.");
        return;
      }

      const setNumber = 1; // Always Set 1
      const formattedAnswers = {};
      questions.forEach((q) => {
        if (answers.hasOwnProperty(q._id.toString())) {
          formattedAnswers[q._id.toString()] = answers[q._id.toString()];
        }
      });

      const response = await axios.post(`${API_BASE_URL}/scores/sc`, {
        userId,
        setNumber,
        answers: formattedAnswers,
      });

      if (!response.data || typeof response.data.totalScore === "undefined") {
        throw new Error("Invalid response format from server");
      }

      const { totalScore, scoreByTopic, lowestTopic } = response.data;
      navigate("/result", { state: { totalScore, scoreByTopic, lowestTopic } });

      localStorage.removeItem("quizSetNumber");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Error submitting quiz.");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={styles.outerContainer}>
      <div style={styles.quizContainer}>
        <style>{`
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

          @keyframes glowing {
            0% { box-shadow: 0 0 15px rgba(69, 243, 255, 0.3); }
            50% { box-shadow: 0 0 30px rgba(69, 243, 255, 0.5); }
            100% { box-shadow: 0 0 15px rgba(69, 243, 255, 0.3); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          body {
            background: #25252b;
            margin: 0;
            padding: 0;
          }
        `}</style>
        <h1 style={styles.quizTitle}>Quiz</h1>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading questions...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>❌ {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={styles.retryButton}
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/userdashboard")}
              style={styles.backButton}
            >
              Go Back
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>No questions available for this set.</p>
            <button
              onClick={() => navigate("/userdashboard")}
              style={styles.backButton}
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progress,
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
            <p style={styles.questionCounter}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            {currentQuestion && (
              <div style={styles.questionCard}>
                <p style={styles.questionText}>
                  {currentQuestion.question || currentQuestion.Question || "Question text not available"}
                </p>
                <div style={styles.optionsContainer}>
                  {currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option, index) => {
                      const questionId = String(currentQuestion._id || index);
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswer(questionId, option)}
                          style={{
                            ...styles.optionButton,
                            ...(answers[questionId] === option ? styles.selectedOption : {}),
                          }}
                        >
                          {option}
                        </button>
                      );
                    })
                  ) : (
                    <div style={styles.errorContainer}>
                      <p style={styles.errorText}>No options available for this question.</p>
                      <p style={styles.debugText}>Question ID: {currentQuestion._id}</p>
                      <p style={styles.debugText}>Available keys: {Object.keys(currentQuestion).join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div style={styles.navigationButtons}>
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                style={styles.navButton}
              >
                Previous
              </button>
              {currentQuestionIndex < questions.length - 1 ? (
                <button onClick={handleNext} style={styles.navButton}>
                  Next
                </button>
              ) : (
                <button onClick={handleSubmit} style={styles.navButton}>
                  Submit
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;

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
  quizContainer: {
    background: 'rgba(37, 37, 43, 0.9)',
    borderRadius: '20px',
    boxShadow: `0 0 20px #45f3ff,
                0 0 40px rgba(69, 243, 255, 0.2)`,
    padding: '2rem',
    width: '90%',
    maxWidth: '800px',
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-in-out',
    border: '1px solid rgba(69, 243, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  quizTitle: {
    fontSize: '2.5rem',
    color: '#45f3ff',
    marginBottom: '1.5rem',
    textShadow: '0 0 10px #45f3ff',
    letterSpacing: '2px',
    fontWeight: '600',
  },
  progressBar: {
    background: 'rgba(69, 243, 255, 0.1)',
    borderRadius: '10px',
    height: '12px',
    width: '100%',
    marginBottom: '1.5rem',
    overflow: 'hidden',
    border: '1px solid rgba(69, 243, 255, 0.3)',
  },
  progress: {
    background: '#ff2770',
    height: '100%',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 15px #ff2770',
  },
  questionCard: {
    background: 'rgba(37, 37, 43, 0.9)',
    borderRadius: '15px',
    padding: '2rem',
    boxShadow: '0 0 15px rgba(69, 243, 255, 0.2)',
    marginBottom: '1.5rem',
    border: '1px solid rgba(69, 243, 255, 0.3)',
  },
  questionText: {
    fontSize: '1.3rem',
    color: '#ffffff',
    marginBottom: '1.5rem',
    textShadow: '0 0 5px rgba(69, 243, 255, 0.5)',
    lineHeight: '1.6',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  optionButton: {
    background: 'rgba(69, 243, 255, 0.1)',
    border: '1px solid rgba(69, 243, 255, 0.3)',
    borderRadius: '10px',
    padding: '1rem',
    fontSize: '1rem',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'rgba(69, 243, 255, 0.2)',
      transform: 'translateX(5px)',
      boxShadow: '0 0 15px rgba(69, 243, 255, 0.3)',
    },
  },
  selectedOption: {
    background: '#ff2770',
    color: 'white',
    border: '1px solid #ff2770',
    boxShadow: `0 0 15px #ff2770,
                0 0 30px rgba(255, 39, 112, 0.5)`,
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2rem',
    gap: '1rem',
  },
  navButton: {
    background: '#45f3ff',
    color: '#25252b',
    border: 'none',
    borderRadius: '30px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(69, 243, 255, 0.3)',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: `0 0 20px #45f3ff,
                  0 0 40px rgba(69, 243, 255, 0.5)`,
    },
    ':disabled': {
      background: 'rgba(69, 243, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.3)',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(69, 243, 255, 0.3)',
    borderTop: '4px solid #45f3ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#45f3ff',
    fontSize: '1.2rem',
    textShadow: '0 0 10px #45f3ff',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1.5rem',
  },
  errorText: {
    color: '#ff2770',
    fontSize: '1.2rem',
    textAlign: 'center',
    textShadow: '0 0 10px #ff2770',
  },
  retryButton: {
    background: '#45f3ff',
    color: '#25252b',
    border: 'none',
    borderRadius: '30px',
    padding: '0.8rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(69, 243, 255, 0.3)',
  },
  backButton: {
    background: 'rgba(255, 39, 112, 0.2)',
    color: '#ff2770',
    border: '1px solid #ff2770',
    borderRadius: '30px',
    padding: '0.8rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 15px rgba(255, 39, 112, 0.3)',
  },
  questionCounter: {
    color: '#ffffff',
    fontSize: '1rem',
    marginBottom: '1rem',
    opacity: 0.8,
  },
  debugText: {
    color: '#ffffff',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    opacity: 0.6,
    fontFamily: 'monospace',
  },
};