'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Keyboard, Calculator, BookOpen, CalendarClock } from 'lucide-react';

export default function MainLiveTestsArena() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans pt-[100px] pb-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </button>

        {/* HEADER */}
        <div className="flex items-start gap-4 mb-12">
          <div className="bg-red-50 dark:bg-red-950/40 p-3 rounded-2xl flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/40">
            <img src="/media/nav/live-tests-nav.svg" alt="Live Tests" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3" style={{fontFamily: 'var(--font-oswald)'}}>
              Live Test Arena
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium max-w-2xl leading-relaxed">
              Compete in real-time with thousands of aspirants across India. Benchmark your speed, accuracy, and preparation under actual exam pressure.
            </p>
          </div>
        </div>

        {/* DAILY LIVE FORMAT BANNER */}
        <div className="bg-[#161224] bg-gradient-to-r from-[#121424] to-[#2a1b38] rounded-[2rem] p-8 md:p-10 text-white mb-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-zinc-800">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{fontFamily: 'var(--font-oswald)'}}>Daily Live Format</h2>
            <p className="text-slate-300 font-medium text-[15px] leading-relaxed">
              New tests drop daily. The window opens at 8:00 AM and closes strictly at 11:50 PM. Take the test when you are ready, and check your Pan-India percentile on the live leaderboards.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 border border-white/10 hover:bg-white/15 transition-colors backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
            <CalendarClock className="text-rose-400" size={24} />
            <span className="font-bold tracking-wide text-sm">Window: 8:00 AM - 11:50 PM</span>
          </div>
        </div>

        {/* SELECT SUBJECT TITLE */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8" style={{fontFamily: 'var(--font-oswald)'}}>
          Select Subject
        </h2>

        {/* ARENA CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Typing Arena Card (Active) */}
          <Link href="/live-tests/typing" className="group bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-zinc-800 rounded-[2rem] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(38,38,38,1)] transition-all duration-300 hover:-translate-y-2 relative flex flex-col h-full">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/50 border-2 border-black dark:border-zinc-800 rounded-full flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Keyboard size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live Typing Arena</h3>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed mb-6 font-sans">Real-time WPM battles. Compete in SSC CGL, CHSL, and Delhi Police formats. Choose between Ediquity, NTA, or TCS interfaces.</p>
            </div>
            <div className="flex items-center justify-between border-t-[3px] border-black dark:border-zinc-800 pt-6 mt-auto">
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-amber-300 dark:border-amber-800">Exams Available</span>
              <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 group-hover:gap-3 transition-all text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 font-serif">Enter Arena &rarr;</span>
            </div>
          </Link>

          {/* 2. Maths Arena Card (Coming Soon) */}
          <div className="group bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-zinc-800 rounded-[2rem] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)] relative flex flex-col h-full cursor-not-allowed overflow-hidden">
            {/* Inner Content (Dimmed) */}
            <div className="flex flex-col h-full opacity-60 transition-all duration-300 group-hover:blur-[2px]">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950/50 border-2 border-black dark:border-zinc-800 rounded-full flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Calculator size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live Maths Arena</h3>
                <p className="text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed mb-6 font-sans">Beat the clock. Solve complex mathematical problems in our daily mocks alongside top percentile competitors.</p>
              </div>
              <div className="flex items-center justify-between border-t-[3px] border-black dark:border-zinc-800 pt-6 mt-auto">
                <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-purple-300 dark:border-purple-800">Exams Available</span>
                <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm font-serif">Enter Arena &rarr;</span>
              </div>
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <span className="bg-black text-white border-2 border-white px-6 py-3 rounded-xl font-black text-sm shadow-xl flex items-center gap-2 font-serif">
                Coming Soon
              </span>
            </div>
          </div>

          {/* 3. English Arena Card (Coming Soon) */}
          <div className="group bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-zinc-800 rounded-[2rem] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)] relative flex flex-col h-full cursor-not-allowed overflow-hidden">
            {/* Inner Content (Dimmed) */}
            <div className="flex flex-col h-full opacity-60 transition-all duration-300 group-hover:blur-[2px]">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/50 border-2 border-black dark:border-zinc-800 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <BookOpen size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live English Mastery</h3>
                <p className="text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed mb-6 font-sans">Vocabulary, grammar, and comprehension under pressure. Track your daily accuracy against the nation.</p>
              </div>
              <div className="flex items-center justify-between border-t-[3px] border-black dark:border-zinc-800 pt-6 mt-auto">
                <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-blue-300 dark:border-blue-800">Exams Available</span>
                <span className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm font-serif">Enter Arena &rarr;</span>
              </div>
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <span className="bg-black text-white border-2 border-white px-6 py-3 rounded-xl font-black text-sm shadow-xl flex items-center gap-2 font-serif">
                Coming Soon
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
