'use client';

import React, { useState, useMemo } from 'react';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import ResultActionButtons from '@/components/common/ResultActionButtons';
import '../TypingResult.css';
import { Calculator, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultProps {
  result: TypingResultType;
  onRestart: () => void;
  onTakeAnother?: () => void;
  isHistoryView?: boolean;
}

export default function CGLResult({
  result,
  onRestart,
  onTakeAnother,
  isHistoryView = false,
}: ResultProps) {
  const [showFormulas, setShowFormulas] = useState(false);

  // SSC ENGINE
  const sscStats = useMemo(() => {
    const origWords = (result?.originalText || '').trim().split(/\s+/);
    const typedWords = (result?.typedText || '').trim().split(/\s+/);

    let full = 0; let half = 0; let i = 0; let j = 0;

    while (i < origWords.length || j < typedWords.length) {
      const wO = origWords[i] || "";
      const wT = typedWords[j] || "";

      if (wO === wT) { i++; j++; continue; }

      if (i + 1 < origWords.length && j + 1 < typedWords.length && origWords[i] === typedWords[j+1] && origWords[i+1] === typedWords[j]) { half++; i += 2; j += 2; continue; }

      const cleanWO = wO.replace(/[^\w\s]/g, '').toLowerCase();
      const cleanWT = wT.replace(/[^\w\s]/g, '').toLowerCase();
      if (cleanWO === cleanWT && wO !== "" && wT !== "") { half++; i++; j++; continue; }

      if (i + 1 < origWords.length && wT === origWords[i] + origWords[i+1]) { half++; i += 2; j++; continue; }
      if (j + 1 < typedWords.length && wO === typedWords[j] + typedWords[j+1]) { half++; i++; j += 2; continue; }

      full++;
      if (wO !== "" && typedWords.slice(j, j + 3).includes(wO)) { j++; } else if (wT !== "" && origWords.slice(i, i + 3).includes(wT)) { i++; } else { i++; j++; }
    }

    const totalPenalty = full + (half / 2);
    const errorPercentage = origWords.length > 0 ? (totalPenalty / origWords.length) * 100 : 0;
    const isQualified = errorPercentage <= 5.00;

    return { full, half, totalPenalty, errorPercentage, isQualified };
  }, [result?.originalText, result?.typedText]);

  if (!result) return null;

  // Exact 1-decimal calculation for SSC WPM
  const timeInMin = (result.timeTakenInSeconds || 0) / 60;
  const exactGrossWPM = timeInMin > 0 ? (result.keyStrokesByCandidate || 0) / 5 / timeInMin : 0;
  const exactNetWPM = timeInMin > 0 ? Math.max(0, exactGrossWPM - (sscStats.totalPenalty / timeInMin)) : 0;

  const timeTaken = result.timeTakenInSeconds
    ? `${String(Math.floor(result.timeTakenInSeconds / 60)).padStart(2, '0')}:${String(Math.floor(result.timeTakenInSeconds % 60)).padStart(2, '0')}`
    : '00:00';

  const headerTitle = result.testName?.replace('Typing Test - ', '') || 'SSC CGL Typing Result';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StatCard = ({ icon, label, value, description, iconColor, isGradient = false, gradientClass = '' }: any) => (
    <div className={`stat-card ${isGradient ? gradientClass : ''}`}>
      <div className={`stat-icon ${iconColor || 'blue'}`}><img src={icon} alt="" className="stat-icon-svg" /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {description && <div className="stat-description">{description}</div>}
    </div>
  );

  const renderComparison = () => {
    if (!result.originalText || !result.typedText) return null;

    const originalWords = (result.originalText || '').trim().split(/\s+/);
    const typedWords = (result.typedText || '').trim().split(/\s+/);

    const elements = [];
    let oIdx = 0, tIdx = 0, keyCount = 0;

    while (tIdx < typedWords.length) {
      const orig = originalWords[oIdx] || '';
      const typed = typedWords[tIdx];

      if (!orig) { elements.push(<span key={keyCount++}><span className="error-highlight addition">{typed}</span>{' '}</span>); tIdx++; continue; }
      if (orig === typed) { elements.push(<span key={keyCount++}>{typed} </span>); oIdx++; tIdx++; continue; }
      if (orig.toLowerCase() === typed.toLowerCase()) { elements.push(<span key={keyCount++}><span className="error-highlight capitalization-error">{typed}</span>{' '}</span>); oIdx++; tIdx++; continue; }
      if (oIdx + 1 < originalWords.length && typed.toLowerCase() === (orig + originalWords[oIdx + 1]).toLowerCase()) { elements.push(<span key={keyCount++}><span className="error-highlight spacing-error">{typed}</span>{' '}</span>); oIdx += 2; tIdx++; continue; }
      if (tIdx + 1 < typedWords.length && (typed + typedWords[tIdx + 1]).toLowerCase() === orig.toLowerCase()) { elements.push(<span key={keyCount++}><span className="error-highlight spacing-error">{typed + ' ' + typedWords[tIdx + 1]}</span>{' '}</span>); oIdx++; tIdx += 2; continue; }
      const stripPunc = (str: string) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      if (stripPunc(typed) === stripPunc(orig)) { elements.push(<span key={keyCount++}><span className="error-highlight full-error">{typed}</span>{' '}</span>); oIdx++; tIdx++; continue; }

      let synced = false;
      for (let lookahead = 1; lookahead <= 3; lookahead++) {
        if (oIdx + lookahead < originalWords.length && typed === originalWords[oIdx + lookahead]) { oIdx += lookahead; elements.push(<span key={keyCount++}>{typed} </span>); oIdx++; tIdx++; synced = true; break; }
        if (tIdx + lookahead < typedWords.length && typedWords[tIdx + lookahead] === orig) { for (let k = 0; k < lookahead; k++) { elements.push(<span key={keyCount++}><span className="error-highlight addition">{typedWords[tIdx]}</span>{' '}</span>); tIdx++; } synced = true; break; }
      }
      if (!synced) { elements.push(<span key={keyCount++}><span className="error-highlight full-error">{typed}</span>{' '}</span>); oIdx++; tIdx++; }
    }

    return (
      <div className="comparison-section">
        <div className="text-box-container"><h3 className="text-box-title">Original Text</h3><div className="text-box-content original-content">{result.originalText}</div></div>
        <div className="text-box-container">
          <h3 className="text-box-title">Your Typed Text</h3><div className="text-box-content typed-content">{elements}</div>
          <div className="error-legend">
            <div className="legend-item legend-addition">Addition: Extra words</div>
            <div className="legend-item legend-full">Full Error: Substitutions, spelling, omissions[cite: 6]</div>
            <div className="legend-item legend-caps">Capitalization Error[cite: 6]</div>
            <div className="legend-item legend-spacing">Spacing Error[cite: 6]</div>
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
        <StatCard icon="/media/result-icons/full-errors-result.svg" label="Full Mistakes" value={sscStats.full} description="Omission, substitution, addition, spelling errors[cite: 6]" iconColor="red" />
        <StatCard icon="/media/result-icons/total-errors-result.svg" label="Half Mistakes" value={sscStats.half} description="Spacing, capitalization, punctuation, transposition[cite: 6]" iconColor="purple" />
        <StatCard icon="/media/result-icons/total-errors-result.svg" label="Total Penalty" value={sscStats.totalPenalty} description="Full Mistakes + (Half Mistakes / 2)" iconColor="orange" />
        <StatCard icon="/media/result-icons/error-percentage-result.svg" label="SSC Error %" value={`${sscStats.errorPercentage.toFixed(2)}%`} description="(Total Penalty / Master Words) × 100" iconColor="red" />
        <StatCard icon="/media/result-icons/keystrokes-result.svg" label="Keystrokes Typed" value={result.keyStrokesByCandidate || 0} description="Letters, numbers, spaces" iconColor="blue" />
        <StatCard icon="/media/result-icons/words-typed-result.svg" label="Words Typed" value={Math.round((result.keyStrokesByCandidate || 0) / 5)} description="Total Keystrokes / 5" iconColor="blue" />
        
        {/* Exact 1-Decimal WPM values shown here */}
        <StatCard icon="/media/result-icons/gross-wpm-result.svg" label="Gross WPM" value={`${exactGrossWPM.toFixed(1)} WPM`} description="(Keystrokes / 5) / Time" iconColor="blue" />
        <StatCard icon="/media/result-icons/net-wpm-result.svg" label="Net WPM" value={`${exactNetWPM.toFixed(1)} WPM`} description="Gross WPM - Penalty/Time" iconColor="blue" />
        
        <StatCard icon="/media/result-icons/accuracy-result.svg" label="Accuracy" value={`${Math.round(result.accuracy || 0)}%`} description="(Net WPM / Gross WPM) × 100" iconColor="blue" />
        <StatCard icon="/media/result-icons/duration-result.svg" label="Test Duration" value={timeTaken} description="Time taken for the test" iconColor="blue" />
        <StatCard icon="/media/result-icons/qualification-resul.svg" label="Qualification" value={sscStats.isQualified ? 'Passed' : 'Failed'} description="Error Percentage ≤ 5%" isGradient={true} gradientClass={sscStats.isQualified ? 'qualification' : ''} />
        <StatCard icon="/media/result-icons/marks-result.svg" label="Evaluation Type" value="Qualifying" description="CGL typing is qualifying in nature" isGradient={true} gradientClass="marks" />
      </div>

      {renderComparison()}

      <div className="formula-section">
        <button className="formula-toggle-btn" onClick={() => setShowFormulas(!showFormulas)}>
          <div className="formula-title-left"><Calculator size={24} color="#3b82f6" /><span className="formula-title-text">SSC CGL Official Formulas</span></div>
          {showFormulas ? <ChevronUp size={24} color="#6b7280" /> : <ChevronDown size={24} color="#6b7280" />}
        </button>
        {showFormulas && (
          <div className="formula-content">
            <div className="formula-item"><div className="formula-item-label">Full Mistakes</div><div className="formula-item-description">Omission, substitution, addition, spelling errors[cite: 6]</div></div>
            <div className="formula-item"><div className="formula-item-label">Half Mistakes</div><div className="formula-item-description">Spacing errors, wrong capitalization, punctuation, transposition[cite: 6]</div></div>
            <div className="formula-item"><div className="formula-item-label">Total Penalty</div><div className="formula-item-description">Full Mistakes + (Half Mistakes / 2)</div></div>
            <div className="formula-item"><div className="formula-item-label">Error Percentage</div><div className="formula-item-description">(Total Penalty / Master Passage Words) × 100</div></div>
          </div>
        )}
      </div>

      {!isHistoryView && (
        <div className="result-actions-container">
          <div className="buttons-row flex-row-align">
            <ResultActionButtons onRetake={onRestart} />
            {onTakeAnother && <button onClick={onTakeAnother} className="take-another-button"><FileText size={18} /><span>Take Another Test</span></button>}
          </div>
        </div>
      )}
    </div>
  );
}