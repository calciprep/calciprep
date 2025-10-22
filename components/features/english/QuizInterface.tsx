"use client";

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './QuizInterface.css';
import type { QuizData, Question } from '@/lib/quizTypes';
import { Clock, Check, X, SkipForward, Send } from 'lucide-react';
import QuizReviewSection from './QuizReviewSection';

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

  useEffect(() => {
    if (showResult) {
      document.body.classList.add('quiz-results-open');
    }
    return () => {
      document.body.classList.remove('quiz-results-open');
    };
  }, [showResult]);

  // FIX: Wrap submitQuiz in useCallback to satisfy exhaustive-deps
  const submitQuiz = useCallback(() => {
    const correctAnswers = questions.filter(q => q.status === 'correct').length;
    const answeredQuestions = questions.filter(q => q.status === 'correct' || q.status === 'incorrect').length;
    
    const calculatedPassPercentage = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
    
    setPassPercentage(calculatedPassPercentage);
    setShowResult(true);
  }, [questions]); // Dependency array includes 'questions'

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
  }, [timeLimit, showResult, submitQuiz]); // FIX: Add submitQuiz to the dependency array

  const handleOptionSelect = (option: string) => {
    if (selectedOption) return; // Prevent multiple selections

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

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showResult) {
    const answeredCount = questions.filter(q => q.status === 'correct' || q.status === 'incorrect').length;

    return (
      // REMOVED: ReactLenis is now global, so it's removed from here.
      <div className="bg-gray-50">
          <header className="results-nav">
              <div className="results-nav-content">
                  <h2 className="text-lg font-bold text-gray-800">Results: <span className="text-indigo-600">{category}</span></h2>
                  <div className="flex items-center space-x-4">
                      <Link href="/" className="results-nav-link">Home</Link>
                      <Link href="/english" className="results-nav-link">English</Link>
                      <Link href={`/english/quiz-list?category=${encodeURIComponent(category)}`} className="results-nav-link">Back to Quizzes</Link>
                  </div>
              </div>
          </header>

          <main className="max-w-4xl mx-auto py-8">
              <div className="bg-white p-6 rounded-2xl shadow-md mb-8 mx-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                          <p className="text-sm font-medium text-gray-500">Accuracy</p>
                          <p className="text-3xl font-bold text-indigo-600">{passPercentage.toFixed(0)}%</p>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className={`text-3xl font-bold ${passPercentage >= 40 ? 'text-green-500' : 'text-red-500'}`}>
                              {passPercentage >= 40 ? 'Passed' : 'Failed'}
                          </p>
                      </div>
                      <div>
                          <p className="text-sm font-medium text-gray-500">Answered</p>
                          <p className="text-3xl font-bold text-gray-800">
                              {answeredCount}
                              <span className="text-lg text-gray-500">/{questions.length}</span>
                          </p>
                      </div>
                  </div>
              </div>

              <QuizReviewSection questions={questions} totalQuestions={questions.length} />
          </main>
      </div>
    );
  }

  return (
    <div className="quiz-container">
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
