'use client';

import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Calendar } from 'lucide-react'; 

export default function FreeToolsSection() {
  return (
    <section className="px-4 py-16 max-w-5xl mx-auto text-center">
      {/* Brutalist Badge */}
      <span className="bg-black text-white text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-md mb-4 inline-block shadow-[2px_2px_0px_0px_rgba(226,94,62,1)]">
        ESSENTIAL TOOLS
      </span>
      
      <h2 className="text-4xl md:text-5xl font-black mb-4 font-serif text-black">
        Free Tools For Aspirants
      </h2>
      <p className="text-slate-800 font-bold mb-12 text-lg">
        Useful utilities to help you prepare better and faster
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
        
        {/* Yellow Card - Image Resizer */}
        <Link href="/tools/image-resizer" className="block group">
          <div className="bg-[#FDFD96] border-[3px] border-black rounded-[2rem] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
            <div className="bg-white border-[3px] border-black rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
              <ImageIcon size={28} className="text-black" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black font-serif text-black mb-3">Image Resizer</h3>
            <p className="text-black font-bold">Crop, resize, and compress photos and signatures for your exam applications locally on your device.</p>
          </div>
        </Link>

        {/* Blue Card - Exam Calendar */}
        <Link href="/tools/calendar" className="block group">
          <div className="bg-[#ADD8E6] border-[3px] border-black rounded-[2rem] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
            <div className="bg-white border-[3px] border-black rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
              <Calendar size={28} className="text-black" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black font-serif text-black mb-3">Exam Calendar</h3>
            <p className="text-black font-bold">Track upcoming exam notification dates, admit card releases, and final exam schedules.</p>
          </div>
        </Link>
        
      </div>
    </section>
  );
}