'use client';

import React, { useState, useEffect } from 'react';
import { Passage, ExamRules } from '@/lib/typing/types';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

import EdiquityMode from './modes/EdiquityMode';
import NTAMode from './modes/NTAMode';
import TCSMode from './modes/TCSMode';

export type UIMode = 'tcs' | 'nta' | 'ediquity';

export interface CHSLModeProps {
  passage: Passage;
  examRules: ExamRules;
  userName?: string; 
  onFinish: (stats: TypingResultType) => void;
  onCancel: () => void;
  currentMode: UIMode;
  onChangeMode: (mode: UIMode) => void;
}

// 1. ADDED: The initialMode prop definition to fix the TypeScript error
interface CHSLInterfaceProps extends Omit<CHSLModeProps, 'currentMode' | 'onChangeMode'> {
  initialMode?: UIMode;
}

export default function CHSLInterface({
  passage,
  examRules,
  userName,
  onFinish,
  onCancel,
  initialMode = 'ediquity', // Defaulting to ediquity per your original setup
}: CHSLInterfaceProps) {
  
  // Initialize state with the passed-in mode
  const [uiMode, setUiMode] = useState<UIMode>(initialMode);

  // =======================================================================
  // SCROLL FIX: Forces the window to the top and locks background scrolling
  // =======================================================================
  useEffect(() => {
    // Immediately snap to the top of the page
    window.scrollTo(0, 0);
    
    // Lock the main body so the h-screen interface doesn't shift around
    document.body.style.overflow = 'hidden';
    
    // Cleanup: Unlock the body when the test is finished or cancelled
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  // =======================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sharedProps: any = {
    passage,
    examRules,
    userName, 
    onFinish,
    onCancel,
    currentMode: uiMode,
    onChangeMode: setUiMode,
  };

  switch (uiMode) {
    case 'ediquity':
      return <EdiquityMode key={`chsl-ediquity-${uiMode}`} {...sharedProps} />;
    case 'nta':
      return <NTAMode key={`chsl-nta-${uiMode}`} {...sharedProps} />;
    case 'tcs':
    default:
      return <TCSMode key={`chsl-tcs-${uiMode}`} {...sharedProps} />;
  }
}