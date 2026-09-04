'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BrainCircuit, Loader2, Play } from 'lucide-react';

// Import Ediquity Mode and the Result screen
import EdiquityMode from '@/components/features/typing/interfaces/modes/EdiquityMode';
import TypingResult from '@/components/features/typing/TypingResult';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

export default function CustomWeaknessDrillPage() {
  const router = useRouter();
  const [drillText, setDrillText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Manage the state of the page (Intro -> Running -> Finished)
  const [testState, setTestState] = useState<'intro' | 'running' | 'finished'>('intro');
  const [finalStats, setFinalStats] = useState<TypingResultType | null>(null);

  useEffect(() => {
    // Grab the custom text generated from the dashboard
    const text = sessionStorage.getItem('customTypingDrill');
    setDrillText(text);
    setIsLoading(false);
  }, []);

  // Show a loader while checking session storage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-[120px]">
        <Loader2 className="animate-spin text-rose-500 w-10 h-10" />
      </div>
    );
  }

  // If there's no text (user navigated here directly), show an error state
  if (!drillText) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 pt-[120px] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md">
          <BrainCircuit className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">No Drill Found</h2>
          <p className="text-slate-500 mb-8 font-medium">
            Please generate a custom weakness drill from your Performance Dashboard first.
          </p>
          <button
            onClick={() => router.push('/dashboard?tab=typing')}
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- HANDLERS ---
  const handleTestFinish = (stats: TypingResultType) => {
    setFinalStats(stats);
    setTestState('finished');
    // Note: We intentionally do NOT save this to UserService.addHistory 
    // to prevent skewing their overall official exam stats!
  };

  const handleRestart = () => {
    setFinalStats(null);
    setTestState('running');
  };

  // --- MOCK OBJECTS FOR EDIQUITY MODE ---
  const customPassage = {
    id: 'custom-drill',
    title: 'Weakness Drill',
    text: drillText,
    difficulty: 'Medium'
  };

  const customRules = {
    id: 'custom-rules',
    name: 'Targeted',
    duration: 300, // 5 minutes
    targetWpm: 30,
    allowBackspace: true,
    highlightCurrentWord: false,
    showLiveStats: false
  };

  // =======================================================================
  // RENDER: RUNNING STATE (Ediquity Interface)
  // =======================================================================
  if (testState === 'running') {
    return (
      <div className="fixed inset-0 z-[100] bg-white">
        <EdiquityMode 
          passage={customPassage as any} 
          examRules={customRules as any}
          onFinish={handleTestFinish}
          onCancel={() => router.push('/dashboard?tab=typing')}
          currentMode="ediquity"
          onChangeMode={() => {}} // Ignore mode switching for this specific drill
        />
      </div>
    );
  }

  // =======================================================================
  // RENDER: FINISHED STATE (Result Screen)
  // =======================================================================
  if (testState === 'finished' && finalStats) {
    return (
      // REDUCED PADDING: Changed pt-[120px] to pt-[90px] for a tighter fit under the navbar
      <div className="min-h-screen bg-slate-50 pt-[90px] pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* REMOVED the redundant Back to Dashboard button here */}
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <TypingResult 
              result={finalStats}
              onRestart={handleRestart}
              onTakeAnother={() => router.push('/dashboard?tab=typing')}
              isHistoryView={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // RENDER: INTRO STATE 
  // =======================================================================
  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[120px] pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {/* Page Header */}
        <div className="mb-10">
          <button
            onClick={() => router.push('/dashboard?tab=typing')}
            className="flex items-center text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1.5" /> Back to Dashboard
          </button>

          <div className="flex items-center gap-4 mb-3">
            <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl">
              <BrainCircuit size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight" style={{fontFamily: 'var(--font-oswald)'}}>
              Targeted Weakness Drill
            </h1>
          </div>
          <p className="text-slate-600 font-medium text-lg ml-[68px]">
            This custom passage focuses exclusively on your most frequently misspelled words.
          </p>
        </div>

        {/* Start Screen Area */}
        <div className="bg-white border border-rose-100 rounded-[2rem] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-6 relative z-10">Your Custom Paragraph:</h3>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 mb-10 text-left max-h-72 overflow-y-auto relative z-10 custom-scrollbar">
            <p className="text-slate-700 text-lg leading-relaxed font-medium">
              {drillText}
            </p>
          </div>
          
          <button
            onClick={() => setTestState('running')}
            className="relative z-10 bg-rose-500 hover:bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/20 transition-all hover:-translate-y-1 inline-flex items-center gap-2"
          >
            <Play fill="currentColor" size={20} />
            Begin Training
          </button>
        </div>
        
      </div>
    </div>
  );
}