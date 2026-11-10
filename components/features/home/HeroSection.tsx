"use client";

import React from 'react';
import Link from 'next/link';
import { Monitor, RadioTower, Calculator, BookOpenText } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="px-4 pt-8 pb-12 max-w-6xl mx-auto">
      <div className="bg-white dark:bg-black border-[3px] border-black dark:border-zinc-800 rounded-[2rem] p-10 md:p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(38,38,38,1)] relative transition-colors duration-200">
        
        {/* Updated Badge */}
        <div className="inline-flex items-center gap-2 bg-[#F9C5D1] text-slate-900 border-2 border-black dark:border-zinc-800 rounded-full px-5 py-2 font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
          The New Age Learning Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-eb-garamond)' }}>
          Your Complete Govt Exam<br />Prep Platform
        </h1>
        
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
          Master SSC, Banking & Railway exams with our ecosystem of tools, typing tests, mathematics drills, English vocabulary quizzes, and daily updates.
        </p>

        {/* Action Buttons Linked to Platform Features */}
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Link href="/typing">
            <button className="flex items-center gap-2 bg-[#E25E3E] text-white border-2 border-black dark:border-zinc-800 rounded-full px-8 py-3.5 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <Monitor size={20} /> Start Typing Test
            </button>
          </Link>
          
          <Link href="/live-tests">
            <button className="flex items-center gap-2 bg-[#C1E1C1] text-slate-900 border-2 border-black dark:border-zinc-800 rounded-full px-6 py-3.5 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <RadioTower size={20} /> Live Tests
            </button>
          </Link>

          <Link href="/maths">
            <button className="flex items-center gap-2 bg-[#F9C5D1] text-slate-900 border-2 border-black dark:border-zinc-800 rounded-full px-6 py-3.5 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <Calculator size={20} /> Maths Arena
            </button>
          </Link>

          <Link href="/english">
            <button className="flex items-center gap-2 bg-[#ADD8E6] text-slate-900 border-2 border-black dark:border-zinc-800 rounded-full px-6 py-3.5 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
              <BookOpenText size={20} /> English Quizzes
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
