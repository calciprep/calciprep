'use client';

import React, { useState } from 'react';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import ResultActionButtons from '@/components/common/ResultActionButtons';
import './TypingResult.css';
import {
  RefreshCw,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TypingResultProps {
  result: TypingResultType;
  onRestart: () => void;
  onTakeAnother?: () => void;
  // NEW: Flag to know if we are in the dashboard review modal
  isHistoryView?: boolean; 
}

const TypingResult: React.FC<TypingResultProps> = ({
  result,
  onRestart,
  onTakeAnother,
  isHistoryView = false,
}) => {
  // Toggle state for formulas
  const [showFormulas, setShowFormulas] = useState(false);

  if (!result) {
    return (
      <div className="typing-result-wrapper">
        <div className="result-header">
          <h1 className="result-title">Calculating results...</h1>

          <button className="restart-button" onClick={onRestart}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const timeTaken = result.timeTakenInSeconds
    ? `${String(
        Math.floor(result.timeTakenInSeconds / 60)
      ).padStart(2, '0')}:${String(
        Math.floor(result.timeTakenInSeconds % 60)
      ).padStart(2, '0')}`
    : '00:00';

  const StatCard = ({
    icon,
    label,
    value,
    description,
    iconColor,
    isGradient = false,
    gradientClass = '',
  }: {
    icon: string;
    label: string;
    value: string | number;
    description?: string;
    iconColor?: string;
    isGradient?: boolean;
    gradientClass?: string;
  }) => (
    <div
      className={`stat-card ${
        isGradient ? gradientClass : ''
      }`}
    >
      <div className={`stat-icon ${iconColor || 'blue'}`}>
        <img src={icon} alt="" className="stat-icon-svg" />
      </div>

      <div className="stat-label">{label}</div>

      <div className="stat-value">{value}</div>

      {description && (
        <div className="stat-description">
          {description}
        </div>
      )}
    </div>
  );

  const renderComparison = () => {
    if (!result.originalText || !result.typedText) return null;

    const originalWords = result.originalText
      .trim()
      .split(/\s+/);

    const typedWords = result.typedText
      .trim()
      .split(/\s+/);

    const elements = [];
    let oIdx = 0;
    let tIdx = 0;
    let keyCount = 0;

    while (tIdx < typedWords.length) {
      const orig = originalWords[oIdx] || '';
      const typed = typedWords[tIdx];

      if (!orig) {
        elements.push(
          <span key={keyCount++}>
            <span className="error-highlight addition">
              {typed}
            </span>{' '}
          </span>
        );

        tIdx++;
        continue;
      }

      if (orig === typed) {
        elements.push(
          <span key={keyCount++}>{typed} </span>
        );

        oIdx++;
        tIdx++;
        continue;
      }

      if (orig.toLowerCase() === typed.toLowerCase()) {
        elements.push(
          <span key={keyCount++}>
            <span className="error-highlight capitalization-error">
              {typed}
            </span>{' '}
          </span>
        );

        oIdx++;
        tIdx++;
        continue;
      }

      if (
        oIdx + 1 < originalWords.length &&
        typed.toLowerCase() ===
          (
            orig + originalWords[oIdx + 1]
          ).toLowerCase()
      ) {
        elements.push(
          <span key={keyCount++}>
            <span className="error-highlight spacing-error">
              {typed}
            </span>{' '}
          </span>
        );

        oIdx += 2;
        tIdx++;
        continue;
      }

      if (
        tIdx + 1 < typedWords.length &&
        (
          typed + typedWords[tIdx + 1]
        ).toLowerCase() === orig.toLowerCase()
      ) {
        elements.push(
          <span key={keyCount++}>
            <span className="error-highlight spacing-error">
              {typed + ' ' + typedWords[tIdx + 1]}
            </span>{' '}
          </span>
        );

        oIdx++;
        tIdx += 2;
        continue;
      }

      const stripPunc = (str: string) =>
        str.replace(
          /[.,\/#!$%\^&\*;:{}=\-_`~()]/g,
          ''
        );

      if (stripPunc(typed) === stripPunc(orig)) {
        elements.push(
          <span key={keyCount++}>
            <span className="error-highlight full-error">
              {typed}
            </span>{' '}
          </span>
        );

        oIdx++;
        tIdx++;
        continue;
      }

      let synced = false;

      for (let lookahead = 1; lookahead <= 3; lookahead++) {
        if (
          oIdx + lookahead < originalWords.length &&
          typed === originalWords[oIdx + lookahead]
        ) {
          oIdx += lookahead;

          elements.push(
            <span key={keyCount++}>{typed} </span>
          );

          oIdx++;
          tIdx++;
          synced = true;
          break;
        }

        if (
          tIdx + lookahead < typedWords.length &&
          typedWords[tIdx + lookahead] === orig
        ) {
          for (let k = 0; k < lookahead; k++) {
            elements.push(
              <span key={keyCount++}>
                <span className="error-highlight addition">
                  {typedWords[tIdx]}
                </span>{' '}
              </span>
            );

            tIdx++;
          }

          synced = true;
          break;
        }
      }

      if (!synced) {
        elements.push(
          <span key={keyCount++}>
            <span className="error-highlight full-error">
              {typed}
            </span>{' '}
          </span>
        );

        oIdx++;
        tIdx++;
      }
    }

    return (
      <div className="comparison-section">
        <div className="text-box-container">
          <h3 className="text-box-title">Original Text</h3>

          <div className="text-box-content original-content">
            {result.originalText}
          </div>
        </div>

        <div className="text-box-container">
          <h3 className="text-box-title">Your Typed Text</h3>

          <div className="text-box-content typed-content">
            {elements}
          </div>

          <div className="error-legend">
            <div className="legend-item legend-addition">
              Addition: Extra words in typed text
            </div>

            <div className="legend-item legend-full">
              Full Error: Substitutions, spelling, repetitions,
              incomplete words
            </div>

            <div className="legend-item legend-caps">
              Capitalization Error: Incorrect case
            </div>

            <div className="legend-item legend-spacing">
              Spacing Error: Missing or extra spaces
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="typing-result-wrapper">
      <div className="result-header">
        <h1 className="result-title">
          {result.testName || 'Typing Test Result'}
        </h1>

        <p className="result-subtitle">
          Total Keystrokes Typed:{' '}
          {result.keyStrokesByCandidate || 0}
        </p>
      </div>

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
          value={
            result.totalErrors ??
            result.fullMistakes ??
            0
          }
          description="Full Errors (In DP HCM all errors are counted as full error)"
          iconColor="purple"
        />

        <StatCard
          icon="/media/result-icons/error-percentage-result.svg"
          label="Error Percentage"
          value={`${Math.round(
            result.errorPercentage || 0
          )}%`}
          description="Total Errors / Total Words Typed × 100"
          iconColor="orange"
        />

        <StatCard
          icon="/media/result-icons/keystrokes-result.svg"
          label="Keystrokes Typed"
          value={
            result.keyStrokesByCandidate || 0
          }
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
          value={Math.round(
            (result.keyStrokesByCandidate || 0) / 5
          )}
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
          value={`${Math.round(
            result.accuracy || 0
          )}%`}
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
          value={
            result.qualified
              ? 'Qualified'
              : 'Not Qualified'
          }
          description="Net WPM ≥ 30"
          isGradient={true}
          gradientClass={
            result.qualified
              ? 'qualification'
              : ''
          }
        />

        <StatCard
          icon="/media/result-icons/marks-result.svg"
          label="Marks Obtained"
          value={result.marks ?? 0}
          description="Based on Net WPM Score"
          isGradient={true}
          gradientClass="marks"
        />
      </div>

      {renderComparison()}

      {/* Retractable Formulas Section */}
      <div className="formula-section">
        <button
          className="formula-toggle-btn"
          onClick={() =>
            setShowFormulas(!showFormulas)
          }
        >
          <div className="formula-title-left">
            <Calculator
              size={24}
              color="#3b82f6"
            />

            <span className="formula-title-text">
              Calculation Formulas Used
            </span>
          </div>

          {showFormulas ? (
            <ChevronUp
              size={24}
              color="#6b7280"
            />
          ) : (
            <ChevronDown
              size={24}
              color="#6b7280"
            />
          )}
        </button>

        {showFormulas && (
          <div className="formula-content">
            <div className="formula-item">
              <div className="formula-item-label">
                Words Typed
              </div>

              <div className="formula-item-description">
                Total Keystrokes / 5
              </div>
            </div>

            <div className="formula-item">
              <div className="formula-item-label">
                Gross WPM
              </div>

              <div className="formula-item-description">
                (Total Keystrokes / 5) / Time (min)
              </div>
            </div>

            <div className="formula-item">
              <div className="formula-item-label">
                Net WPM
              </div>

              <div className="formula-item-description">
                Gross WPM - (Total Errors / Time (min))
              </div>
            </div>

            <div className="formula-item">
              <div className="formula-item-label">
                Accuracy
              </div>

              <div className="formula-item-description">
                (Net WPM / Gross WPM) × 100
              </div>
            </div>

            <div className="formula-item">
              <div className="formula-item-label">
                Error Percentage
              </div>

              <div className="formula-item-description">
                (Total Errors / (Total Keystrokes / 5)) × 100
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Only render action buttons if we are NOT in the dashboard history view */}
      {!isHistoryView && (
        <div className="result-actions-container">
          <div className="buttons-row flex-row-align">
            <ResultActionButtons
              onRetake={onRestart}
            />

            {onTakeAnother && (
              <button
                onClick={onTakeAnother}
                className="take-another-button"
              >
                <FileText size={18} />
                <span>Take Another Test</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingResult;