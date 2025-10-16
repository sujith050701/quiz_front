import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        let setNumber = localStorage.getItem("quizSetNumber");

        if (!setNumber) {
          setNumber = Math.floor(Math.random() * 3) + 1;
          localStorage.setItem("quizSetNumber", setNumber);
        }

        const response = await axios.get(`http://192.168.29.171:3002/api/questions/${setNumber}/random`);
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert("Error fetching questions.");
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prevAnswers) => {
      if (prevAnswers[questionId] === answer) {
        // Deselect the answer if it's already selected
        const { [questionId]: _, ...rest } = prevAnswers; // Remove the selected answer
        return rest;
      }
      // Select the new answer
      return { ...prevAnswers, [questionId]: answer };
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

      const setNumber = localStorage.getItem("quizSetNumber") || 1;
      const formattedAnswers = {};
      questions.forEach((q) => {
        if (answers.hasOwnProperty(q._id.toString())) {
          formattedAnswers[q._id.toString()] = answers[q._id.toString()];
        }
      });

      const response = await axios.post("http://192.168.29.171:3002/api/scores/sc", {
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

          body {
            background: #25252b;
            margin: 0;
            padding: 0;
          }
        `}</style>
        <h1 style={styles.quizTitle}>Quiz</h1>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progress,
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
        {currentQuestion && (
          <div style={styles.questionCard}>
            <p style={styles.questionText}>{currentQuestion.question}</p>
            <div style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion._id.toString(), option)}
                  style={{
                    ...styles.optionButton,
                    ...(answers[currentQuestion._id] === option ? styles.selectedOption : {}),
                  }}
                >
                  {option}
                </button>
              ))}
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
};