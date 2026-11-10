"use client";

import React from 'react';
import Link from 'next/link';
import { BookCopy, ArrowRight } from 'lucide-react';
import type { QuizData } from '@/lib/quizTypes';

interface QuizListPageClientProps {
  quizzes: QuizData[] | null;
  category: string;
}

const QuizListPageClient: React.FC<QuizListPageClientProps> = ({ quizzes, category }) => {

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-20 min-h-screen pt-32 bg-slate-50 dark:bg-black transition-colors duration-200">
        <h1 className="text-4xl font-extrabold mb-4 text-slate-900 dark:text-white font-serif">{category}</h1>
        <p className="text-xl text-slate-600 dark:text-zinc-400">No quizzes available for this category at the moment.</p>
        <Link href="/english" className="mt-8 inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-28 min-h-screen transition-colors duration-200">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-serif uppercase tracking-tight">{category} Quizzes</h1>
        <p className="text-lg text-slate-600 dark:text-zinc-400 mt-2 font-medium">Select a quiz to test your knowledge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {quizzes.map((quiz, index) => (
          <Link
            key={quiz.id || index}
            href={`/english/quiz?category=${encodeURIComponent(category)}&quizId=${quiz.id}`}
            className="group block bg-white dark:bg-zinc-950 p-8 rounded-2xl border-[3px] border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(38,38,38,1)] hover:-translate-y-2 transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center justify-between">
                <div className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-2 border-black dark:border-zinc-800 rounded-full p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <BookCopy size={28} strokeWidth={2.5} />
                </div>
                <div className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <ArrowRight size={24} strokeWidth={2.5} />
                </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-black font-serif text-slate-900 dark:text-white tracking-wide">{quiz.title}</h2>
              <p className="text-slate-600 dark:text-zinc-400 mt-2 font-semibold font-sans">{quiz.questions?.length || 0} questions</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default QuizListPageClient;
