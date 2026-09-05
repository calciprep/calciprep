'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Monitor, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { getTodayCGLPassage } from '../dailyData';
import { useAuth } from '@/contexts/AuthContext';
import CGLInterface, { UIMode } from '@/components/features/typing/interfaces/CGLInterface';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

export default function SSCCGL_LiveTakePage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;

  const todayPassage = getTodayCGLPassage();
  const [selectedMode, setSelectedMode] = useState<UIMode>('tcs');
  const [isTestActive, setIsTestActive] = useState(false);

  if (!todayPassage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">No Active Test Today</h2>
          <p className="text-slate-600 mb-6 font-medium">There is no live test scheduled for today.</p>
          <button onClick={() => router.push('/live-tests/typing/ssc_cgl')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  const examRules = {
    id: 'ssc-cgl-tier2',
    name: 'SSC CGL Tier-II',
    duration: 15 * 60, 
    targetWpm: 27,
    allowBackspace: true,
    showPassage: true,
  };

  const handleFinish = (stats: TypingResultType) => {
    sessionStorage.setItem('liveTestResult', JSON.stringify(stats));
    router.push('/live-tests/typing/ssc_cgl/result');
  };

  const handleCancel = () => {
    router.push('/live-tests/typing/ssc_cgl');
  };

  if (isTestActive) {
    // FIXED: Added the z-[9999] wrapper so the CalciPrep Navbar doesn't overlap the test!
    return (
      <div className="fixed inset-0 z-[9999] bg-white overflow-hidden">
        <CGLInterface
          passage={{
            id: todayPassage.id,
            title: todayPassage.title,
            text: todayPassage.text,
            difficulty: todayPassage.difficulty as "Medium" | "Hard" | "Easy" | "PYTT",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          examRules={examRules as any}
          userName={currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Candidate'}
          initialMode={selectedMode}
          onFinish={handleFinish}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[90px] pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        <button 
          onClick={handleCancel}
          className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Cancel & Return
        </button>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
          
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Official Assessment Room
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3" style={{ fontFamily: 'var(--font-oswald)' }}>
            {todayPassage.title}
          </h1>
          <p className="text-slate-600 font-medium mb-8">
            Select your preferred examination interface mode before beginning. You can also switch modes during the test using the settings panel.
          </p>

          <div className="mb-10">
            <label className="block text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
              Select Typing Interface Mode
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div 
                onClick={() => setSelectedMode('tcs')}
                className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMode === 'tcs' 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${selectedMode === 'tcs' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <Monitor size={20} />
                    </div>
                    {selectedMode === 'tcs' && <CheckCircle2 className="text-indigo-600" size={20} />}
                  </div>
                  <h3 className="font-black text-slate-900 text-base mb-1">TCS iON Mode</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Official layout replicating the real SSC CGL Tier-II examination center.
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Official Recommended</span>
              </div>

              <div 
                onClick={() => setSelectedMode('nta')}
                className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMode === 'nta' 
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${selectedMode === 'nta' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <Monitor size={20} />
                    </div>
                    {selectedMode === 'nta' && <CheckCircle2 className="text-blue-600" size={20} />}
                  </div>
                  <h3 className="font-black text-slate-900 text-base mb-1">NTA Mode</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Standard high-contrast testing interface used across central examinations.
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-bold text-blue-600 uppercase tracking-wider">Central Testing</span>
              </div>

              <div 
                onClick={() => setSelectedMode('ediquity')}
                className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  selectedMode === 'ediquity' 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl ${selectedMode === 'ediquity' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      <Sparkles size={20} />
                    </div>
                    {selectedMode === 'ediquity' && <CheckCircle2 className="text-emerald-600" size={20} />}
                  </div>
                  <h3 className="font-black text-slate-900 text-base mb-1">Ediquity Mode</h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Focused layout with distinct passage and typing split boxes.
                  </p>
                </div>
                <span className="mt-4 text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Classic Split</span>
              </div>

            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4 text-sm font-bold text-slate-700">
            <div>Duration: <span className="text-slate-900 font-black">15 Minutes</span></div>
            <div>Keystrokes: <span className="text-slate-900 font-black">~{todayPassage.text.length} Keys</span></div>
            <div>Candidate: <span className="text-indigo-600 font-black">{currentUser?.displayName || 'Candidate'}</span></div>
          </div>

          <button
            onClick={() => setIsTestActive(true)}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            Launch Live Test in {selectedMode.toUpperCase()} Mode &rarr;
          </button>

        </div>
      </div>
    </div>
  );
}