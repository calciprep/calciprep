"use client";

import { Target, LineChart, TableProperties, BarChart3, Activity, Zap } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="features">
      {/* Subtle Premium Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{fontFamily: 'var(--font-oswald)'}}>
            Data-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5b58f5] to-indigo-400">Excellence</span>
          </h2>
          <p className="text-lg text-slate-600 font-sans">
            Stop guessing. Our premium analytics engine provides deep insights into your typing speed, mathematical accuracy, and overall exam readiness through intuitive graphs and detailed tables.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          
          {/* Card 1: Targeted Weakness Training */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden z-10">
            {/* Liquid Fill Animation Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-rose-100/50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"></div>
            
            <div className="w-14 h-14 bg-rose-50 group-hover:bg-rose-100 transition-colors duration-500 rounded-2xl flex items-center justify-center mb-6 text-rose-600 border border-rose-100">
              <Target size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Targeted Weakness Training</h3>
            <p className="text-slate-600 font-sans leading-relaxed">
              Turn your mistakes into mastery. Our system automatically captures the exact words you misspell during tests and generates custom practice paragraphs to aggressively target and eliminate your weaknesses.
            </p>
          </div>

          {/* Card 2: WPM Progress Graphs */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"></div>
            
            <div className="w-14 h-14 bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-500 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 border border-indigo-100">
              <LineChart size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>WPM Progress Graphs</h3>
            <p className="text-slate-600 font-sans leading-relaxed">
              Visualize your typing speed journey. Our interactive line charts plot your Gross and Net WPM over time, helping you spot performance trends and plateau phases instantly.
            </p>
          </div>

          {/* Card 3: Detailed Error Tables */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"></div>
            
            <div className="w-14 h-14 bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-500 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
              <TableProperties size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Detailed Error Tables</h3>
            <p className="text-slate-600 font-sans leading-relaxed">
              Review every keystroke. Our comprehensive tables break down your full mistakes and half mistakes, categorizing them strictly into spelling, spacing, and capitalization errors.
            </p>
          </div>

          {/* Card 4: Accuracy Bar Charts */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"></div>
            
            <div className="w-14 h-14 bg-amber-50 group-hover:bg-amber-100 transition-colors duration-500 rounded-2xl flex items-center justify-center mb-6 text-amber-600 border border-amber-100">
              <BarChart3 size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Accuracy Bar Charts</h3>
            <p className="text-slate-600 font-sans leading-relaxed">
              Compare your performance across different exam formats (SSC CGL, CHSL, Delhi Police) with beautiful bar charts that measure your accuracy percentages side-by-side.
            </p>
          </div>

          {/* Card 5: Real-Time Subject Stats */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-cyan-100/50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"></div>
            
            <div className="w-14 h-14 bg-cyan-50 group-hover:bg-cyan-100 transition-colors duration-500 rounded-2xl flex items-center justify-center mb-6 text-cyan-600 border border-cyan-100">
              <Activity size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Real-Time Subject Stats</h3>
            <p className="text-slate-600 font-sans leading-relaxed">
              Beyond typing, track your mastery in Mathematics and English. Live progress bars show exactly how much of the syllabus you have conquered and what requires immediate attention.
            </p>
          </div>

          {/* Card 6: Live Tests Premium Leaderboards (Updated) */}
          <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"></div>
            
            <div className="w-14 h-14 bg-fuchsia-50 group-hover:bg-fuchsia-100 transition-colors duration-500 rounded-2xl flex items-center justify-center mb-6 text-fuchsia-600 border border-fuchsia-100">
              <Zap size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3" style={{fontFamily: 'var(--font-oswald)'}}>Live Tests Premium Leaderboards</h3>
            <p className="text-slate-600 font-sans leading-relaxed">
              Compete under actual exam pressure. Participate in scheduled live mock tests and benchmark your real-time ranking and percentile among thousands of active aspirants across India.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}