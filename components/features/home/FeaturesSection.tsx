"use client";

import { Target, LineChart, TableProperties, BarChart3, Activity, Zap } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-24" id="features">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-serif">
            Data-Driven Excellence
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Stop guessing. Our premium analytics engine provides deep insights into your typing speed, mathematical accuracy, and overall exam readiness through intuitive graphs and detailed tables.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Yellow */}
          <div className="bg-[#FDFD96] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="bg-white border-[3px] border-black rounded-full w-14 h-14 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Target size={26} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 font-serif">Targeted Weakness Training</h3>
            <p className="text-slate-800 font-medium leading-relaxed">
              Turn your mistakes into mastery. Our system automatically captures the exact words you misspell during tests and generates custom practice paragraphs to aggressively target and eliminate your weaknesses.
            </p>
          </div>

          {/* Card 2: Blue */}
          <div className="bg-[#ADD8E6] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="bg-white border-[3px] border-black rounded-full w-14 h-14 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <LineChart size={26} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 font-serif">WPM Progress Graphs</h3>
            <p className="text-slate-800 font-medium leading-relaxed">
              Visualize your typing speed journey. Our interactive line charts plot your Gross and Net WPM over time, helping you spot performance trends and plateau phases instantly.
            </p>
          </div>

          {/* Card 3: Green */}
          <div className="bg-[#C1E1C1] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="bg-white border-[3px] border-black rounded-full w-14 h-14 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <TableProperties size={26} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 font-serif">Detailed Error Tables</h3>
            <p className="text-slate-800 font-medium leading-relaxed">
              Review every keystroke. Our comprehensive tables break down your full mistakes and half mistakes, categorizing them strictly into spelling, spacing, and capitalization errors.
            </p>
          </div>

          {/* Card 4: Pink */}
          <div className="bg-[#F9C5D1] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="bg-white border-[3px] border-black rounded-full w-14 h-14 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <BarChart3 size={26} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 font-serif">Accuracy Bar Charts</h3>
            <p className="text-slate-800 font-medium leading-relaxed">
              Compare your performance across different exam formats (SSC CGL, CHSL, Delhi Police) with beautiful bar charts that measure your accuracy percentages side-by-side.
            </p>
          </div>

          {/* Card 5: Purple */}
          <div className="bg-[#E6E6FA] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="bg-white border-[3px] border-black rounded-full w-14 h-14 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Activity size={26} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 font-serif">Real-Time Subject Stats</h3>
            <p className="text-slate-800 font-medium leading-relaxed">
              Beyond typing, track your mastery in Mathematics and English. Live progress bars show exactly how much of the syllabus you have conquered and what requires immediate attention.
            </p>
          </div>

          {/* Card 6: Peach */}
          <div className="bg-[#FFDAB9] border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
            <div className="bg-white border-[3px] border-black rounded-full w-14 h-14 flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Zap size={26} className="text-slate-900" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 font-serif">Live Tests Leaderboards</h3>
            <p className="text-slate-800 font-medium leading-relaxed">
              Compete under actual exam pressure. Participate in scheduled live mock tests and benchmark your real-time ranking and percentile among thousands of active aspirants across India.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}