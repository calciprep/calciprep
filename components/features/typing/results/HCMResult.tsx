'use client';

import React, { useState } from 'react';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import ResultActionButtons from '@/components/common/ResultActionButtons';
import '../TypingResult.css';
import {
  RefreshCw,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResultProps {
  result: TypingResultType;
  onRestart: () => void;
  onTakeAnother?: () => void;
  isHistoryView?: boolean;
}

export default function HCMResult({
  result,
  onRestart,
  onTakeAnother,
  isHistoryView = false,
}: ResultProps) {
  const [showFormulas, setShowFormulas] = useState(false);

  if (!result) {
    return (
      <div className="typing-result-wrapper" style={{ paddingTop: '120px' }}>
        <div className="result-header">
          <h1 className="result-title">Calculating results...</h1>
          <button className="restart-button" onClick={onRestart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- DP HCM OFFICIAL WPM CALCULATION ---
  const timeInMin = (result.timeTakenInSeconds || 0) / 60;
  const exactGrossWPM = timeInMin > 0 ? (result.keyStrokesByCandidate || 0) / 5 / timeInMin : 0;
  const totalErrors = result.totalErrors ?? result.fullMistakes ?? 0;
  
  // Rule applied: Actual Speed = Tentative Speed - No. of mistakes[cite: 9]
  const exactNetWPM = Math.max(0, exactGrossWPM - totalErrors); 

  // --- DP HCM OFFICIAL MARKS CALCULATION ---
  let calculatedMarks = 0;
  if (exactNetWPM > 50) {
    calculatedMarks = 25; // Above 50[cite: 9]
  } else if (exactNetWPM > 45) {
    calculatedMarks = 21; // From 46 to 50[cite: 9]
  } else if (exactNetWPM > 40) {
    calculatedMarks = 18; // From 41 to 45[cite: 9]
  } else if (exactNetWPM > 35) {
    calculatedMarks = 15; // From 36 to 40[cite: 9]
  } else if (exactNetWPM > 30) {
    calculatedMarks = 12; // From 31 to 35[cite: 9]
  } else if (exactNetWPM >= 30) {
    calculatedMarks = 10; // Exactly 30[cite: 9]
  }

  const isQualified = exactNetWPM >= 30; // Minimum qualifying speed[cite: 9]

  const timeTaken = result.timeTakenInSeconds
    ? `${String(Math.floor(result.timeTakenInSeconds / 60)).padStart(2, '0')}:${String(Math.floor(result.timeTakenInSeconds % 60)).padStart(2, '0')}`
    : '00:00';

  const headerTitle = result.testName?.replace('Typing Test - ', '') || 'Delhi Police HCM';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StatCard = ({
    icon,
    label,
    value,
    description,
    iconColor,
    isGradient = false,
    gradientClass = '',
  }: any) => (
    <div className={`stat-card ${isGradient ? gradientClass : ''}`}>
      <div className={`stat-icon ${iconColor || 'blue'}`}>
        <img src={icon} alt="" className="stat-icon-svg" />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {description && (
        <div className="stat-description">{description}</div>
      )}
    </div>
  );

  const renderComparison = () => {
    if (!result.originalText || !result.typedText) return null;

    const originalWords = (result.originalText || '').trim().split(/\s+/);
    const typedWords = (result.typedText || '').trim().split(/\s+/);

    const elements = [];
    let oIdx = 0;
    let tIdx = 0;
    let keyCount = 0;

    while (tIdx < typedWords.length) {
      const orig = originalWords[oIdx] || '';
      const typed = typedWords[tIdx];

      if (!orig) {
        elements.push(<span key={keyCount++}><span className="error-highlight addition">{typed}</span>{' '}</span>);
        tIdx++; continue;
      }

      if (orig === typed) {
        elements.push(<span key={keyCount++}>{typed} </span>);
        oIdx++; tIdx++; continue;
      }

      if (orig.toLowerCase() === typed.toLowerCase()) {
        elements.push(<span key={keyCount++}><span className="error-highlight capitalization-error">{typed}</span>{' '}</span>);
        oIdx++; tIdx++; continue;
      }

      if (oIdx + 1 < originalWords.length && typed.toLowerCase() === (orig + originalWords[oIdx + 1]).toLowerCase()) {
        elements.push(<span key={keyCount++}><span className="error-highlight spacing-error">{typed}</span>{' '}</span>);
        oIdx += 2; tIdx++; continue;
      }

      if (tIdx + 1 < typedWords.length && (typed + typedWords[tIdx + 1]).toLowerCase() === orig.toLowerCase()) {
        elements.push(<span key={keyCount++}><span className="error-highlight spacing-error">{typed + ' ' + typedWords[tIdx + 1]}</span>{' '}</span>);
        oIdx++; tIdx += 2; continue;
      }

      const stripPunc = (str: string) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

      if (stripPunc(typed) === stripPunc(orig)) {
        elements.push(<span key={keyCount++}><span className="error-highlight full-error">{typed}</span>{' '}</span>);
        oIdx++; tIdx++; continue;
      }

      let synced = false;
      for (let lookahead = 1; lookahead <= 3; lookahead++) {
        if (oIdx + lookahead < originalWords.length && typed === originalWords[oIdx + lookahead]) {
          oIdx += lookahead;
          elements.push(<span key={keyCount++}>{typed} </span>);
          oIdx++; tIdx++; synced = true; break;
        }

        if (tIdx + lookahead < typedWords.length && typedWords[tIdx + lookahead] === orig) {
          for (let k = 0; k < lookahead; k++) {
            elements.push(<span key={keyCount++}><span className="error-highlight addition">{typedWords[tIdx]}</span>{' '}</span>);
            tIdx++;
          }
          synced = true; break;
        }
      }

      if (!synced) {
        elements.push(<span key={keyCount++}><span className="error-highlight full-error">{typed}</span>{' '}</span>);
        oIdx++; tIdx++;
      }
    }

    return (
      <div className="comparison-section">
        <div className="text-box-container">
          <h3 className="text-box-title">Original Text</h3>
          <div className="text-box-content original-content">{result.originalText}</div>
        </div>

        <div className="text-box-container">
          <h3 className="text-box-title">Your Typed Text</h3>
          <div className="text-box-content typed-content">{elements}</div>
          <div className="error-legend">
            <div className="legend-item legend-addition">Addition: Extra words</div>
            <div className="legend-item legend-full">Full Error: Substitutions, spelling, repetitions</div>
            <div className="legend-item legend-caps">Capitalization Error: Incorrect case</div>
            <div className="legend-item legend-spacing">Spacing Error: Missing or extra spaces</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="typing-result-wrapper" style={{ paddingTop: '120px' }}>
      <div className="result-header">
        <h1 className="result-title">{headerTitle}</h1>
        <p className="result-subtitle">Total Keystrokes Typed: {result.keyStrokesByCandidate || 0}</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="/media/result-icons/full-errors-result.svg" label="Full Errors" value={result.fullMistakes || 0} description="Additions, omissions, substitutions, spelling" iconColor="red" />
        <StatCard icon="/media/result-icons/total-errors-result.svg" label="Total Errors" value={totalErrors} description="Full Errors (In DP HCM all errors are counted as full error)" iconColor="purple" />
        <StatCard icon="/media/result-icons/error-percentage-result.svg" label="Error Percentage" value={`${(result.errorPercentage || 0).toFixed(2)}%`} description="Total Errors / Total Words Typed × 100" iconColor="orange" />
        <StatCard icon="/media/result-icons/keystrokes-result.svg" label="Keystrokes Typed" value={result.keyStrokesByCandidate || 0} description="Letters, numbers, punctuation, spaces" iconColor="blue" />
        <StatCard icon="/media/result-icons/backspace-result.svg" label="Backspace Pressed" value={result.backspacePresses ?? 0} description="Number of backspace key presses" iconColor="blue" />
        <StatCard icon="/media/result-icons/words-typed-result.svg" label="Words Typed" value={Math.round((result.keyStrokesByCandidate || 0) / 5)} description="Total Keystrokes Typed / 5" iconColor="blue" />
        
        {/* Exact 1-Decimal WPM values */}
        <StatCard icon="/media/result-icons/gross-wpm-result.svg" label="Gross WPM" value={`${exactGrossWPM.toFixed(1)} WPM`} description="(Keystrokes Typed / 5) / Time (min)" iconColor="blue" />
        <StatCard icon="/media/result-icons/net-wpm-result.svg" label="Net WPM" value={`${exactNetWPM.toFixed(1)} WPM`} description="Gross WPM - Total Errors" iconColor="blue" />
        
        <StatCard icon="/media/result-icons/accuracy-result.svg" label="Accuracy" value={`${Math.round(result.accuracy || 0)}%`} description="(Net WPM / Gross WPM) × 100" iconColor="blue" />
        <StatCard icon="/media/result-icons/duration-result.svg" label="Test Duration" value={timeTaken} description="Time taken for the test" iconColor="blue" />
        <StatCard icon="/media/result-icons/qualification-resul.svg" label="Qualification" value={isQualified ? 'Qualified' : 'Not Qualified'} description="Net WPM ≥ 30" isGradient={true} gradientClass={isQualified ? 'qualification' : ''} />
        <StatCard icon="/media/result-icons/marks-result.svg" label="Marks Obtained" value={calculatedMarks} description="Based strictly on Net WPM Score" isGradient={true} gradientClass="marks" />
      </div>

      {renderComparison()}

      <div className="formula-section">
        <button className="formula-toggle-btn" onClick={() => setShowFormulas(!showFormulas)}>
          <div className="formula-title-left">
            <Calculator size={24} color="#3b82f6" />
            <span className="formula-title-text">Calculation Formulas Used</span>
          </div>
          {showFormulas ? <ChevronUp size={24} color="#6b7280" /> : <ChevronDown size={24} color="#6b7280" />}
        </button>

        {showFormulas && (
          <div className="formula-content">
            <div className="formula-item"><div className="formula-item-label">Words Typed</div><div className="formula-item-description">Total Keystrokes / 5[cite: 9]</div></div>
            <div className="formula-item"><div className="formula-item-label">Gross WPM</div><div className="formula-item-description">(Total Keystrokes / 5) / Time (min)[cite: 9]</div></div>
            <div className="formula-item"><div className="formula-item-label">Net WPM</div><div className="formula-item-description">Gross WPM - Total Errors (1 Error = 1 WPM Drop)[cite: 9]</div></div>
            <div className="formula-item"><div className="formula-item-label">Accuracy</div><div className="formula-item-description">(Net WPM / Gross WPM) × 100</div></div>
            <div className="formula-item"><div className="formula-item-label">Error Percentage</div><div className="formula-item-description">(Total Errors / (Total Keystrokes / 5)) × 100</div></div>
            <div className="formula-item"><div className="formula-item-label">Delhi Police HCM Marks</div><div className="formula-item-description">{"30WPM = 10, >30WPM = 12, >35WPM = 15, >40WPM = 18, >45WPM = 21, >50WPM = 25"}[cite: 9]</div></div>
          </div>
        )}
      </div>

      {!isHistoryView && (
        <div className="result-actions-container">
          <div className="buttons-row flex-row-align">
            <ResultActionButtons onRetake={onRestart} />
            {onTakeAnother && (
              <button onClick={onTakeAnother} className="take-another-button">
                <FileText size={18} /><span>Take Another Test</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}