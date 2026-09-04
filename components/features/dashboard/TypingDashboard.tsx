'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HistoryEntry } from '@/services/userService';
import { Eye, Filter, ArrowUpDown, Calendar, Search, X, TrendingUp, Target, BrainCircuit, Play } from 'lucide-react';
import { ReactLenis } from '@studio-freight/react-lenis';
import TypingResult from '@/components/features/typing/TypingResult';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

type DashboardRecord = {
  id: string;
  exam: string;
  passage: string;
  speed: number;
  accuracy: number;
  status: 'Qualified' | 'Needs Work';
  date: string;
  time: string;
  createdAt: number;
  raw: HistoryEntry;
};

interface TypingDashboardProps {
  history: HistoryEntry[];
  onDelete: (id: string) => Promise<void>;
}

export default function TypingDashboard({ history, onDelete }: TypingDashboardProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Date (Newest First)');
  const [dateRange, setDateRange] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(null);

  useEffect(() => {
    if (selectedRecord) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedRecord]);

  const allRecords = useMemo<DashboardRecord[]>(() => {
    return history.map((item) => {
      const speed = Number(item.netWpm ?? item.grossWpm ?? 0);
      return {
        id: item.id,
        exam: item.category || 'Typing Test',
        passage: item.name || 'Practice',
        speed: speed,
        accuracy: Number(item.accuracy ?? 0),
        status: speed >= 30 ? 'Qualified' : 'Needs Work',
        date: item.date || 'Unknown date',
        time: item.time || 'Unknown time',
        createdAt: item.createdAt || 0,
        raw: item,
      };
    });
  }, [history]);

  const totalTests = allRecords.length;
  const qualifiedTests = allRecords.filter((r) => r.status === 'Qualified').length;
  const avgWpm = totalTests > 0 ? (allRecords.reduce((acc, curr) => acc + curr.speed, 0) / totalTests).toFixed(1) : '0';

  const gaugeLimit = 100;
  const gaugePercentage = Math.min((Number(avgWpm) / gaugeLimit) * 100, 100);
  const semiCircleLength = 125.66; 
  const gaugeOffset = semiCircleLength - (semiCircleLength * gaugePercentage) / 100;

  // =======================================================================
  // WEAK WORDS EXTRACTION
  // =======================================================================
  const topWeakWords = useMemo(() => {
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'that', 'was', 'but', 'they', 'have', 'which', 'our', 'their', 'are', 'this', 'with', 'from', 'what', 'were', 'when', 'your', 'said', 'there', 'will', 'would', 'could', 'should', 'about', 'these', 'them', 'then', 'than', 'into', 'only', 'other', 'some', 'such', 'very', 'been', 'much', 'many']);

    allRecords.forEach(record => {
      if (!record.raw.originalText || !record.raw.typedText) return;
      const originalWords = record.raw.originalText.split(/\s+/);
      const typedWords = record.raw.typedText.split(/\s+/);
      
      originalWords.forEach((word, index) => {
        const typedWord = typedWords[index] || "";
        if (typedWord !== word) {
          const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
          if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
            wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
          }
        }
      });
    });
    return Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(entry => entry[0]);
  }, [allRecords]);

  // =======================================================================
  // RAW DRILL GENERATOR: Only weak words, randomized and repeated
  // =======================================================================
  const handleStartCustomDrill = () => {
    if (topWeakWords.length === 0) return;
    
    let drillWords: string[] = [];
    
    // Repeat the block of weak words 15 times to generate a long enough drill paragraph
    for (let i = 0; i < 15; i++) {
      // Shuffle the words slightly differently each loop iteration
      const shuffledBlock = [...topWeakWords].sort(() => 0.5 - Math.random());
      drillWords = [...drillWords, ...shuffledBlock];
    }
    
    const customParagraph = drillWords.join(" ");
    
    sessionStorage.setItem('customTypingDrill', customParagraph.trim());
    router.push('/typing/custom'); 
  };
  // =======================================================================

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];
    if (statusFilter !== 'All Status') result = result.filter((r) => r.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.passage.toLowerCase().includes(q) || r.exam.toLowerCase().includes(q));
    }
    if (dateRange === 'Last 7 Days') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((r) => r.createdAt >= cutoff);
    } else if (dateRange === 'Last 30 Days') {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      result = result.filter((r) => r.createdAt >= cutoff);
    }
    if (sortOrder === 'Date (Newest First)') result.sort((a, b) => b.createdAt - a.createdAt);
    else if (sortOrder === 'Date (Oldest First)') result.sort((a, b) => a.createdAt - b.createdAt);
    else if (sortOrder === 'Highest WPM') result.sort((a, b) => b.speed - a.speed);
    else if (sortOrder === 'Lowest WPM') result.sort((a, b) => a.speed - b.speed);
    
    return result;
  }, [allRecords, statusFilter, searchQuery, dateRange, sortOrder]);

  const { chartData, chartAvgWpm, chartAvgAccuracy } = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => a.createdAt - b.createdAt);
    const last20 = sorted.slice(-20);
    let totalWpm = 0, totalAcc = 0;
    const mappedData = last20.map(r => {
      totalWpm += r.speed; totalAcc += r.accuracy;
      return { id: r.id, name: r.passage, date: r.date, time: r.time, wpm: r.speed, accuracy: r.accuracy };
    });
    return { 
      chartData: mappedData, 
      chartAvgWpm: mappedData.length > 0 ? Math.round(totalWpm / mappedData.length) : 0, 
      chartAvgAccuracy: mappedData.length > 0 ? Math.round(totalAcc / mappedData.length) : 0 
    };
  }, [filteredRecords]);

  const clearFilters = () => {
    setStatusFilter('All Status'); setSortOrder('Date (Newest First)'); setDateRange('All Time'); setSearchQuery('');
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-200 rounded-xl shadow-xl">
          <p className="text-sm font-black text-slate-800 mb-1">{data.name}</p>
          <p className="text-xs font-bold text-slate-600">{data.date}</p>
          <p className="text-xs font-medium text-slate-400 mb-3">{data.time}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm font-bold">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-700">{entry.name}:</span>
              <span style={{ color: entry.color }}>{entry.value} {entry.name === 'Accuracy' ? '%' : 'WPM'}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Stats & Odometer Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute top-5 right-5 bg-red-50 text-red-500 p-3 rounded-2xl"><Target size={32} strokeWidth={2.5} /></div>
          <span className="text-4xl font-black text-slate-800 mb-2 mt-2">{totalTests}</span>
          <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Total Tests Taken</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute top-5 right-5 bg-blue-50 text-blue-600 p-3 rounded-2xl"><TrendingUp size={32} strokeWidth={2.5} /></div>
          <span className="text-4xl font-black text-slate-800 mb-2 mt-2">{qualifiedTests}</span>
          <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Tests Qualified</span>
        </div>
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg relative">
          <span className="text-sm font-bold tracking-wider text-slate-300 uppercase absolute top-4 left-6">Avg Speed</span>
          <div className="relative w-40 h-24 mt-4 flex flex-col items-center justify-end">
            <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#44BCFF" strokeWidth="8" strokeLinecap="round" strokeDasharray={semiCircleLength} strokeDashoffset={gaugeOffset} className="transition-all duration-1000 ease-out"/>
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className="text-3xl font-black text-white leading-none">{avgWpm}</span>
              <span className="text-xs font-bold text-[#44BCFF]">WPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* TARGETED WEAKNESS TRAINING BANNER */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex-1 z-10">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={24} className="text-rose-500" />
            <h3 className="text-2xl font-black text-slate-900" style={{fontFamily: 'var(--font-oswald)'}}>Targeted Weakness Analysis</h3>
          </div>
          <p className="text-slate-600 font-medium mb-5 max-w-2xl">
            We have analyzed your past tests and identified the exact words you mistype most frequently. Take a custom drill designed exclusively to eliminate your bad habits.
          </p>
          <div className="flex flex-wrap gap-2">
            {topWeakWords.length > 0 ? (
              topWeakWords.map((word, idx) => (
                <span key={idx} className="bg-white border border-rose-200 text-rose-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">{word}</span>
              ))
            ) : (
              <span className="text-sm font-medium text-slate-500 italic bg-white/50 px-3 py-1 rounded-lg">Complete a few tests to generate your weakness analysis...</span>
            )}
          </div>
        </div>
        <button onClick={handleStartCustomDrill} disabled={topWeakWords.length === 0} className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-rose-500/30 transition-all hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none z-10">
          <Play fill="currentColor" size={18} /> Start Custom Drill
        </button>
      </div>

      {/* PREMIUM INTERACTIVE CHARTS */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#5b58f5]" /> WPM Progress
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Last 20 Tests</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5b58f5" stopOpacity={0.3}/><stop offset="95%" stopColor="#5b58f5" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="id" tickFormatter={(id) => chartData.find(d => d.id === id)?.date || ''} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, fill: 'transparent' }} />
                  <ReferenceLine y={chartAvgWpm} stroke="#94a3b8" strokeDasharray="4 4" label={{ position: 'top', value: `Avg: ${chartAvgWpm} WPM`, fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="wpm" name="Speed" stroke="#5b58f5" strokeWidth={3} fillOpacity={1} fill="url(#colorWpm)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Target size={20} className="text-emerald-500" /> Accuracy Breakdown
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Last 20 Tests</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="id" tickFormatter={(id) => chartData.find(d => d.id === id)?.date || ''} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{fill: '#f1f5f9'}} />
                  <ReferenceLine y={chartAvgAccuracy} stroke="#10b981" strokeOpacity={0.6} strokeDasharray="4 4" label={{ position: 'top', value: `Avg: ${chartAvgAccuracy}%`, fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                  <Bar dataKey="accuracy" name="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Modern Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap lg:flex-nowrap items-end gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Filter size={16} className="text-slate-900" /> Filter by Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#5b58f5] focus:ring-1 focus:ring-[#5b58f5] bg-white">
            <option>All Status</option><option>Qualified</option><option>Needs Work</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><ArrowUpDown size={16} className="text-slate-900" /> Sort by</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#5b58f5] focus:ring-1 focus:ring-[#5b58f5] bg-white">
            <option>Date (Newest First)</option><option>Date (Oldest First)</option><option>Highest WPM</option><option>Lowest WPM</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Calendar size={16} className="text-slate-900" /> Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-[#5b58f5] focus:ring-1 focus:ring-[#5b58f5] bg-white">
            <option>All Time</option><option>Last 7 Days</option><option>Last 30 Days</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Search size={16} className="text-slate-900" /> Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Search by exam or test..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 pl-9 text-sm outline-none focus:border-[#5b58f5] focus:ring-1 focus:ring-[#5b58f5]" />
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button className="bg-[#5b58f5] hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors flex-1 lg:flex-none whitespace-nowrap"><Filter size={16} /> Apply Filters</button>
          <button onClick={clearFilters} className="bg-white border border-[#5b58f5] text-[#5b58f5] hover:bg-indigo-50 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors flex-1 lg:flex-none whitespace-nowrap"><X size={16} /> Clear Filters</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                <th className="px-5 py-4">#</th><th className="px-5 py-4">Exam</th><th className="px-5 py-4">Test</th><th className="px-5 py-4">Speed (WPM)</th><th className="px-5 py-4">Accuracy</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th><th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-600">{index + 1}</td>
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-[#5b58f5]"></div><div className="text-sm font-semibold text-slate-800">{row.exam}</div></div></td>
                  <td className="px-5 py-4 text-sm text-slate-600">{row.passage}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800"><span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">{row.speed}</span></td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{row.accuracy}%</td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${row.status === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{row.status}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600"><div className="font-medium">{row.date}</div><div className="text-xs text-slate-400">{row.time}</div></td>
                  <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setSelectedRecord(row)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#5b58f5] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors"><Eye size={14} /> View</button>
                    <button onClick={() => onDelete(row.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-red-100 transition-colors"><X size={14} /> Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500 font-medium">No typing records found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-8">
          <div className="w-full max-w-[1300px] h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col overscroll-contain">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-white shrink-0 shadow-sm z-10">
              <div className="flex flex-col"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Test History Details</span><h3 className="text-xl font-bold text-slate-900">{selectedRecord.passage} - {selectedRecord.date}</h3></div>
              <button onClick={() => setSelectedRecord(null)} className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"><X size={18} /> Close Details</button>
            </div>
            <ReactLenis className="flex-1 overflow-y-auto w-full custom-scrollbar" options={{ lerp: 0.08, smoothWheel: true }}>
              <div className="min-h-max pb-8 relative will-change-transform">
                <TypingResult 
                  result={{
                    testName: selectedRecord.passage, wpm: selectedRecord.raw.grossWpm || 0, netWpm: selectedRecord.raw.netWpm || 0, accuracy: selectedRecord.raw.accuracy || 0, marks: selectedRecord.raw.score || 0, keyStrokesByCandidate: selectedRecord.raw.keyStrokesByCandidate || 0, fullMistakes: selectedRecord.raw.fullMistakes || 0, totalErrors: selectedRecord.raw.totalErrors || 0, errorPercentage: selectedRecord.raw.errorPercentage || 0, backspacePresses: selectedRecord.raw.backspacePresses || 0, timeTakenInSeconds: selectedRecord.raw.timeTakenInSeconds || 0, qualified: selectedRecord.status === 'Qualified', originalText: selectedRecord.raw.originalText, typedText: selectedRecord.raw.typedText,
                  }}
                  onRestart={() => setSelectedRecord(null)} onTakeAnother={() => setSelectedRecord(null)} isHistoryView={true} 
                />
              </div>
            </ReactLenis>
          </div>
        </div>
      )}
    </div>
  );
}