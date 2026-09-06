'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Trophy, Play, Lock, Download, Loader2, CheckCircle2, CalendarOff } from 'lucide-react';
import { getTodayCGLPassage } from './dailyData';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function SSCCGL_LiveTestLanding() {
  const router = useRouter();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, openModal, setLoginMode } = useAuth() as any;
  
  const [testStatus, setTestStatus] = useState<'upcoming' | 'live' | 'ended'>('upcoming');
  const [timeLeft, setTimeLeft] = useState('');
  const [hasTakenTest, setHasTakenTest] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  // REAL-TIME CGL ADMIN SETTINGS
  const [settings, setSettings] = useState({
    cglActive: false,
    startTime: "10:00",
    endTime: "11:50",
    cglPauseDate: "",
    cglLaunchDate: "",
    isLoading: true
  });

  // NEW: CLOUD PASSAGE STATES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cloudPassage, setCloudPassage] = useState<any>(null);
  const [fetchingCloud, setFetchingCloud] = useState(true);

  const handleLoginClick = () => {
    if (setLoginMode) setLoginMode(true); 
    if (openModal) openModal(); 
  };

  // 1. FETCH SETTINGS
  useEffect(() => {
    // STRICT db! ENFORCEMENT
    const docRef = doc(db!, 'app_settings', 'live_tests');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          cglActive: data.cglActive || false,
          startTime: data.startTime || "10:00",
          endTime: data.endTime || "11:50",
          cglPauseDate: data.cglPauseDate || "",
          cglLaunchDate: data.cglLaunchDate || "",
          isLoading: false
        });
      } else {
        setSettings(prev => ({ ...prev, isLoading: false }));
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. FETCH LATEST LIVE CLOUD PASSAGE
  useEffect(() => {
    const fetchCloud = async () => {
      try {
        // STRICT db! ENFORCEMENT - Grabs the single most recent "Live CGL" passage uploaded via CMS
        const q = query(collection(db!, 'passages_Live_CGL'), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setCloudPassage(snap.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching live cloud passage:", error);
      } finally {
        setFetchingCloud(false);
      }
    };
    fetchCloud();
  }, []);

  // 3. PASSAGE MERGE LOGIC (Cloud takes priority, falls back to Hardcoded)
  const staticPassage = settings.isLoading ? null : getTodayCGLPassage(settings);
  const activePassage = cloudPassage || staticPassage;
  const TEST_DATE = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // 4. DYNAMIC TIMER ENGINE
  useEffect(() => {
    if (settings.isLoading || !activePassage) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentSec = now.getSeconds();
      
      const [startH, startM] = settings.startTime.split(':').map(Number);
      const [endH, endM] = settings.endTime.split(':').map(Number);

      const startInSeconds = (startH * 3600) + (startM * 60);
      const endInSeconds = (endH * 3600) + (endM * 60);
      const nowInSeconds = (currentHour * 3600) + (currentMin * 60) + currentSec;

      if (nowInSeconds < startInSeconds) {
        setTestStatus('upcoming');
        const diff = startInSeconds - nowInSeconds;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setTimeLeft(`${h}h ${m}m ${s}s`);
      } else if (nowInSeconds >= endInSeconds) {
        setTestStatus('ended');
      } else {
        setTestStatus('live');
        const diff = endInSeconds - nowInSeconds;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        setTimeLeft(`${h}h ${m}m remaining`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [settings, activePassage]);

  // 5. CHECK USER STATUS
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!currentUser) {
        setIsCheckingUser(false);
        return;
      }
      try {
        const today = new Date();
        today.setHours(today.getHours() - 4);
        const dateString = today.toLocaleDateString('en-CA');
        const leaderboardRefName = `live_leaderboards_cgl_${dateString}`;

        // STRICT db! ENFORCEMENT
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
  }, [currentUser]);

  const handleStartTest = () => {
    if (testStatus === 'live' && !hasTakenTest && currentUser) {
      router.push('/live-tests/typing/ssc_cgl/take');
    }
  };

  // SAFE CHECKS FOR UI RENDERING
  const isExamPaused = settings.cglPauseDate && new Date() < new Date(settings.cglPauseDate);
  const isTestActive = settings.cglActive && !isExamPaused && activePassage;

  if (settings.isLoading || fetchingCloud) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[100px] pb-20">
      <div className="max-w-4xl mx-auto px-4">
        
        <button onClick={() => router.push('/live-tests/typing')} className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Typing Exams
        </button>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-8">
            <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider">{TEST_DATE}</div>
            
            {isTestActive && (
              <>
                {testStatus === 'live' && !hasTakenTest && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 animate-pulse"><div className="w-2 h-2 rounded-full bg-red-600"></div> LIVE NOW</div>}
                {hasTakenTest && <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={16} /> COMPLETED</div>}
                {testStatus === 'upcoming' && !hasTakenTest && <div className="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Clock size={16} /> STARTS AT {settings.startTime}</div>}
                {testStatus === 'ended' && !hasTakenTest && <div className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2"><Lock size={16} /> TEST ENDED</div>}
              </>
            )}
          </div>

          {!isTestActive ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarOff size={40} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{fontFamily: 'var(--font-oswald)'}}>
                Scheduled Break
              </h1>
              <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto mb-8">
                {isExamPaused 
                  ? `SSC CGL Tier-II Live tests are paused until ${new Date(settings.cglPauseDate).toLocaleDateString()}. Take a break and review your past analytics!`
                  : "There is no Live Mock scheduled for today. Take a break, review your past analytics, or practice in the normal typing arena!"}
              </p>
              <button onClick={() => router.push('/live-tests')} className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all mx-auto">
                Explore Other Live Tests
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4" style={{fontFamily: 'var(--font-oswald)'}}>
                {activePassage?.title}
              </h1>
              
              {/* Cloud Badge to let you know it successfully fetched from Admin! */}
              {cloudPassage && (
                <span className="inline-block bg-fuchsia-100 text-fuchsia-700 text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider mb-4 border border-fuchsia-200">
                  Cloud Live Deployment
                </span>
              )}

              <p className="text-lg text-slate-600 font-medium mb-10 max-w-2xl">
                This is the official daily live typing test for SSC CGL Tier-II aspirants. Your formatting, spacing, and speed will be evaluated strictly under TCS/NTA rules.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-slate-800 font-black text-lg">15 Mins</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today's Keystrokes</p>
                  <p className="text-slate-800 font-black text-lg">{activePassage?.text.length} Keys</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Practice Material</p>
                  <a href="/pdf/ssc-cgl-bulk-live-tests.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold mt-0.5 transition-colors">
                    <Download size={18} /> Download PDF
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
                  <button onClick={() => router.push('/live-tests/typing/ssc_cgl/leaderboard')} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-10 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-lg">
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