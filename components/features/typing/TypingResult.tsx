'use client';

import React from 'react';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

import HCMResult from './results/HCMResult';
import CGLResult from './results/CGLResult';
import CHSLResult from './results/CHSLResult';

interface Props {
  result: TypingResultType & { category?: string }; 
  onRestart?: () => void;
  onTakeAnother?: () => void;
  isHistoryView?: boolean;
}

export default function TypingResult({ 
  result, 
  onRestart = () => {}, 
  onTakeAnother, 
  isHistoryView = false 
}: Props) {
  
  if (!result) return null;

  // Determine the test type from either the saved category or the test name
  const identifier = (result.category || result.testName || '').toUpperCase();

  // Route to the correct specific UI based on the identifier
  if (identifier.includes('CGL')) {
    return <CGLResult result={result} onRestart={onRestart} onTakeAnother={onTakeAnother} isHistoryView={isHistoryView} />;
  }
  
  if (identifier.includes('CHSL')) {
    return <CHSLResult result={result} onRestart={onRestart} onTakeAnother={onTakeAnother} isHistoryView={isHistoryView} />;
  }

  // Default to HCM for Delhi Police or standard tests
  return <HCMResult result={result} onRestart={onRestart} onTakeAnother={onTakeAnother} isHistoryView={isHistoryView} />;
}