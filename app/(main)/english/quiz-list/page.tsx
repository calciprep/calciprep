import { getQuizData } from '@/services/dataService';
import QuizListPageClient from '@/components/features/english/QuizListPageClient';

// Define the expected props structure for a Next.js App Router page
// This page is a static route, so `params` will be an empty object.
// `searchParams` can contain any key.
interface QuizListPageProps {
  params: {}; // Static page, no dynamic params
  searchParams: { [key: string]: string | string[] | undefined };
}

// Use the new interface and destructure BOTH params and searchParams
export default async function QuizListPage({ params, searchParams }: QuizListPageProps) {
  // Handle the case where searchParams.category might be an array
  const categoryParam = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
    
  const category = categoryParam || 'Synonyms';
  const quizzes = await getQuizData(category);

  return <QuizListPageClient quizzes={quizzes} category={category} />;
}

