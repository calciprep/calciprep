'use client';

import React, { useState, useEffect } from 'react';
import { Passage, ExamRules } from '@/lib/typing/types';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

import EdiquityMode from './modes/EdiquityMode';
import NTAMode from './modes/NTAMode';
import TCSMode from './modes/TCSMode';

export type UIMode = 'tcs' | 'nta' | 'ediquity';

export interface CGLModeProps {
  passage: Passage;
  examRules: ExamRules;
  userName?: string; 
  onFinish: (stats: TypingResultType) => void;
  onCancel: () => void;
  currentMode: UIMode;
  onChangeMode: (mode: UIMode) => void;
}

interface CGLInterfaceProps extends Omit<CGLModeProps, 'currentMode' | 'onChangeMode'> {
  initialMode?: UIMode;
}

export default function CGLInterface({
  passage,
  examRules,
  userName,
  onFinish,
  onCancel,
  initialMode = 'tcs',
}: CGLInterfaceProps) {
  
  const [uiMode, setUiMode] = useState<UIMode>(initialMode);

  // =======================================================================
  // SCROLL FIX: Forces the window to the top and locks background scrolling
  // =======================================================================
  useEffect(() => {
    // 1. Immediately snap to the top of the page
    window.scrollTo(0, 0);
    
    // 2. Lock the main body so the h-screen interface doesn't shift around
    document.body.style.overflow = 'hidden';
    
    // 3. Cleanup: Unlock the body when the test is finished or cancelled
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  // =======================================================================

  const sharedProps: CGLModeProps = {
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
      return <EdiquityMode key="ediquity" {...sharedProps} />;
    case 'nta':
      return <NTAMode key="nta" {...sharedProps} />;
    case 'tcs':
    default:
      return <TCSMode key="tcs" {...sharedProps} />;
  }
}