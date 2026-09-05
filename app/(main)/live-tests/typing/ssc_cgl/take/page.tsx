'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, AlertCircle } from 'lucide-react';
import { getTodayCGLPassage } from '../dailyData';

export default function SSCCGL_LiveTestInterface() {
  const router = useRouter();
  const passageData = getTodayCGLPassage();

  // 15 Minutes for CGL Tier-II
  const TOTAL_TIME_SECONDS = 15 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [typedText, setTypedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Finish test handler wrapped in useCallback to avoid dependency warnings
  const handleFinishTest = useCallback((finalTyped: string) => {
    if (isFinished || !passageData) return;
    setIsFinished(true);

    const timeTakenInSeconds = TOTAL_TIME_SECONDS - timeLeft;
    const targetText = passageData.text;

    // Calculate stats
    let correctChars = 0;
    for (let i = 0; i < finalTyped.length; i++) {
      if (finalTyped[i] === targetText[i]) {
        correctChars++;
      }
    }

    const accuracy = finalTyped.length > 0 ? (correctChars / finalTyped.length) * 100 : 0;
    const timeInMinutes = Math.max(timeTakenInSeconds, 1) / 60;
    const grossWpm = (finalTyped.length / 5) / timeInMinutes;
    const netWpm = (correctChars / 5) / timeInMinutes;

    const resultPayload = {
      wpm: Math.round(grossWpm * 10) / 10,
      netWpm: Math.round(netWpm * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      marks: Math.round(netWpm * (accuracy / 100)),
      timeTakenInSeconds,
      totalChars: finalTyped.length,
      correctChars,
      incorrectChars: finalTyped.length - correctChars,
    };

    sessionStorage.setItem('liveTestResult', JSON.stringify(resultPayload));
    router.push('/live-tests/typing/ssc_cgl/result');
  }, [isFinished, passageData, timeLeft, TOTAL_TIME_SECONDS, router]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest(typedText);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished, typedText, handleFinishTest]);

  // Handle accidental reload or navigation out
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !isFinished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStarted, isFinished]);

  if (!passageData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">No Test Available</h2>
          <p className="text-slate-600 mb-6">There is no active test configured for today.</p>
          <button onClick={() => router.push('/live-tests/typing/ssc_cgl')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">
            Back to Hub
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans select-none flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-lg tracking-wider text-white uppercase" style={{ fontFamily: 'var(--font-oswald)' }}>
            {passageData.title} (SSC CGL Tier-II Exam Interface)
          </h1>
          <p className="text-xs text-slate-400 font-medium">Strict Examination Environment • Do not switch tabs</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-slate-900 border border-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-3">
            <Clock size={20} className="text-rose-500 animate-pulse" />
            <span className="font-mono font-black text-xl text-white">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => handleFinishTest(typedText)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-900/30"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Typing Interface */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col justify-center gap-6">
        {!isStarted ? (
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-10 text-center max-w-2xl mx-auto shadow-2xl">
            <h2 className="text-3xl font-black mb-4 text-white" style={{ fontFamily: 'var(--font-oswald)' }}>Ready to Begin?</h2>
            <p className="text-slate-400 mb-8 font-medium">
              You will have 15 minutes to complete this test. Once you click start, the timer cannot be paused.
            </p>
            <button
              onClick={() => {
                setIsStarted(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/40 transition-all hover:scale-105"
            >
              Start Typing Assessment
            </button>
          </div>
        ) : (
          <div 
            className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Target Passage Display Box */}
            <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-2xl max-h-[300px] overflow-y-auto font-mono text-lg leading-relaxed tracking-wide select-none">
              {passageData.text.split('').map((char, index) => {
                let color = 'text-slate-400';
                if (index < typedText.length) {
                  color = typedText[index] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40 underline';
                }
                return (
                  <span key={index} className={`${color} transition-colors duration-75`}>
                    {char === ' ' && index >= typedText.length ? ' ' : char}
                  </span>
                );
              })}
            </div>

            {/* Hidden Input capturing keystrokes */}
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length <= passageData.text.length) {
                  setTypedText(val);
                  if (val.length === passageData.text.length) {
                    handleFinishTest(val);
                  }
                }
              }}
              onPaste={(e) => e.preventDefault()}
              className="opacity-0 absolute -top-96"
              autoFocus
            />

            <div className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
              Type the highlighted text above • Progress: {typedText.length} / {passageData.text.length} Characters
            </div>
          </div>
        )}
      </main>
    </div>
  );
}