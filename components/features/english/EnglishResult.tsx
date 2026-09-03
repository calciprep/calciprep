'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuizReviewSection from './QuizReviewSection';
import ResultActionButtons from '@/components/common/ResultActionButtons';
import type { Question } from '@/lib/quizTypes';

interface EnglishResultProps {
  category: string;
  quizName?: string; // Accepts the specific quiz name (e.g., "One Word Substitution Quiz 1")
  passPercentage: number;
  totalQuestions: number;
  answeredCount: number;
  questionsState: Question[];
  onRetake: () => void;
  isHistoryView?: boolean;
}

const EnglishResult: React.FC<EnglishResultProps> = ({
  category,
  quizName,
  passPercentage,
  totalQuestions,
  answeredCount,
  questionsState,
  onRetake,
  isHistoryView = false,
}) => {
  // Calculate points (1 point per correct answer)
  const correctCount = questionsState 
    ? questionsState.filter(q => q.status === 'correct').length 
    : 0;

  return (
    // Top padding ensures it clears your global "CalciPrep" navbar
    <div className={`bg-gray-50 min-h-full flex flex-col ${!isHistoryView ? 'pt-24 pb-12' : ''}`}>
      
      <main className="max-w-4xl mx-auto w-full flex-1">
        
        {/* Modern Full-Width Hero Banner (Only visible on live result page) */}
        {!isHistoryView && (
          <div className="mb-8 mx-4">
            {/* Subtle Top Navigation */}
            <div className="flex items-center mb-6">
              <Link 
                href={`/english/quiz-list?category=${encodeURIComponent(category)}`} 
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
              >
                <ArrowLeft size={16} strokeWidth={2.5} /> 
                Back to {category}
              </Link>
            </div>

            {/* Dark Premium Header Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
              {/* Decorative background glows */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>
              
              <div className="relative z-10">
                <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-500/30">
                  {category}
                </span>
                
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                  {/* Safely defaults to "[Category] Quiz" if quizName is empty */}
                  {quizName && quizName.trim() !== '' ? quizName : `${category} Quiz`}
                </h1>
                
                <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                  You've successfully completed this test! Review your detailed accuracy, points earned, and full question breakdown below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 mx-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="pt-4 md:pt-0">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Accuracy</p>
              <div className="flex items-center justify-center gap-2 text-4xl font-extrabold text-emerald-500">
                <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                {passPercentage.toFixed(0)}%
              </div>
            </div>
            
            <div className="pt-4 md:pt-0">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Points</p>
              <div className="flex items-center justify-center gap-2 text-4xl font-extrabold text-gray-900">
                <img src="/media/award-point.svg" alt="Points" className="w-8 h-8" />
                {correctCount}
              </div>
            </div>
            
            <div className="pt-4 md:pt-0">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Answered</p>
              <p className="text-4xl font-extrabold text-gray-900">
                {answeredCount}<span className="text-2xl text-gray-300 font-bold">/{totalQuestions}</span>
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          {!isHistoryView && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <ResultActionButtons 
                onRetake={onRetake} 
                dashboardPath="/dashboard?tab=english" 
              />
            </div>
          )}
        </div>

        {/* Detailed Question Review */}
        {questionsState && questionsState.length > 0 ? (
          <QuizReviewSection questions={questionsState} totalQuestions={totalQuestions} />
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl mx-4 shadow-sm border border-gray-100 text-gray-500 font-medium">
            Detailed question breakdown is not available for this older test. New tests will display fully here!
          </div>
        )}
      </main>
    </div>
  );
};

export default EnglishResult;