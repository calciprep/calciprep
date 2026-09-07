'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HCMInterface from '@/components/features/typing/interfaces/HCMInterface';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import { getTodayHCMPassage } from '../dailyData';
import { Loader2, ShieldAlert } from 'lucide-react';

// FIREBASE IMPORTS
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function DPHCMLiveTestEngine() {
  const router = useRouter();
  
  // DATA STATES FOR CLOUD SYNCHRONIZATION
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cloudPassages, setCloudPassages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // 1. FETCH EVERYTHING REQUIRED TO FIND TODAY'S PASSAGE
  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const settingsSnap = await getDoc(doc(db!, 'app_settings', 'live_tests'));
        setSettings(settingsSnap.exists() ? settingsSnap.data() : null);

        const q = query(collection(db!, 'passages_Live_HCM'), orderBy('createdAt', 'asc'));
        const passagesSnap = await getDocs(q);
        setCloudPassages(passagesSnap.docs.map(d => d.data()));
      } catch (error) {
        console.error("Error fetching live test requirements:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchEverything();
  }, []);

  // 2. RESOLVE TODAY'S PASSAGE (Cloud + Hardcoded Merge)
  const todayPassage = loadingData ? null : getTodayHCMPassage(settings, cloudPassages);

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
    sessionStorage.setItem('liveTestResult', JSON.stringify(stats));
    router.push('/live-tests/typing/delhi_police_hcm/result');
  };

  const handleCancel = () => {
    router.push('/live-tests/typing/delhi_police_hcm');
  };

  if (loadingData) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;
  }

  // Graceful Fallback if test is inactive
  if (!todayPassage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">No Active Test Today</h2>
          <p className="text-slate-600 mb-6 font-medium">There is no live test scheduled for today.</p>
          <button onClick={() => router.push('/live-tests/typing/delhi_police_hcm')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

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