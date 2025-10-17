import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getQuizData } from '../services/dataService';
import AdSenseBlock from '../components/common/AdSenseBlock';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [totalTime, setTotalTime] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [category, setCategory] = useState('');
  const [quizNumber, setQuizNumber] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questionTimerRef = useRef(null);
  const totalTimeTrackerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Effect 1: Fetch data based on URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const quizNum = params.get('quiz');

    if (!cat || !quizNum) {
      navigate('/english.html');
      return;
    }

    setCategory(cat);
    setQuizNumber(quizNum);

    const fetchQuestions = async () => {
      const allQuizzesForCategory = await getQuizData(cat);
      if (allQuizzesForCategory && allQuizzesForCategory[quizNum - 1]) {
        setQuestions(allQuizzesForCategory[quizNum - 1]);
      } else {
        console.error("Quiz data not found for", cat, quizNum);
      }
    };

    fetchQuestions();
  }, [location.search, navigate]);

  // Effect 2: Manage the total quiz timer
  useEffect(() => {
    if (questions.length > 0 && !quizEnded) {
      totalTimeTrackerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(totalTimeTrackerRef.current);
  }, [questions.length, quizEnded]);

  // Effect 3: Manage the individual question timer
  useEffect(() => {
    if (questions.length > 0 && !quizEnded && currentQuestionIndex < questions.length) {
      questionTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            skipQuestion();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(questionTimerRef.current);
  }, [questions.length, quizEnded, currentQuestionIndex]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      showScore();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    }
  };

  const handleSelectAnswer = (selectedOption) => {
    if (selectedAnswer) return; // Prevent changing answer

    clearInterval(questionTimerRef.current);
    const correctAnswer = questions[currentQuestionIndex].answer;
    setSelectedAnswer({ selected: selectedOption, correct: correctAnswer });

    if (selectedOption === correctAnswer) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    setTimeout(goToNextQuestion, 1500);
  };
  
  const skipQuestion = () => {
    goToNextQuestion();
  };

  const showScore = () => {
    clearInterval(questionTimerRef.current);
    clearInterval(totalTimeTrackerRef.current);
    setQuizEnded(true);
    
    if (category && quizNumber) {
      const quizKey = `${category}-Quiz-${quizNumber}`;
      localStorage.setItem(quizKey, 'true');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Shuffled options only re-calculate when the question changes
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);
  
  if (quizEnded) {
    return (
      <main className="container mx-auto px-6 py-28">
        <Helmet>
            <title>{`Quiz Results for ${category} - Quiz ${quizNumber} | CalciPrep`}</title>
        </Helmet>
        <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Quiz Complete!</h2>
          <div className="text-xl mt-6 space-y-2 font-sans">
            <p>Questions Attempted: <span className="font-bold">{correctCount + incorrectCount}</span></p>
            <p>Correct Answers: <span className="text-green-500 font-bold">{correctCount}</span></p>
            <p>Wrong Answers: <span className="text-red-500 font-bold">{incorrectCount}</span></p>
            <p>Total Time Taken: <span className="font-bold">{totalTime}s</span></p>
          </div>
          <div className="mt-8">
            <AdSenseBlock adSlot="6607911349" adLayout="in-article" adFormat="fluid" />
          </div>
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button onClick={() => window.location.reload()} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-purple-700">
              Play Again
            </button>
            <Link 
              to={`/quiz-list.html?category=${encodeURIComponent(category)}`} 
              className="bg-gray-200 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-300"
            >
              Choose Another Quiz
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="container mx-auto px-6 py-28">
        <Helmet>
            <title>{`Quiz Results for ${category} - Quiz ${quizNumber} | CalciPrep`}</title>
        </Helmet>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold text-center my-8">Loading Quiz...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-28">
      <Helmet>
            <title>{`Quiz Results for ${category} - Quiz ${quizNumber} | CalciPrep`}</title>
        </Helmet>
      <style>{`
        .option-btn.correct {
            background-color: #dcfce7; /* green-100 */
            border-color: #22c55e; /* green-500 */
            color: #166534; /* green-800 */
            font-weight: 600;
        }
        .option-btn.incorrect {
            background-color: #fee2e2; /* red-100 */
            border-color: #ef4444; /* red-500 */
            color: #991b1b; /* red-800 */
            font-weight: 600;
        }
      `}</style>
      <div className="max-w-3xl mx-auto">
        <div id="quiz-container" className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
          <div id="quiz-header" className="mb-6">
            <h1 id="quiz-title" className="text-3xl font-bold text-center">{`${category} - Quiz ${quizNumber}`}</h1>
            <div className="flex justify-between items-center mt-4 text-lg font-semibold">
              <div>Question <span id="question-count">{currentQuestionIndex + 1}</span>/{questions.length}</div>
              <div className="text-purple-600">Time: <span id="timer">{timeLeft}</span>s</div>
            </div>
          </div>
          
          <h2 id="question-text" className="text-2xl font-semibold text-center my-8 min-h-[6rem] flex items-center justify-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {currentQuestion.question}
          </h2>

          <div id="options-container" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shuffledOptions.map((option, index) => {
              let buttonClass = "option-btn p-4 font-semibold rounded-lg w-full text-lg border-2 border-gray-200 hover:border-purple-400 disabled:cursor-not-allowed";
              if (selectedAnswer) {
                if (option === selectedAnswer.correct) {
                  buttonClass += ' correct';
                } else if (option === selectedAnswer.selected) {
                  buttonClass += ' incorrect';
                }
              }
              return (
                <button 
                  key={index} 
                  onClick={() => handleSelectAnswer(option)}
                  className={buttonClass}
                  disabled={!!selectedAnswer}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-8">
            <button onClick={skipQuestion} className="font-semibold text-gray-600 hover:text-purple-600 px-4 py-2">Skip</button>
            <button onClick={showScore} className="bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800">Submit Test</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default QuizPage;

