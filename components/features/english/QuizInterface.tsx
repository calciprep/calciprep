"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import './QuizInterface.css';
import type { QuizData, Question } from '@/lib/quizTypes';
import { UserService } from '@/services/userService';
import { Clock, Check, X, SkipForward, Send } from 'lucide-react';

import EnglishResult from './EnglishResult';

interface QuizInterfaceProps {
  quizData: QuizData;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizData }) => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'Unknown';
  const timeLimit = parseInt(searchParams.get('time') || '0', 10);

  const [questions, setQuestions] = useState<Question[]>(
    quizData.questions.map(q => ({...q, status: undefined, user_answer: null }))
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [showResult, setShowResult] = useState(false);
  const [passPercentage, setPassPercentage] = useState(0);
  const historySavedRef = useRef(false);

  useEffect(() => {
    if (showResult) {
      document.body.classList.add('quiz-results-open');
    }
    return () => {
      document.body.classList.remove('quiz-results-open');
    };
  }, [showResult]);

  const submitQuiz = useCallback(() => {
    const correctAnswers = questions.filter(q => q.status === 'correct').length;
    const incorrectAnswers = questions.filter(q => q.status === 'incorrect').length;
    const skippedAnswers = questions.filter(q => q.status === 'skipped').length;
    const answeredQuestions = correctAnswers + incorrectAnswers;
    
    const calculatedPassPercentage = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
    
    setPassPercentage(calculatedPassPercentage);
    setShowResult(true);

    if (!historySavedRef.current) {
      historySavedRef.current = true;
      const uid = UserService.getCurrentUid();
      
      if (uid) {
        const questionsToSave = JSON.parse(JSON.stringify(questions));

        UserService.addHistory(uid, 'english_history', {
          category,
          name: quizData.title,
          score: Number(calculatedPassPercentage.toFixed(1)),
          accuracy: Number(calculatedPassPercentage.toFixed(1)),
          totalQuestions: questions.length,
          correctAnswers: correctAnswers,
          incorrectAnswers: incorrectAnswers,
          skippedAnswers: skippedAnswers,
          questionsState: questionsToSave,
        }).catch((error) => {
          console.error('Failed to save English history:', error);
        });
      }
    }
  }, [questions, category, quizData.title]);

  useEffect(() => {
    if (timeLimit > 0 && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLimit, showResult, submitQuiz]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    const updatedQuestions = [...questions];
    const currentQ = updatedQuestions[currentQuestionIndex];
    currentQ.user_answer = option;
    currentQ.status = option === currentQ.answer ? 'correct' : 'incorrect';
    setQuestions(updatedQuestions);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      } else {
        submitQuiz();
      }
    }, 800);
  };

  const handleSkip = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].status = 'skipped';
    setQuestions(updatedQuestions);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      submitQuiz();
    }
  };

  const handleRetake = () => {
    historySavedRef.current = false;
    setQuestions(quizData.questions.map(q => ({ ...q, status: undefined, user_answer: null })));
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimeLeft(timeLimit * 60);
    setShowResult(false);
    setPassPercentage(0);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showResult) {
    const answeredCount = questions.filter(q => q.status === 'correct' || q.status === 'incorrect').length;
    
    return (
      <EnglishResult 
        category={category}
        quizName={quizData.title} // <-- NEW PROP ADDED HERE
        passPercentage={passPercentage}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        questionsState={questions}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="quiz-container pt-20"> {/* Safety padding for live quiz view */}
      <div className="quiz-card">
        <div className="quiz-header">
          <div className="quiz-title-section">
            <h1 className="quiz-title">{quizData.title}</h1>
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-bar-inner"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="quiz-progress-text">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          {timeLimit > 0 && (
            <div className="quiz-timer">
              <Clock className="quiz-timer-icon" />
              <span>
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <div className="quiz-body">
          <h2 className="quiz-question">{currentQuestion.question}</h2>
          <div className="quiz-options">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrectAnswer = option === currentQuestion.answer;
              const isCorrectSelection = isSelected && isCorrectAnswer;
              const isIncorrectSelection = isSelected && !isCorrectAnswer;

              return (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`quiz-option ${
                    isSelected ? 'selected' : ''
                  } ${
                    isCorrectSelection ? 'correct-glow' : ''
                  } ${
                    isIncorrectSelection ? 'incorrect-glow' : ''
                  }`}
                  disabled={!!selectedOption}
                >
                  {option}
                  {isSelected &&
                    (isCorrectAnswer ? (
                      <Check className="feedback-icon correct" />
                    ) : (
                      <X className="feedback-icon incorrect" />
                    ))}
                </button>
              );
            })}
          </div>
        </div>

        <div className="quiz-footer">
          <button onClick={handleSkip} className="quiz-action-btn skip-btn">
            <SkipForward size={18} /> Skip
          </button>
          <button onClick={submitQuiz} className="quiz-action-btn submit-btn">
            <Send size={18} /> Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;