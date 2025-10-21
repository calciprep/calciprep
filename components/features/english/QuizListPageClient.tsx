"use client";

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookCopy, ArrowRight } from 'lucide-react';
import type { QuizData } from '@/lib/quizTypes';

interface QuizListPageClientProps {
  quizzes: QuizData[] | null;
  category: string;
}

const QuizListPageClient: React.FC<QuizListPageClientProps> = ({ quizzes, category }) => {

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">{category}</h1>
        <p className="text-xl text-gray-600">No quizzes available for this category at the moment.</p>
        <Link href="/english" className="mt-8 inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
            Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-28">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800">{category} Quizzes</h1>
        <p className="text-lg text-gray-500 mt-2">Select a quiz to test your knowledge.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {quizzes.map((quiz, index) => (
          <Link
            key={quiz.id || index}
            href={`/english/quiz?category=${encodeURIComponent(category)}&quizId=${quiz.id}`}
            className="group block bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300 ease-in-out transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-between">
                <div className="bg-indigo-100 text-indigo-600 rounded-full p-4">
                    <BookCopy size={28} />
                </div>
                <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight size={24} />
                </div>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
              {/* Added optional chaining to prevent crash if questions array is missing */}
              <p className="text-gray-500 mt-2 font-sans">{quiz.questions?.length || 0} questions</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default QuizListPageClient;

