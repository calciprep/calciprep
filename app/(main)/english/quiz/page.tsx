import { Suspense } from 'react';
import { getQuizData } from '@/services/dataService';
import QuizInterface from '@/components/features/english/QuizInterface';

// THE FIX: Changed from '{}' to 'Record<string, never>' to satisfy the linter
type PageParams = Record<string, never>; // This route has no dynamic params
type SearchParams = { [key: string]: string | string[] | undefined };

async function QuizLoader({ category, quizId }: { category: string; quizId: string }) {
  const quizzes = await getQuizData(category);
  const quiz = quizzes?.find(q => q.id.toString() === quizId) || null;

  if (!quiz) {
    return <div className="text-center py-20">Quiz not found.</div>;
  }

  return <QuizInterface quizData={quiz} />;
}

// The function signature now correctly accepts Promises
export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  // We must await the promises inside the function to get their values
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Now we use the resolved values
  const category = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;
  const quizId = Array.isArray(resolvedSearchParams.quizId)
    ? resolvedSearchParams.quizId[0]
    : resolvedSearchParams.quizId;

  if (!category || !quizId) {
    return <div className="text-center py-20">Invalid quiz parameters.</div>;
  }

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Loading quiz...</p></div>}>
      {/* We can pass the resolved values to the client component */}
      <QuizLoader category={category} quizId={quizId} />
    </Suspense>
  );
}

