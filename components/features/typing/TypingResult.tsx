"use client";

import React from 'react';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import ResultActionButtons from '@/components/common/ResultActionButtons';
import './TypingResult.css';
import { RefreshCw, Calculator } from 'lucide-react';

interface TypingResultProps {
  result: TypingResultType;
  onRestart: () => void;
}

const TypingResult: React.FC<TypingResultProps> = ({ result, onRestart }) => {
  if (!result) {
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

  const timeTaken = result.timeTakenInSeconds
    ? `${String(Math.floor(result.timeTakenInSeconds / 60)).padStart(2, '0')}:${String(Math.floor(result.timeTakenInSeconds % 60)).padStart(2, '0')}`
    : '00:00';

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    description, 
    iconColor, 
    isGradient = false,
    gradientClass = ''
  }: {
    icon: string;
    label: string;
    value: string | number;
    description?: string;
    iconColor?: string;
    isGradient?: boolean;
    gradientClass?: string;
  }) => (
    <div className={`stat-card ${isGradient ? gradientClass : ''}`}>
      <div className="stat-top-row">
        <div className={`stat-icon ${iconColor || 'blue'}`}>
          <img src={icon} alt={label} className="stat-icon-svg" />
        </div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value">{value}</div>
      {description && <div className="stat-description">{description}</div>}
    </div>
  );

  return (
    <div className="typing-result-wrapper">
      {/* Header */}
      <div className="result-header">
        <div className="result-title">
          {result.testName || 'Typing Test Result'}
        </div>
        <div className="result-subtitle">
          Total Keystrokes Typed: {result.keyStrokesByCandidate || 0}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="/media/result-icons/full-errors-result.svg"
          label="Full Errors"
          value={result.fullMistakes || 0}
          description="Additions, omissions, substitutions, spelling, repetitions, incomplete words"
          iconColor="red"
        />
        <StatCard
          icon="/media/result-icons/total-errors-result.svg"
          label="Total Errors"
          value={result.totalErrors ?? result.fullMistakes ?? 0}
          description={`Full Errors (In DP HCM all errors are counted as full error)`}
          iconColor="purple"
        />
        <StatCard
          icon="/media/result-icons/error-percentage-result.svg"
          label="Error Percentage"
          value={`${Math.round(result.errorPercentage || 0)}%`}
          description="Total Errors / Total Words Typed × 100"
          iconColor="orange"
        />
        <StatCard
          icon="/media/result-icons/keystrokes-result.svg"
          label="Keystrokes Typed"
          value={result.keyStrokesByCandidate || 0}
          description="Letters, numbers, punctuation, spaces"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/backspace-result.svg"
          label="Backspace Pressed"
          value={result.backspacePresses ?? 0}
          description="Number of backspace key presses"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/words-typed-result.svg"
          label="Words Typed"
          value={Math.round((result.keyStrokesByCandidate || 0) / 5)}
          description="Total Keystrokes Typed / 5"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/gross-wpm-result.svg"
          label="Gross WPM"
          value={`${result.wpm || 0} WPM`}
          description="(Keystrokes Typed / 5) / Time (min)"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/net-wpm-result.svg"
          label="Net WPM"
          value={`${result.netWpm || 0} WPM`}
          description="Keystrokes/5 / Time (min)- Total Errors"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/accuracy-result.svg"
          label="Accuracy"
          value={`${Math.round(result.accuracy || 0)}%`}
          description="(Net WPM / Gross WPM) × 100"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/duration-result.svg"
          label="Test Duration"
          value={timeTaken}
          description="Time taken for the test"
          iconColor="blue"
        />
        <StatCard
          icon="/media/result-icons/qualification-resul.svg"
          label="Qualification"
          value={result.qualified ? 'Qualified' : 'Not Qualified'}
          description={`Net WPM ≥ 30`}
          isGradient={true}
          gradientClass={result.qualified ? 'qualification' : ''}
        />
        <StatCard
          icon="/media/result-icons/marks-result.svg"
          label="Marks Obtained"
          value={result.marks ?? 0}
          description={`Based on Net WPM Score`}
          isGradient={true}
          gradientClass="marks"
        />
      </div>

      <div className="result-actions">
        <ResultActionButtons onRetake={onRestart} />
      </div>
    </div>
  );
};

export default TypingResult;
