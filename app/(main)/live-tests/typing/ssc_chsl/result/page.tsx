'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Trophy, Loader2, CheckCircle2 } from 'lucide-react';
import TypingResult from '@/components/features/typing/TypingResult';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import { useAuth } from '@/contexts/AuthContext'; 

import { db } from '@/lib/firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SSCCHSL_LiveResultPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;
  
  const [resultData, setResultData] = useState<TypingResultType | null>(null);
  const [isSaving, setIsSaving] = useState(true);

  const enforceSSCPenalties = (stats: TypingResultType) => {
    // 1. ADDED TYPE-SAFETY: Fallbacks so TypeScript knows these will NEVER be undefined
    const safeOriginalText = stats.originalText || '';
    const safeTypedText = stats.typedText || '';
    const safeTimeTaken = stats.timeTakenInSeconds || 0;

    const originalWords = safeOriginalText.trim().split(/\s+/);
    const typedWords = safeTypedText.trim().split(/\s+/);
    
    let strictErrors = 0;
    const maxLen = Math.max(originalWords.length, typedWords.length);
    
    for (let i = 0; i < maxLen; i++) {
      if (originalWords[i] !== typedWords[i]) {
        strictErrors++;
      }
    }
    
    // 2. ADDED TYPE-SAFETY: Using the safe variables for the math calculations
    const timeInMinutes = safeTimeTaken / 60;
    const grossWpm = timeInMinutes > 0 ? (safeTypedText.length / 5) / timeInMinutes : 0;
    const netWpm = Math.max(0, grossWpm - (strictErrors / timeInMinutes));
    const accuracy = grossWpm > 0 ? Math.max(0, (netWpm / grossWpm) * 100) : 0;
    const errorPercentage = originalWords.length > 0 ? (strictErrors / originalWords.length) * 100 : 0;
    
    return {
      ...stats,
      wpm: grossWpm,
      netWpm: netWpm,
      accuracy: accuracy,
      totalErrors: strictErrors,
      errorPercentage: errorPercentage
    };
  };

  useEffect(() => {
    const savedResult = sessionStorage.getItem('liveTestResult');
    
    if (savedResult) {
      let parsedResult = JSON.parse(savedResult);
      parsedResult = enforceSSCPenalties(parsedResult);
      parsedResult.category = 'CHSL'; 
      
      setResultData(parsedResult);
      saveScoreToLeaderboard(parsedResult);
    } else {
      router.push('/live-tests/typing/ssc_chsl');
    }
  }, [router]);

  const saveScoreToLeaderboard = async (stats: TypingResultType) => {
    try {
      if (!currentUser) {
        setIsSaving(false);
        return; 
      }

      const today = new Date();
      today.setHours(today.getHours() - 4); 
      const dateString = today.toLocaleDateString('en-CA'); 
      
      const leaderboardRefName = `live_leaderboards_chsl_${dateString}`;
      const userDocRef = doc(db!, leaderboardRefName, currentUser.uid);

      await setDoc(userDocRef, {
        uid: currentUser.uid,
        userName: currentUser.displayName || currentUser.name || 'Candidate',
        photoURL: currentUser.photoURL || '',
        wpm: stats.wpm || 0,
        netWpm: stats.netWpm || 0,
        accuracy: stats.accuracy || 0,
        totalErrors: stats.totalErrors || 0,
        errorPercentage: stats.errorPercentage || 0,
        timeTaken: stats.timeTakenInSeconds || 0, // Fallback here just in case!
        timestamp: serverTimestamp()
      });
      
      setIsSaving(false);

    } catch (error) {
      console.error("Error saving to CHSL leaderboard:", error);
      setIsSaving(false);
    }
  };

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-[100px]">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[90px] pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        <div className={`mb-6 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${isSaving ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {isSaving ? (
            <><Loader2 className="animate-spin" size={20} /> Saving your score to the CHSL Pan-India Leaderboard...</>
          ) : (
            <><CheckCircle2 size={20} /> Score successfully recorded for today's live ranking!</>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <TypingResult 
            result={resultData}
            onRestart={() => router.push('/live-tests/typing/ssc_chsl')}
            isHistoryView={true} 
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="w-full sm:w-auto bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Back to Home
          </button>

          <button
            onClick={() => router.push('/live-tests/typing/ssc_chsl/leaderboard')}
            disabled={isSaving}
            className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trophy size={20} className={isSaving ? '' : 'text-amber-400'} />
            View CHSL Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
}