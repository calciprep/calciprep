'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { exams } from '@/lib/typing';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import TypingResult from '@/components/features/typing/TypingResult';

// --- Import all our modular interfaces ---
import HCMInterface from '@/components/features/typing/interfaces/HCMInterface';
import CGLInterface from '@/components/features/typing/interfaces/CGLInterface';
import CHSLInterface from '@/components/features/typing/interfaces/CHSLInterface';

import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';

export default function TypingTestPage() {
  const params = useParams();
  const router = useRouter();
  
  const examId = params.examId as string;
  const passageId = params.passageId as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;
  const userName = currentUser?.displayName || currentUser?.name || 'Candidate';

  const [testState, setTestState] = useState<'running' | 'finished'>('running');
  const [finalStats, setFinalStats] = useState<TypingResultType | null>(null);

  const examData = exams[examId];

  if (!examData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-gray-800 mb-6">Exam Not Found</p>
          <Link href="/typing" className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  const passage = examData.passages.find((p) => p.id === passageId);

  if (!passage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
          <p className="text-2xl font-bold text-gray-800 mb-6">Passage Not Found</p>
          <Link href={`/typing/${examId}`} className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg inline-flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back to Passages
          </Link>
        </div>
      </div>
    );
  }

  const handleTestFinish = async (stats: TypingResultType) => {
    setFinalStats(stats);
    setTestState('finished');

    if (currentUser) {
      try {
        await UserService.addHistory(currentUser.uid, 'typing_history', {
          name: passage.title,
          category: examData.rules.name,
          grossWpm: stats.wpm,
          netWpm: stats.netWpm,
          accuracy: stats.accuracy,
          score: stats.marks || 0,
          keyStrokesByCandidate: stats.keyStrokesByCandidate,
          fullMistakes: stats.fullMistakes,
          totalErrors: stats.totalErrors,
          errorPercentage: stats.errorPercentage,
          backspacePresses: stats.backspacePresses,
          timeTakenInSeconds: stats.timeTakenInSeconds,
          originalText: stats.originalText,
          typedText: stats.typedText,
        });
      } catch (error) {
        console.error("Failed to save typing history to database:", error);
      }
    }
  };

  const handleRetry = () => {
    setFinalStats(null);
    setTestState('running');
  };

  // --- DYNAMIC INTERFACE RENDERER ---
  const renderExamInterface = () => {
    switch (examId) {
      
      case 'ssc_cgl':
        return (
          <CGLInterface 
            passage={passage} 
            examRules={examData.rules} 
            userName={userName}
            onFinish={handleTestFinish} 
            onCancel={() => router.push(`/typing/${examId}`)} 
          />
        );

      // NEW: Add SSC CHSL case!
      case 'ssc_chsl':
        return (
          <CHSLInterface 
            passage={passage} 
            examRules={examData.rules} 
            userName={userName}
            onFinish={handleTestFinish} 
            onCancel={() => router.push(`/typing/${examId}`)} 
          />
        );
      
      case 'delhi_police_hcm':
      default:
        return (
          <HCMInterface
            passage={passage}
            examRules={examData.rules}
            onFinish={handleTestFinish}
            onCancel={() => router.push(`/typing/${examId}`)}
          />
        );
    }
  };

  return (
    <div className={testState === 'running' ? "fixed inset-0 z-[100] bg-white" : "w-full min-h-screen bg-white"}>
      {testState === 'running' && renderExamInterface()}

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