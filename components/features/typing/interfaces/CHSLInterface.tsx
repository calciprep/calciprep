'use client';

import React, { useState } from 'react';
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

export default function CHSLInterface({
  passage,
  examRules,
  userName,
  onFinish,
  onCancel,
}: Omit<CHSLModeProps, 'currentMode' | 'onChangeMode'>) {
  
  // Set the default mode to Ediquity specifically for CHSL
  const [uiMode, setUiMode] = useState<UIMode>('ediquity');

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