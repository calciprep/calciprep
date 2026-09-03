'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exams } from '@/lib/typing';
import TypingInterface from '@/components/features/typing/TypingInterface';
import TypingResult from '@/components/features/typing/TypingResult';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TypingTestPage() {
  const params = useParams();
  const router = useRouter();

  const examId = params.examId as string;
  const passageId = params.passageId as string;

  const [testState, setTestState] = useState<'running' | 'finished'>(
    'running'
  );
  const [finalStats, setFinalStats] = useState<TypingResultType | null>(null);

  // Fetch data
  const examData = exams[examId];

  if (!examData) {
    return (
      <div>
        <p>Exam Not Found</p>
        <Link
          href="/typing"
          className="text-blue-600 hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Exams
        </Link>
      </div>
    );
  }

  const passage = examData.passages.find((p) => p.id === passageId);

  if (!passage) {
    return (
      <div>
        <p>Passage Not Found</p>
        <Link
          href={`/typing/${examId}`}
          className="text-blue-600 hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Passages
        </Link>
      </div>
    );
  }

  const handleTestFinish = (stats: TypingResultType) => {
    setFinalStats(stats);
    setTestState('finished');
  };

  const handleRetry = () => {
    setFinalStats(null);
    setTestState('running');
  };

  return (
    <div>
      {testState === 'running' && (
        <TypingInterface
          passage={passage}
          examRules={examData.rules}
          onFinish={handleTestFinish}
          onCancel={() => router.push(`/typing/${examId}`)}
        />
      )}

      {testState === 'finished' && finalStats && (
        <TypingResult
          result={finalStats}
          onRestart={handleRetry}
          onTakeAnother={() => router.push(`/typing/${examId}`)}
        />
      )}
    </div>
  );
}