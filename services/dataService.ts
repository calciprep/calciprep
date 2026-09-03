import fs from 'fs/promises';
import path from 'path';
import type { QuizData, Question } from '@/lib/quizTypes';

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function getDataPath(fileName: string) {
  return path.join(process.cwd(), 'data', fileName);
}

export const getQuizData = async (category: string): Promise<QuizData[] | null> => {
  const fileName = category.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.json';
  try {
    const filePath = getDataPath(fileName);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const quizzesData: Question[][] = JSON.parse(fileContent);

    // Map raw data to Quiz objects and shuffle options for each question
    const quizzes: QuizData[] = quizzesData.map((questions, index) => {
      const shuffledQuestions = questions.map(question => ({
        ...question,
        options: shuffleArray(question.options),
      }));

      return {
        id: `${category}-quiz-${index + 1}`,
        title: `${category} - Quiz ${index + 1}`,
        questions: shuffledQuestions,
      };
    });

    return quizzes;
  } catch (error) {
    console.error(`Could not fetch quiz data for "${category}":`, error);
    return null;
  }
};

