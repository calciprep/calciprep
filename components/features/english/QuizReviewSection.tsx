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
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(0);

  // Replaced external CSS classes with guaranteed Tailwind classes for backgrounds and borders
  const getOptionClass = (option: string, question: Question) => {
    const isCorrectAnswer = option === question.answer;
    const isUserAnswer = option === question.user_answer;

    if (isCorrectAnswer) return 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold';
    if (isUserAnswer && !isCorrectAnswer) return 'bg-red-50 border-red-200 text-red-800 font-semibold';
    return 'bg-white border-gray-200 text-gray-700'; // Default style for unselected options
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
        {/* Breakdown */}
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 mx-4 border border-gray-100">
            <div className="flex flex-wrap items-center justify-between text-sm font-medium text-gray-600">
                <span className="flex items-center space-x-2 text-emerald-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> 
                    <span>Correct: {correctCount} ({((correctCount / totalQuestions) * 100).toFixed(0)}%)</span>
                </span>
                <span className="flex items-center space-x-2 text-red-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> 
                    <span>Incorrect: {incorrectCount} ({((incorrectCount / totalQuestions) * 100).toFixed(0)}%)</span>
                </span>
                <span className="flex items-center space-x-2 text-gray-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div> 
                    <span>Skipped: {skippedCount} ({((skippedCount / totalQuestions) * 100).toFixed(0)}%)</span>
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
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <button 
                        onClick={() => toggleOptions(index)}
                        className="w-full flex flex-col sm:flex-row sm:items-center px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                            {/* SVG Icon logic based on whether the question is correct or not */}
                            {question.status === 'correct' ? (
                                <img src="/media/right-question.svg" alt="Right Question" className="w-6 h-6" />
                            ) : (
                                <img src="/media/wrong-question.svg" alt="Wrong Question" className="w-6 h-6" />
                            )}
                            
                            <span className="font-bold text-gray-900">Question {index + 1}</span>
                            
                            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold 
                                ${question.status === 'correct' ? 'text-emerald-600 bg-emerald-50' : ''}
                                ${question.status === 'incorrect' ? 'text-red-600 bg-red-50' : ''}
                                ${question.status === 'skipped' ? 'text-gray-600 bg-gray-100' : ''}
                            `}>
                                {question.status === 'correct' && <><Check size={14} strokeWidth={3}/> Correct</>}
                                {question.status === 'incorrect' && <><X size={14} strokeWidth={3}/> Incorrect</>}
                                {question.status === 'skipped' && <><HelpCircle size={14} strokeWidth={3}/> Skipped</>}
                            </span>
                        </div>

                        {/* Right-aligned container for Points and Dropdown arrow */}
                        <div className="flex items-center space-x-4 sm:ml-auto">
                            {/* Render the points badge ONLY if the question is correct */}
                            {question.status === 'correct' && (
                                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 text-sm font-bold text-yellow-700">
                                    <img src="/media/award-point.svg" alt="Point" className="w-4 h-4" />
                                    <span>1 point</span>
                                </div>
                            )}
                            <ChevronDown className={`transform transition-transform duration-200 text-gray-400 ${expandedQuestionIndex === index ? 'rotate-180' : 'rotate-0'}`} size={20} />
                        </div>
                    </button>
                    
                    <AnimatePresence>
                        {expandedQuestionIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden border-t border-gray-100"
                            >
                                <div className="px-5 py-5 bg-white">
                                    <p className="text-lg font-semibold text-gray-900 mb-5 leading-relaxed">{question.question}</p>

                                    {/* Tailwind classes applied directly here for absolute styling certainty */}
                                    <div className="flex flex-col gap-3">
                                        {question.options.map((option) => (
                                            <div 
                                                key={option} 
                                                className={`flex items-center px-4 py-3 rounded-lg border ${getOptionClass(option, question)}`}
                                            >
                                                <span>{option}</span>
                                                {option === question.user_answer && question.status === 'incorrect' && <X size={20} strokeWidth={3} className="text-red-500 ml-auto" />}
                                                {option === question.answer && <Check size={20} strokeWidth={3} className="text-emerald-500 ml-auto" />}
                                            </div>
                                        ))}
                                    </div>

                                    {question.status === 'skipped' && (
                                        <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                            <p className="font-semibold text-gray-800 mb-1">You skipped this question.</p>
                                            <p>The correct answer was: <span className="font-bold text-emerald-600">{question.answer}</span></p>
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