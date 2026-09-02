"use client";

import Image from "next/image";
import Link from "next/link";

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="features">
      {/* Subtle Premium Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">excel</span>
          </h2>
          <p className="text-lg text-slate-600">
            We've built a comprehensive suite of tools to help you master Maths, English, and Typing. And yes, Advanced Analytics is officially live.
          </p>
        </div>

        <div className="space-y-24">
          {/* Feature 1: Advanced Analytics (Now Live!) */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Now Live
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Advanced Analytics Dashboard</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Stop guessing and start tracking. Our brand new analytics engine breaks down your performance across all subjects. Identify your weak spots, track your typing speed history, and watch your accuracy soar.
              </p>
              <Link href="/analytics" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-slate-900 rounded-xl hover:bg-green-600 transition-colors duration-300 shadow-md">
                View Your Analytics
              </Link>
            </div>
            <div className="flex-1 order-1 md:order-2 relative w-full flex justify-center">
              <div className="absolute inset-0 bg-green-200 rounded-[3rem] blur-3xl opacity-30 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500"></div>
              <Image 
                src="/media/analytics-illustration.svg" 
                alt="Analytics Dashboard" 
                width={500} 
                height={400} 
                className="relative z-10 w-full max-w-md h-auto drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>

          {/* Feature 2: Multiple Subjects */}
          <div className="flex flex-col md:flex-row items-center gap-12 group">
            <div className="flex-1 relative w-full flex justify-center">
              <div className="absolute inset-0 bg-blue-200 rounded-[3rem] blur-3xl opacity-30 transform rotate-6 group-hover:rotate-0 transition-transform duration-500"></div>
              <Image 
                src="/media/subjects-illustration.svg" 
                alt="Multiple Subjects" 
                width={500} 
                height={400} 
                className="relative z-10 w-full max-w-md h-auto drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-6">
                Core Curriculum
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Master Three Essential Skills</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Whether you are preparing for exams or building life skills, our platform offers dedicated modules for complex Mathematics, comprehensive English grammar, and professional touch-typing.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}