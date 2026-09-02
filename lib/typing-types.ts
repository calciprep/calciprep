export interface TypingResult {
  wpm: number;
  accuracy: number;
  errorPercentage: number;
  netWpm?: number;
  totalWordsTyped: number;
  actualKeyDepressions: number;
  keyStrokesByCandidate: number;
  fullMistakes: number;
  halfMistakes: number;
  errorDetails: ErrorDetails;
}

export type TypingMode = 'learn-keys' | 'practice-words' | 'type-paragraphs' | 'take-tests';

export interface ErrorDetails {
  omission: number;
  substitution: number;
  addition: number;
  spelling: number;
  repetition: number;
  incomplete: number;
  capitalization: number;
  spacing: number;
}

