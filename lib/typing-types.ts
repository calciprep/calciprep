export type TypingMode = 'learn' | 'practice' | 'test';

export interface TypingResult {
  testName?: string;
  keyStrokesByCandidate?: number;
  fullMistakes?: number;
  totalErrors?: number;
  errorPercentage?: number;
  backspacePresses?: number;
  wpm?: number;
  netWpm?: number;
  accuracy?: number;
  timeTakenInSeconds?: number;
  qualified?: boolean;
  marks?: number;
  
  // NEW ADDITIONS for Text Comparison
  originalText?: string;
  typedText?: string;
}