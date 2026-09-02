import React from 'react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Your Analytics</h1>
            <p className="mt-2 text-slate-600 text-lg">Track your progress and dominate your learning goals.</p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Live Tracking Active</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Streak Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Current Streak</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">14 Days</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.58 4.09l-1.39-1.25a.86.86 0 0 0-1.12.1A12.08 12.08 0 0 1 6.55 6.6 6 6 0 0 0 2 12c0 3.31 2.69 6 6 6s6-2.69 6-6a10.05 10.05 0 0 0 2.3-5.26.85.85 0 0 0-.25-.86.84.84 0 0 0-.87-.19 6 6 0 0 1-5.74-.6c1.13.43 2.33.6 3.54.6a8.07 8.07 0 0 0 3.6-1.6zM8 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/></svg>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium mt-4">↑ 2 days longer than last week</p>
          </div>

          {/* Accuracy Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Overall Accuracy</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">94%</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium mt-4">↑ +3% from last month</p>
          </div>

          {/* Time Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Practice Time</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">45<span className="text-xl text-slate-400">h</span> 20<span className="text-xl text-slate-400">m</span></h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-4">Top 10% of users</p>
          </div>

          {/* Typing Speed Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Typing Speed</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">68 <span className="text-lg text-slate-400 font-medium">WPM</span></h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium mt-4">↑ +5 WPM this week</p>
          </div>
        </div>

        {/* Deep Analytics (Charts & Progress) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Custom Activity Bar Chart */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Weekly Practice Activity</h3>
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 mt-8 px-2">
              {/* These are custom built CSS bars! */}
              {[
                { day: 'Mon', height: 'h-24', value: '45m' },
                { day: 'Tue', height: 'h-40', value: '1h 20m' },
                { day: 'Wed', height: 'h-32', value: '1h' },
                { day: 'Thu', height: 'h-56', value: '2h' },
                { day: 'Fri', height: 'h-20', value: '30m' },
                { day: 'Sat', height: 'h-48', value: '1h 45m', active: true },
                { day: 'Sun', height: 'h-32', value: '1h' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-slate-600 mb-2">{bar.value}</div>
                  <div className={`w-full max-w-[3rem] rounded-t-lg transition-all duration-500 ${bar.active ? 'bg-gradient-to-t from-green-500 to-emerald-400' : 'bg-slate-200 group-hover:bg-green-300'} ${bar.height}`}></div>
                  <div className={`mt-4 text-sm font-medium ${bar.active ? 'text-green-600' : 'text-slate-500'}`}>{bar.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Mastery Progress Bars */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Subject Mastery</h3>
            <div className="space-y-8">
              
              {/* Mathematics Progress */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Mathematics
                  </span>
                  <span className="font-bold text-slate-900">85%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* English Progress */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    English Grammar
                  </span>
                  <span className="font-bold text-slate-900">72%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: '72%' }}></div>
                </div>
              </div>

              {/* Typing Progress */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Typing Speed
                  </span>
                  <span className="font-bold text-slate-900">96%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold text-amber-900">💡 Smart Tip:</span> Your English accuracy is lagging slightly. Try spending 15 extra minutes on Grammar Quizzes today!
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}