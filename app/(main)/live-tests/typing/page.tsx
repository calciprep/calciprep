'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Keyboard, Bell, CalendarOff, Loader2 } from 'lucide-react';

import sscLogo from '@/public/media/ssc-logo.png';
import dpLogo from '@/public/media/delhi-police-logo.png';

// FIREBASE IMPORTS
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function LiveTypingHubPage() {
  const router = useRouter();

  // REAL-TIME DATABASE STATES
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    cglActive: false,
    chslActive: false,
    hcmActive: false,
    tickerText: "Loading live updates...",
  });

  // FIREBASE ONSNAPSHOT LISTENER (Real-time updates without refreshing!)
  useEffect(() => {
    const docRef = doc(db!, 'app_settings', 'live_tests');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          cglActive: data.cglActive || false,
          chslActive: data.chslActive || false,
          hcmActive: data.hcmActive || false,
          tickerText: data.tickerText || "🚨 LIVE TESTS ARE CURRENTLY ON A SCHEDULED BREAK. 🚨",
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching live settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const anyTestActive = settings.hcmActive || settings.cglActive || settings.chslActive;

  const TICKER_ELEMENT = (
    <>
      {settings.tickerText}{' '}
      <Link href="/live-tests/typing/delhi_police_hcm" className="underline hover:text-red-200 transition-colors ml-2">
        Login now to check your ranking.
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[80px] pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes seamless-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: seamless-ticker 45s linear infinite; 
          display: flex;
          white-space: nowrap;
        }
        .ticker-container:hover .animate-ticker {
          animation-play-state: paused;
        }
        .mask-image-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}} />

      <div className="w-full bg-red-600 text-white py-2.5 flex items-center ticker-container mb-8 shadow-sm">
        <div className="container mx-auto flex items-center px-4 relative overflow-hidden mask-image-fade">
          <Bell size={18} className="absolute left-4 z-20 text-white drop-shadow-md" />
          <div className="flex ml-8 pl-4">
            <div className="animate-ticker shrink-0">
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
            </div>
            <div className="animate-ticker shrink-0" aria-hidden="true">
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push('/live-tests')} className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to Subject Selection
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl">
            <Keyboard size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight" style={{fontFamily: 'var(--font-oswald)'}}>
            Live Typing Arena
          </h1>
        </div>
        <p className="text-slate-600 text-lg font-medium mb-12 ml-[58px] max-w-2xl">
          Select your target exam. Only exams with active live tests scheduled for today are shown below. Daily live tests are strictly formatted according to official notification guidelines.
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 w-12 h-12 mb-4" />
            <p className="text-slate-500 font-bold">Checking Live Test schedules...</p>
          </div>
        ) : !anyTestActive ? (
           <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
             <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarOff size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-900 mb-2">No Live Tests Today</h3>
             <p className="text-slate-500 font-medium">All live tests are currently on a scheduled break. Keep an eye on the notification ticker above for upcoming dates!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {settings.hcmActive && (
              <Link href="/live-tests/typing/delhi_police_hcm" className="group bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center p-2">
                    <Image src={dpLogo} alt="Delhi Police Logo" className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider animate-pulse">
                    Live Today
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Delhi Police HCM</h3>
                  <p className="text-slate-500 font-medium text-sm mb-6">400 Words • 10 Minutes • Formatting Evaluation</p>
                </div>
                <div className="text-emerald-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-sm border-t border-slate-100 pt-4 mt-auto">
                  Join Exam Room &rarr;
                </div>
              </Link>
            )}

            {settings.cglActive && (
              <Link href="/live-tests/typing/ssc_cgl" className="group bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center p-2">
                    <Image src={sscLogo} alt="SSC Logo" className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider animate-pulse">
                    Live Today
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2">SSC CGL Tier-II</h3>
                  <p className="text-slate-500 font-medium text-sm mb-6">2000 Keys • 15 Mins • TCS/NTA Interfaces</p>
                </div>
                <div className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-sm border-t border-slate-100 pt-4 mt-auto">
                  Join Exam Room &rarr;
                </div>
              </Link>
            )}

            {settings.chslActive && (
              <Link href="/live-tests/typing/ssc_chsl" className="group bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center p-2">
                    <Image src={sscLogo} alt="SSC Logo" className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                  <span className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider animate-pulse">
                    Live Today
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2">SSC CHSL Tier-II</h3>
                  <p className="text-slate-500 font-medium text-sm mb-6">1750 Keys • 10 Mins • TCS/NTA Interfaces</p>
                </div>
                <div className="text-cyan-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all text-sm border-t border-slate-100 pt-4 mt-auto">
                  Join Exam Room &rarr;
                </div>
              </Link>
            )}

            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center opacity-50 h-full min-h-[220px]">
               <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                 <Bell size={20} />
               </div>
               <p className="text-slate-500 font-bold text-sm">More Exams<br/>Coming Soon</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}