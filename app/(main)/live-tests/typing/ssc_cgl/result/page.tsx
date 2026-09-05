'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Trophy, Loader2, CheckCircle2 } from 'lucide-react';
import TypingResult from '@/components/features/typing/TypingResult';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import { useAuth } from '@/contexts/AuthContext'; 

import { db } from '@/lib/firebase'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SSCCGL_LiveResultPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;
  
  const [resultData, setResultData] = useState<TypingResultType | null>(null);
  const [isSaving, setIsSaving] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedResult = sessionStorage.getItem('liveTestResult');
    
    if (savedResult) {
      const parsedResult = JSON.parse(savedResult);
      setResultData(parsedResult);
      saveScoreToLeaderboard(parsedResult);
    } else {
      router.push('/live-tests/typing/ssc_cgl');
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
      
      // UNIQUE CGL COLLECTION
      const leaderboardRefName = `live_leaderboards_cgl_${dateString}`;

      const userDocRef = doc(db!, leaderboardRefName, currentUser.uid);

      await setDoc(userDocRef, {
        uid: currentUser.uid,
        userName: currentUser.displayName || currentUser.name || 'Candidate',
        photoURL: currentUser.photoURL || '',
        wpm: stats.wpm,
        netWpm: stats.netWpm,
        accuracy: stats.accuracy,
        marks: stats.marks || 0,
        timeTaken: stats.timeTakenInSeconds,
        timestamp: serverTimestamp()
      });
      
      setIsSaving(false);
      setSaveSuccess(true);

    } catch (error) {
      console.error("Error saving to leaderboard:", error);
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
            <><Loader2 className="animate-spin" size={20} /> Saving your score to the Pan-India Leaderboard...</>
          ) : (
            <><CheckCircle2 size={20} /> Score successfully recorded for today's live ranking!</>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <TypingResult 
            result={resultData}
            onRestart={() => {}}
            onTakeAnother={() => {}}
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
            onClick={() => router.push('/live-tests/typing/ssc_cgl/leaderboard')}
            disabled={isSaving}
            className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trophy size={20} className={isSaving ? '' : 'text-amber-400'} />
            View Live Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
}