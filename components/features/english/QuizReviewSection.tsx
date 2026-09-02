"use client";

import React, { useState, useRef } from 'react';
import type { Question } from '@/lib/quizTypes';
import { Check, X, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizReviewSectionProps {
  questions: Question[];
  totalQuestions: number;
}

const QuizReviewSection: React.FC<QuizReviewSectionProps> = ({ questions, totalQuestions }) => {
  const questionCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(0); // Expand first question by default

  const getOptionClass = (option: string, question: Question) => {
    const isCorrectAnswer = option === question.answer;
    const isUserAnswer = option === question.user_answer;

    if (isCorrectAnswer) return 'review-option-correct';
    if (isUserAnswer && !isCorrectAnswer) return 'review-option-incorrect';
    return '';
  };

  const handleNavClick = (index: number) => {
    questionCardRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    setExpandedQuestionIndex(index);
  };

  const toggleOptions = (index: number) => {
    setExpandedQuestionIndex(prevIndex => (prevIndex === index ? null : index));
  };
    
  const correctCount = questions.filter(q => q.status === 'correct').length;
  const incorrectCount = questions.filter(q => q.status === 'incorrect').length;
  const skippedCount = questions.filter(q => q.status === 'skipped').length;

  return (
    <div className="w-full">
        {/* Question Navigator Grid */}
        <div className="mb-6 px-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 tracking-wider">Question Progress</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {questions.map((q, index) => (
                    <button
                        key={`nav-${index}`}
                        onClick={() => handleNavClick(index)}
                        className={`
                            h-10 w-10 rounded-lg font-bold text-sm flex items-center justify-center transition-all duration-200 ease-in-out
                            bg-gray-100 text-gray-700 hover:bg-gray-200
                            ${q.status === 'correct' ? '!bg-green-500 text-white' : ''}
                            ${q.status === 'incorrect' ? '!bg-red-500 text-white' : ''}
                            ${q.status === 'skipped' ? '!bg-gray-400 text-white' : ''}
                        `}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 mx-4">
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                <span className="flex items-center space-x-1 text-green-600 mr-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> 
                    <span>Correct {correctCount} - {((correctCount / totalQuestions) * 100).toFixed(0)}%</span>
                </span>
                <span className="flex items-center space-x-1 text-red-600 mr-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> 
                    <span>Incorrect {incorrectCount} - {((incorrectCount / totalQuestions) * 100).toFixed(0)}%</span>
                </span>
                <span className="flex items-center space-x-1 text-gray-600 mr-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div> 
                    <span>Skipped {skippedCount} - {((skippedCount / totalQuestions) * 100).toFixed(0)}%</span>
                </span>
            </div>
        </div>

        {/* Scrollable Question Review Container */}
        <div className="space-y-4 px-4">
            {questions.map((question, index) => (
                 <div 
                    key={`q-${index}`} 
                    id={`question-${index + 1}`}
                    ref={(el: HTMLDivElement | null) => { questionCardRefs.current[index] = el; }}
                    className="review-question-card-wrapper"
                >
                    <button 
                        onClick={() => toggleOptions(index)}
                        className="review-question-header"
                    >
                        <div className="flex items-center space-x-3">
                            {question.status === 'correct' && <Check className="text-green-500" size={20} />}
                            {question.status === 'incorrect' && <X className="text-red-500" size={20} />}
                            {question.status === 'skipped' && <HelpCircle className="text-gray-500" size={20} />}
                            <span className="font-semibold text-gray-800">Question {index + 1}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                ${question.status === 'correct' ? 'bg-green-100 text-green-800' : ''}
                                ${question.status === 'incorrect' ? 'bg-red-100 text-red-800' : ''}
                                ${question.status === 'skipped' ? 'bg-gray-100 text-gray-800' : ''}
                            `}>
                                {question.status === 'correct' && 'Correct'}
                                {question.status === 'incorrect' && 'Incorrect'}
                                {question.status === 'skipped' && 'Skipped'}
                            </span>
                        </div>
                        <ChevronDown className={`transform transition-transform duration-200 ${expandedQuestionIndex === index ? 'rotate-180' : 'rotate-0'}`} size={20} />
                    </button>
                    
                    <AnimatePresence>
                        {expandedQuestionIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="review-question-body">
                                    <p className="text-lg font-medium text-gray-900 mb-4">{question.question}</p>

                                    <div className="space-y-3">
                                        {question.options.map((option) => (
                                            <div key={option} className={`review-option-item ${getOptionClass(option, question)}`}>
                                                <span className="review-option-text">{option}</span>
                                                {option === question.user_answer && question.status === 'incorrect' && <X size={18} className="text-red-600 ml-auto" />}
                                                {option === question.answer && <Check size={18} className="text-green-600 ml-auto" />}
                                            </div>
                                        ))}
                                    </div>

                                    {question.status === 'skipped' && (
                                        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg text-sm">
                                            <p className="font-semibold">You skipped this question.</p>
                                            <p>The correct answer was: <span className="font-medium">{question.answer}</span></p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    </div>
  );
};

export default QuizReviewSection;
