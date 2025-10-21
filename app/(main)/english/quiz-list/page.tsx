import { getQuizData } from '@/services/dataService';
import QuizListPageClient from '@/components/features/english/QuizListPageClient';

export default async function QuizListPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category || 'Synonyms';
  const quizzes = await getQuizData(category);

 return <QuizListPageClient quizzes={quizzes} category={category} />;
}
