import { Suspense } from 'react';
import { getQuizData } from '@/services/dataService';
import QuizInterface from '@/components/features/english/QuizInterface';

// Define the expected props structure for a Next.js App Router page
interface QuizPageProps {
  params: {}; // Static page, no dynamic params
  searchParams: {
    // Explicitly define known params, but also allow any others
    category?: string | string[] | undefined;
    quizId?: string | string[] | undefined;
    [key: string]: string | string[] | undefined;
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

// Use the new interface and destructure BOTH params and searchParams
export default function QuizPage({ params, searchParams }: QuizPageProps) {
  // Handle array case for searchParams
  const category = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category;
  const quizId = Array.isArray(searchParams.quizId) ? searchParams.quizId[0] : searchParams.quizId;

  if (!category || !quizId) {
    return <div className="text-center py-20">Invalid quiz parameters.</div>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Loading quiz...</p></div>}>
      <QuizLoader category={category} quizId={quizId} />
    </Suspense>
  );
}
