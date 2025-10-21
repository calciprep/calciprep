export interface Question {
  question: string;
  options: string[];
  answer: string;
  user_answer?: string | null;
  status?: 'correct' | 'incorrect' | 'skipped';
}

export interface QuizData {
  id: string;
  title: string;
  questions: Question[];
}

// Add these new types for the maths challenge
export interface MathsQuestion {
  question: string;
  answer: number;
  userAnswer?: number | null;
  isCorrect?: boolean;
}

export type ChallengeMode = '1-minute' | 'bitter-end' | 'speed-challenge';

export interface ChallengeSettings {
    mode: ChallengeMode;
    types: string[];
    difficulty: string;
}

