'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Trophy, Play, Lock, Download, Loader2, CheckCircle2, CalendarOff } from 'lucide-react';
import { getTodayHCMPassage } from './dailyData';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DPHCM_LiveTestLanding() {
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, openModal, setLoginMode } = useAuth() as any;
  
  const [testStatus, setTestStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');
  const [timeLeft, setTimeLeft] = useState('');
  
  const [hasTakenTest, setHasTakenTest] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  const todayPassage = getTodayHCMPassage();
  const TEST_DATE = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleLoginClick = () => {
    if (setLoginMode) setLoginMode(true); 
    if (openModal) openModal(); 
  };

  useEffect(() => {
    if (!todayPassage) return;

    const timer = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (hours < 10) {
        setTestStatus('upcoming');
        let h = 9 - hours;
        let m = 59 - minutes;
        let s = 59 - now.getSeconds();
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else if (hours > 23 || (hours === 23 && minutes >= 50)) {
        setTestStatus('ended');
      } else {
        setTestStatus('live');
        let h = 23 - hours;
        let m = 49 - minutes;
        if (m < 0) { h -= 1; m += 60; }
        setTimeLeft(`${h}h ${m}m remaining`);
      }
    }, 1000);

    const checkUserStatus = async () => {
      if (!currentUser) {
        setIsCheckingUser(false);
        return;
      }
      try {
        const today = new Date();
        today.setHours(today.getHours() - 4);
        const dateString = today.toLocaleDateString('en-CA');
        const leaderboardRefName = `live_leaderboards_hcm_${dateString}`;

        const userDocRef = doc(db!, leaderboardRefName, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setHasTakenTest(true);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      } finally {
        setIsCheckingUser(false);
      }
    };

    checkUserStatus();

    return () => clearInterval(timer);
  }, [currentUser, todayPassage]);

  const handleStartTest = () => {
    if (testStatus === 'live' && !hasTakenTest && currentUser) {
      router.push('/live-tests/typing/delhi_police_hcm/take');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[100px] pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        <button onClick={() => router.push('/live-tests/typing')} className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Typing Exams
        </button>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-8">
            <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider">{TEST_DATE}</div>
            
            {todayPassage && (
              <>
                {testStatus === 'live' && !hasTakenTest && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 animate-pulse"><div className="w-2 h-2 rounded-full bg-red-600"></div> LIVE NOW</div>}
                {hasTakenTest && <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={16} /> COMPLETED</div>}
                {testStatus === 'upcoming' && !hasTakenTest && <div className="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Clock size={16} /> OPENS AT 10:00 AM</div>}
                {testStatus === 'ended' && !hasTakenTest && <div className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Lock size={16} /> TEST ENDED</div>}
              </>
            )}
          </div>

          {!todayPassage ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarOff size={40} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{fontFamily: 'var(--font-oswald)'}}>
                Scheduled Break
              </h1>
              <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto mb-8">
                There is no Live Mock scheduled for today. Take a break, review your past analytics, or practice in the normal typing arena!
              </p>
              <button onClick={() => router.push('/live-tests')} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all mx-auto">
                Explore Other Live Tests
              </button>
            </div>
          ) : (
            <>
              {/* FIXED: Removed the extra (Delhi Police HCM) text from this header */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{fontFamily: 'var(--font-oswald)'}}>
                {todayPassage.title}
              </h1>
              <p className="text-lg text-slate-600 font-medium mb-10 max-w-2xl">
                This is the official daily live typing test for Delhi Police HCM aspirants. Your formatting, spacing, and speed will be evaluated strictly under HCM rules.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-slate-800 font-black text-lg">10 Mins</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Keystrokes</p>
                  <p className="text-slate-800 font-black text-lg">{todayPassage.text.length} Keys</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Practice Material</p>
                  <a href="/pdf/dp-hcm-bulk-live-tests.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold mt-0.5 transition-colors">
                    <Download size={18} /> Download Bulk PDF
                  </a>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-3 text-slate-600 font-medium">
                  <Clock size={20} className={testStatus === 'live' && !hasTakenTest && currentUser ? 'text-red-500' : 'text-slate-400'} />
                  
                  {!currentUser ? (
                     <span>Please <strong className="text-slate-800">log in</strong> to participate in today's live test.</span>
                  ) : hasTakenTest ? (
                     <span>You have successfully submitted today's test.</span>
                  ) : testStatus === 'upcoming' ? (
                     <span>Test starts in <strong className="text-amber-600">{timeLeft}</strong></span>
                  ) : testStatus === 'live' ? (
                     <span>Window closes in <strong className="text-red-600">{timeLeft}</strong></span>
                  ) : (
                     <span>The window for today's test has closed.</span>
                  )}
                </div>

                {!currentUser ? (
                  <button onClick={handleLoginClick} className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
                    <Lock size={20} /> Login / Sign Up
                  </button>
                ) : isCheckingUser ? (
                  <button disabled className="w-full md:w-auto bg-slate-100 text-slate-400 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg">
                    <Loader2 size={20} className="animate-spin" /> Checking Status...
                  </button>
                ) : hasTakenTest || testStatus === 'ended' ? (
                  <button onClick={() => router.push('/live-tests/typing/delhi_police_hcm/leaderboard')} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
                    <Trophy size={20} className="text-amber-400" /> View Live Leaderboard
                  </button>
                ) : testStatus === 'live' ? (
                  <button onClick={handleStartTest} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                    <Play fill="currentColor" size={20} /> Enter Live Test
                  </button>
                ) : (
                   <button disabled className="w-full md:w-auto bg-slate-200 text-slate-400 px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg cursor-not-allowed">
                   <Lock size={20} /> Waiting to Open...
                 </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}