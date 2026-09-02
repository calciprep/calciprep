export const calculateTypingResult = (
  correctChars: number,
  incorrectChars: number,
  timeInSeconds: number,
  totalKeystrokes: number = 0
) => {
  const timeInMinutes = timeInSeconds / 60;
  const totalCharsTyped = correctChars + incorrectChars;
  
  // Gross WPM: (Total characters / 5) / time in minutes
  const grossWpm = timeInMinutes > 0 
    ? Math.round((totalCharsTyped / 5) / timeInMinutes) 
    : 0;
    
  // Net WPM: Gross WPM - (errors / time in minutes)
  const netWpm = timeInMinutes > 0 
    ? Math.max(0, Math.round(grossWpm - (incorrectChars / timeInMinutes))) 
    : 0;
    
  // Accuracy percentage
  const accuracy = totalCharsTyped > 0 
    ? Math.round((correctChars / totalCharsTyped) * 100) 
    : 0;

  return {
    wpm: grossWpm,
    netWpm: netWpm,
    accuracy: accuracy,
    totalErrors: incorrectChars,
    errors: incorrectChars, 
    correctChars,
    incorrectChars,
    timeElapsed: timeInSeconds,
    totalKeystrokes: totalKeystrokes || totalCharsTyped
  };
};