'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import HCMInterface from '@/components/features/typing/interfaces/HCMInterface';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import { getTodayHCMPassage } from '../dailyData'; // IMPORT AUTOMATION LOGIC

export default function DPHCMLiveTestEngine() {
  const router = useRouter();
  
  // 1. Fetch today's dynamic automated passage
  const todayPassage = getTodayHCMPassage();

  const hcmRules = {
    id: 'hcm-rules',
    name: 'Delhi Police HCM',
    duration: 600, // 10 minutes
    targetWpm: 30,
    allowBackspace: true,
    highlightCurrentWord: false,
    showLiveStats: false
  };

  const handleTestFinish = (stats: TypingResultType) => {
    // Temporarily save the stats so the Result page can read them before pushing to DB
    sessionStorage.setItem('liveTestResult', JSON.stringify(stats));
    router.push('/live-tests/typing/delhi_police_hcm/result');
  };

  const handleCancel = () => {
    router.push('/live-tests/typing/delhi_police_hcm');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      <HCMInterface
        // @ts-ignore
        passage={todayPassage}
        // @ts-ignore
        examRules={hcmRules}
        onFinish={handleTestFinish}
        onCancel={handleCancel}
      />
    </div>
  );
}