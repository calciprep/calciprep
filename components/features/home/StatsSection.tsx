import React from 'react';

export default function StatsSection() {
  return (
    <section className="px-4 py-12 max-w-6xl mx-auto">
      <div className="bg-white border-[3px] border-black rounded-[2rem] p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          
          {/* Active Users - Yellow */}
          <div className="bg-[#FDFD96] border-[3px] border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center h-32 md:h-40">
            <h3 className="text-3xl md:text-5xl font-extrabold font-serif mb-2 text-slate-900">118K+</h3>
            <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-900">Active Users</p>
          </div>

          {/* Typing Tests - Blue */}
          <div className="bg-[#ADD8E6] border-[3px] border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center h-32 md:h-40">
            <h3 className="text-3xl md:text-5xl font-extrabold font-serif mb-2 text-slate-900">4k+</h3>
            <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-900">Typing Tests</p>
          </div>

          {/* Daily Updates - Green */}
          <div className="bg-[#C1E1C1] border-[3px] border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center h-32 md:h-40">
            <h3 className="text-3xl md:text-5xl font-extrabold font-serif mb-2 text-slate-900">50+</h3>
            <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-900">Daily Updates</p>
          </div>

          {/* Satisfaction - Pink */}
          <div className="bg-[#F9C5D1] border-[3px] border-black rounded-2xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center h-32 md:h-40">
            <h3 className="text-3xl md:text-5xl font-extrabold font-serif mb-2 text-slate-900">99%</h3>
            <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-900">Satisfaction</p>
          </div>

        </div>
      </div>
    </section>
  );
}