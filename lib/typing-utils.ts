import { TypingResult, ErrorDetails } from './typing-types';

/**
 * Calculates typing speed and accuracy based on the DP HCM formula.
 * @param originalText The correct text passage.
 * @param typedText The text typed by the user.
 * @param timeTakenInSeconds The time taken in seconds.
 * @param backspacePresses Number of backspace key presses (optional).
 * @param testName Name of the test (optional).
 * @returns A detailed TypingResult object.
 */
export const calculateTypingResult = (
  originalText: string,
  typedText: string,
  timeTakenInSeconds: number,
  backspacePresses: number = 0,
  testName?: string
): TypingResult => {
  const totalKeystrokes = typedText.length;
  const timeInMinutes = timeTakenInSeconds > 0 ? timeTakenInSeconds / 60 : 1;

  // Calculate errors only from typed text (not from missing characters)
  let fullErrors = 0;
  const compareLength = Math.min(originalText.length, typedText.length);
  
  for (let i = 0; i < compareLength; i++) {
    if (originalText[i] !== typedText[i]) {
      fullErrors++;
    }
  }

  const totalErrors = fullErrors;
  const totalWordsTyped = totalKeystrokes / 5;

  // --- CALCULATIONS BASED ON DP HCM FORMULA ---

  // Gross WPM: (Keystrokes Typed / 5) / Time (min)
  const grossWPM = Math.round((totalKeystrokes / 5) / timeInMinutes);

  // Error Percentage: (Total Errors / Total Words Typed) × 100
  const errorPercentage = totalWordsTyped > 0
    ? Math.round((totalErrors / totalWordsTyped) * 100)
    : 0;

  // Net WPM: (Keystrokes/5)/ Time (min)- Total Errors
  const netWPM = Math.round(((totalKeystrokes / 5) / timeInMinutes) - totalErrors);

  // Accuracy: (Net WPM / Gross WPM) × 100
  const accuracy = grossWPM > 0
    ? Math.round((netWPM / grossWPM) * 100)
    : 0;

  // Qualification: Net WPM ≥ 30 && Similarity ≥ 60%
  const similarity = compareLength > 0 
    ? Math.round((1 - (fullErrors / compareLength)) * 100)
    : 0;
  const qualified = netWPM >= 30 && similarity >= 60;

  // Calculate marks based on Net WPM marking scheme
  // 30 WPM: 10 Marks (Minimum qualifying speed)
  // 31-35 WPM: 12 Marks
  // 36-40 WPM: 15 Marks
  // 41-45 WPM: 18 Marks
  // 46-50 WPM: 21 Marks
  // Above 50 WPM: 25 Marks
  let marks = 0;
  if (qualified && netWPM >= 30) {
    if (netWPM === 30) {
      marks = 10;
    } else if (netWPM <= 35) {
      marks = 12;
    } else if (netWPM <= 40) {
      marks = 15;
    } else if (netWPM <= 45) {
      marks = 18;
    } else if (netWPM <= 50) {
      marks = 21;
    } else {
      marks = 25;
    }
  }

  const errorDetails: ErrorDetails = {
    spelling: fullErrors,
    capitalization: 0,
    omission: 0,
    addition: 0,
    substitution: 0,
    repetition: 0,
    incomplete: 0,
    spacing: 0,
  };

  return {
    wpm: Math.max(0, grossWPM),
    accuracy: Math.max(0, accuracy),
    errorPercentage: Math.max(0, errorPercentage),
    netWpm: Math.max(0, netWPM),
    totalWordsTyped: Math.round(totalWordsTyped),
    actualKeyDepressions: originalText.length,
    keyStrokesByCandidate: totalKeystrokes,
    fullMistakes: fullErrors,
    halfMistakes: 0,
    errorDetails,
    testName,
    backspacePresses,
    timeTakenInSeconds,
    totalErrors,
    marks,
    qualified,
  };
};

