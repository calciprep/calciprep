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

/**
 * Fetches the paragraphs for the main typing test from the local filesystem.
 * This is a server-side function.
 * @returns {Promise<Array<any> | null>}
 */
export const getTypingParagraphs = async () => {
  try {
    const filePath = getDataPath('typing-paragraphs.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.typing_tests;
  } catch (error) {
    console.error("Could not fetch typing paragraphs:", error);
    return null;
  }
};

/**
 * Fetches the exercises for the "Learn Keys" section from the local filesystem.
 * This is a server-side function.
 * @returns {Promise<Object | null>}
 */
export const getLearnKeysExercises = async () => {
    try {
        const filePath = getDataPath('learn-keys-exercises.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return data.categories;
    } catch (error) {
        console.error("Could not fetch learn keys exercises:", error);
        return null;
    }
};

/**
 * Fetches the words for the "Practice Words" section from the local filesystem.
 * This is a server-side function.
 * @returns {Promise<Object | null>}
 */
export const getPracticeWords = async () => {
    try {
        const filePath = getDataPath('practice-words.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return data.categories;
    } catch (error) {
        console.error("Could not fetch practice words:", error);
        return null;
    }
};

/**
 * Fetches the paragraphs for the "Type Paragraphs" section in Learn Typing.
 * This is a server-side function.
 * @returns {Promise<Array<any> | null>}
 */
export const getTypeParagraphs = async () => {
    try {
        const filePath = getDataPath('type-paragraphs.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Could not fetch type paragraphs:", error);
        return null;
    }
};

