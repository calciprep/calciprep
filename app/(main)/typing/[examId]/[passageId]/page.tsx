'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exams } from '@/lib/typing';
import TypingInterface from '@/components/features/typing/TypingInterface';
import TypingResult from '@/components/features/typing/TypingResult';
import { ExamRules, Passage } from '@/lib/typing/types';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

export default function TypingTestWrapperPage() {
  const params = useParams();
  const router = useRouter();

  const [examRules, setExamRules] = useState<ExamRules | null>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [testState, setTestState] = useState<'running' | 'finished'>(
    'running'
  );
  const [finalStats, setFinalStats] = useState<TypingResultType | null>(null);

  useEffect(() => {
    // Safely extract the parameters from the URL
    const examId = params.examId as string;
    const passageId = params.passageId as string;

    const examData = exams[examId];

    if (examData) {
      setExamRules(examData.rules);

      // Explicitly typed 'p' as 'Passage' to resolve TypeScript error
      const selectedPassage = examData.passages.find(
        (p: Passage) => p.id === passageId
      );

      if (selectedPassage) {
        setPassage(selectedPassage);
      }
    }
  }, [params]);

  const handleTestFinish = (stats: TypingResultType) => {
    setFinalStats(stats);
    setTestState('finished');
  };

  const handleRetry = () => {
    setTestState('running');
    setFinalStats(null);
  };

  // Loading state while checking URL params
  if (!examRules || !passage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading test...</p>
      </div>
    );
  }

  return (
    <div>
      {testState === 'running' && (
        <TypingInterface
          passage={passage}
          examRules={examRules}
          onFinish={handleTestFinish}
          onCancel={() => router.push(`/typing/${examRules.id}`)}
        />
      )}

      {testState === 'finished' && finalStats && (
        <TypingResult
          result={finalStats}
          onRestart={handleRetry}
        />
      )}
    </div>
  );
}