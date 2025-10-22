import { getQuizData } from '@/services/dataService';
import QuizListPageClient from '@/components/features/english/QuizListPageClient';

// THE FIX: Changed from '{}' to 'Record<string, never>' to satisfy the linter
type PageParams = Record<string, never>; // This route has no dynamic params
type SearchParams = { [key: string]: string | string[] | undefined };

// The function signature now correctly accepts Promises
export default async function QuizListPage({
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
  const categoryParam = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;

  const category = categoryParam || 'Synonyms';
  const quizzes = await getQuizData(category);

  return <QuizListPageClient quizzes={quizzes} category={category} />;
}

