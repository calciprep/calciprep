import { Suspense } from 'react';
import { getQuizData } from '@/services/dataService';
import QuizInterface from '@/components/features/english/QuizInterface';
import type { Question, QuizData, } from '@/lib/quizTypes';

interface QuizPageProps {
  searchParams: {
    category?: string;
    quizId?: string;
  };
}
    

// This is now a Server Component that fetches data
async function QuizLoader({ category, quizId }: { category: string; quizId: string }) {
  const quizzes = await getQuizData(category);
  const quiz = quizzes?.find(q => q.id.toString() === quizId) || null;

  if (!quiz) {
    return <div className="text-center py-20">Quiz not found.</div>;
  }

  return <QuizInterface quizData={quiz} />;
}

export default function QuizPage({ searchParams }: QuizPageProps) {
  const { category, quizId } = searchParams;

  if (!category || !quizId) {
    return <div className="text-center py-20">Invalid quiz parameters.</div>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Loading quiz...</p></div>}>
      <QuizLoader category={category} quizId={quizId} />
    </Suspense>
  );
}

