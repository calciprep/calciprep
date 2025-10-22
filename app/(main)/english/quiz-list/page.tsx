import { getQuizData } from '@/services/dataService';
import QuizListPageClient from '@/components/features/english/QuizListPageClient';

// Define the expected props structure for a Next.js App Router page
interface QuizListPageProps {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Use the new interface for the component's props
export default async function QuizListPage({ searchParams }: QuizListPageProps) {
  // Handle the case where searchParams.category might be an array
  const categoryParam = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
    
  const category = categoryParam || 'Synonyms';
  const quizzes = await getQuizData(category);

  return <QuizListPageClient quizzes={quizzes} category={category} />;
}
