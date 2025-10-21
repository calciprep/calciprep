import React from 'react';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import './TypingResult.css';
import { RefreshCw } from 'lucide-react';

interface TypingResultProps {
  result: TypingResultType;
  onRestart: () => void;
}

const TypingResult: React.FC<TypingResultProps> = ({ result, onRestart }) => {
  // Guard clause to prevent rendering if result or errorDetails is not available
  if (!result || !result.errorDetails) {
    return (
      <div className="typing-result-wrapper">
        <p>Calculating results...</p>
        <button onClick={onRestart} className="restart-button">
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="typing-result-wrapper">
      <h2 className="result-title">Typing Test Analysis</h2>

      <div className="stats-grid">
        <div className="stat-item main-stat">
          <span className="stat-label">Gross WPM</span>
          <span className="stat-value wpm">{result.wpm}</span>
        </div>
        <div className="stat-item main-stat">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value accuracy">{result.accuracy}%</span>
        </div>
         <div className="stat-item main-stat">
          <span className="stat-label">Net WPM</span>
          <span className="stat-value">{result.netWpm}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Words Typed</span>
          <span className="stat-value">{result.totalWordsTyped}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Key Depressions</span>
          <span className="stat-value">{result.keyStrokesByCandidate}</span>
        </div>
        <div className="stat-item error-stat">
            <span className="stat-label">Error %</span>
            <span className="stat-value error">{result.errorPercentage}%</span>
            <span className="stat-cutoff">Cutoff: Error % should be less than 7%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Full Mistakes</span>
          <span className="stat-value">{result.fullMistakes}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Half Mistakes</span>
          <span className="stat-value">{result.halfMistakes}</span>
        </div>
      </div>

      <div className="mistake-details">
        <h3 className="detail-title">Full Mistakes Breakdown</h3>
        <div className="detail-grid">
          <div className="stat-item">
            <span className="stat-label">Omission</span>
            <span className="stat-value">{result.errorDetails.omission}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Spelling/Substitution</span>
            <span className="stat-value">{result.errorDetails.spelling}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Addition of Words</span>
            <span className="stat-value">{result.errorDetails.addition}</span>
          </div>
        </div>
      </div>

       <div className="mistake-details">
        <h3 className="detail-title">Half Mistakes Breakdown</h3>
        <div className="detail-grid half">
            <div className="stat-item">
                <span className="stat-label">Wrong Capitalizations</span>
                <span className="stat-value">{result.errorDetails.capitalization}</span>
            </div>
        </div>
      </div>

      <div className="result-actions">
        <button onClick={onRestart} className="restart-button">
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};

export default TypingResult;
