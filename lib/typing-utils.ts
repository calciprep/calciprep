import { TypingResult, ErrorDetails } from './typing-types';

/**
 * Calculates typing speed and accuracy based on SSC rules and common typing test conventions.
 * @param originalText The correct text passage.
 * @param typedText The text typed by the user.
 * @param timeTakenInSeconds The time taken in seconds.
 * @returns A detailed TypingResult object.
 */
export const calculateTypingResult = (originalText: string, typedText: string, timeTakenInSeconds: number): TypingResult => {
  const originalWords = originalText.trim().split(/\s+/);
  const typedWords = typedText.trim().split(/\s+/).filter(word => word.length > 0);
  
  const totalTypedChars = typedText.length;
  const timeInMinutes = timeTakenInSeconds > 0 ? timeTakenInSeconds / 60 : 1;

  let fullMistakes = 0;
  let halfMistakes = 0;

  // --- MISTAKE CALCULATION (only on attempted words) ---
  const wordsToCompare = Math.min(originalWords.length, typedWords.length);

  for (let i = 0; i < wordsToCompare; i++) {
    if (originalWords[i] !== typedWords[i]) {
      if (originalWords[i].toLowerCase() === typedWords[i].toLowerCase()) {
        halfMistakes++;
      } else {
        fullMistakes++;
      }
    }
  }
  
  const totalMistakes = fullMistakes + (halfMistakes / 2);

  // --- FINAL PARAMETER CALCULATIONS ---

  // 1. WPM (Words Per Minute) - The main WPM is Gross WPM, based on SSC rule (5 keystrokes = 1 word).
  const grossWPM = Math.round((totalTypedChars / 5) / timeInMinutes);

  // 2. Net WPM (penalized for errors)
  const errorsPerMinute = timeInMinutes > 0 ? totalMistakes / timeInMinutes : 0;
  const netWPM = Math.round(grossWPM - errorsPerMinute);
  
  // 3. Character-based Accuracy
  let characterAccuracy = 0;
  if (totalTypedChars > 0) {
      let correctTypedChars = 0;
      for (let i = 0; i < totalTypedChars; i++) {
          if (i < originalText.length && typedText[i] === originalText[i]) {
              correctTypedChars++;
          }
      }
      characterAccuracy = (correctTypedChars / totalTypedChars) * 100;
  }

  // 4. Error percentage is based on total mistakes vs total words in the original passage.
  const errorPercentage = originalWords.length > 0 ? (totalMistakes / originalWords.length) * 100 : 0;

  const errorDetails: ErrorDetails = {
    spelling: fullMistakes, // Simplified to represent all full word mistakes
    capitalization: halfMistakes,
    omission: originalWords.length > typedWords.length ? originalWords.length - typedWords.length : 0,
    addition: typedWords.length > originalWords.length ? typedWords.length - originalWords.length : 0,
    substitution: 0,
    repetition: 0,
    incomplete: 0,
    spacing: 0,
  };


  return {
    wpm: Math.max(0, grossWPM),
    accuracy: parseFloat(characterAccuracy.toFixed(2)),
    errorPercentage: parseFloat(errorPercentage.toFixed(2)),
    netWpm: Math.max(0, netWPM),
    totalWordsTyped: typedWords.length,
    actualKeyDepressions: originalText.length,
    keyStrokesByCandidate: totalTypedChars,
    fullMistakes: fullMistakes,
    halfMistakes: halfMistakes,
    errorDetails,
  };
};

