'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Keyboard, Calculator, BookOpen, CalendarClock } from 'lucide-react';

export default function MainLiveTestsArena() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[100px] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button 
          onClick={() => router.push('/')} 
          className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </button>

        {/* HEADER */}
        <div className="flex items-start gap-4 mb-12">
          <div className="bg-red-50 p-3 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
            <img src="/media/nav/live-tests-nav.svg" alt="Live Tests" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-3" style={{fontFamily: 'var(--font-oswald)'}}>
              Live Test Arena
            </h1>
            <p className="text-slate-600 text-lg font-medium max-w-2xl leading-relaxed">
              Compete in real-time with thousands of aspirants across India. Benchmark your speed, accuracy, and preparation under actual exam pressure.
            </p>
          </div>
        </div>

        {/* DAILY LIVE FORMAT BANNER */}
        <div className="bg-[#161224] bg-gradient-to-r from-[#121424] to-[#2a1b38] rounded-[2rem] p-8 md:p-10 text-white mb-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{fontFamily: 'var(--font-oswald)'}}>Daily Live Format</h2>
            <p className="text-slate-300 font-medium text-[15px] leading-relaxed">
              New tests drop daily. The window opens at 10:00 AM and closes strictly at 11:50 PM. Take the test when you are ready, and check your Pan-India percentile on the live leaderboards.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 border border-white/10 hover:bg-white/15 transition-colors backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
            <CalendarClock className="text-rose-400" size={24} />
            <span className="font-bold tracking-wide text-sm">Window: 10:00 AM - 11:50 PM</span>
          </div>
        </div>

        {/* SELECT SUBJECT TITLE */}
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8" style={{fontFamily: 'var(--font-oswald)'}}>
          Select Subject
        </h2>

        {/* ARENA CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Typing Arena Card (Active) */}
          <Link href="/live-tests/typing" className="group bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col h-full">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
              <Keyboard size={28} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live Typing Arena</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Real-time WPM battles. Compete in SSC CGL, CHSL, and Delhi Police formats. Choose between Ediquity, NTA, or TCS interfaces.</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
              <span className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Exams Available</span>
              <span className="font-bold text-slate-900 flex items-center gap-2 group-hover:gap-3 transition-all text-sm group-hover:text-amber-600">Enter Arena &rarr;</span>
            </div>
          </Link>

          {/* 2. Maths Arena Card (Coming Soon) */}
          <div className="group bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative flex flex-col h-full cursor-not-allowed overflow-hidden">
            {/* Inner Content (Dimmed) */}
            <div className="flex flex-col h-full opacity-60 transition-all duration-300 group-hover:blur-[2px]">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                <Calculator size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live Maths Arena</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Beat the clock. Solve complex mathematical problems in our daily mocks alongside top percentile competitors.</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                <span className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Exams Available</span>
                <span className="font-bold text-slate-900 flex items-center gap-2 text-sm">Enter Arena &rarr;</span>
              </div>
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <span className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                Coming Soon
              </span>
            </div>
          </div>

          {/* 3. English Arena Card (Coming Soon) */}
          <div className="group bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative flex flex-col h-full cursor-not-allowed overflow-hidden">
            {/* Inner Content (Dimmed) */}
            <div className="flex flex-col h-full opacity-60 transition-all duration-300 group-hover:blur-[2px]">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <BookOpen size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live English Mastery</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">Vocabulary, grammar, and comprehension under pressure. Track your daily accuracy against the nation.</p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">Exams Available</span>
                <span className="font-bold text-slate-900 flex items-center gap-2 text-sm">Enter Arena &rarr;</span>
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
              <span className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                Coming Soon
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}