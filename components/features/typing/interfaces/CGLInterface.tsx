'use client';

import React, { useState } from 'react';
import { Passage, ExamRules } from '@/lib/typing/types';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

import EdiquityMode from './modes/EdiquityMode';
import NTAMode from './modes/NTAMode';
import TCSMode from './modes/TCSMode';

export type UIMode = 'tcs' | 'nta' | 'ediquity';

// ADDED userName to the shared props
export interface CGLModeProps {
  passage: Passage;
  examRules: ExamRules;
  userName?: string; 
  onFinish: (stats: TypingResultType) => void;
  onCancel: () => void;
  currentMode: UIMode;
  onChangeMode: (mode: UIMode) => void;
}

export default function CGLInterface({
  passage,
  examRules,
  userName,
  onFinish,
  onCancel,
}: Omit<CGLModeProps, 'currentMode' | 'onChangeMode'>) {
  
  const [uiMode, setUiMode] = useState<UIMode>('tcs');

  const sharedProps: CGLModeProps = {
    passage,
    examRules,
    userName, // Pass it down
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