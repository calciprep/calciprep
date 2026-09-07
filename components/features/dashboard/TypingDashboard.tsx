'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HistoryEntry } from '@/services/userService';
import { Eye, Filter, ArrowUpDown, Calendar, Search, X, TrendingUp, Target, BrainCircuit, Play, Activity } from 'lucide-react';
import { ReactLenis } from '@studio-freight/react-lenis';
import TypingResult from '@/components/features/typing/TypingResult';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

// =======================================================================
// EXAM CONFIGURATION "BRAIN"
// =======================================================================
const getExamConfig = (examName: string) => {
  const name = examName.toLowerCase();
  
  // SSC CGL & CHSL Logic (Error % Focused, Standard Net WPM)
  if (name.includes('cgl') || name.includes('chsl')) {
    return { 
      metric: 'ERROR', 
      passThreshold: name.includes('chsl') ? 7 : 20, 
      primaryLabel: 'Error %', 
      secondaryLabel: 'Speed (WPM)',
      primaryColor: '#f43f5e', // Rose
      secondaryColor: '#5b58f5' // Indigo
    };
  }
  
  // Delhi Police HCM Logic (Net WPM Focused, Gross - Errors)
  return { 
    metric: 'WPM', 
    passThreshold: 30, 
    primaryLabel: 'Net WPM', 
    secondaryLabel: 'Accuracy %',
    primaryColor: '#44BCFF', // Light Blue
    secondaryColor: '#10b981' // Emerald
  }; 
};

type DashboardRecord = {
  id: string;
  exam: string;
  passage: string;
  speed: number;
  grossSpeed: number;
  accuracy: number;
  errorPercentage: number;
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
  
  const [activeExamTab, setActiveExamTab] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Date (Newest First)');
  const [dateRange, setDateRange] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(null);

  // Extract unique exams (No "All Exams" tab)
  const availableExams = useMemo(() => {
    const exams = new Set(history.map(h => h.category || 'Typing Test'));
    return Array.from(exams);
  }, [history]);

  useEffect(() => {
    if (availableExams.length > 0 && !availableExams.includes(activeExamTab)) {
      setActiveExamTab(availableExams[0]);
    }
  }, [availableExams, activeExamTab]);

  useEffect(() => {
    if (selectedRecord) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedRecord]);

  // =======================================================================
  // SMART RECALCULATION ENGINE (Mirrors Result Page Logic perfectly!)
  // =======================================================================
  const allRecords = useMemo<DashboardRecord[]>(() => {
    return history.map((item) => {
      const examName = item.category || 'Typing Test';
      const config = getExamConfig(examName);
      
      const origWords = item.originalText ? item.originalText.trim().split(/\s+/).filter(Boolean) : [];
      const typedWords = item.typedText ? item.typedText.trim().split(/\s+/).filter(Boolean) : [];
      
      let calculatedErrors = 0;
      let oIdx = 0, tIdx = 0;
      
      if (origWords.length > 0 && typedWords.length > 0) {
        while(tIdx < typedWords.length && oIdx < origWords.length) {
          if (typedWords[tIdx] === origWords[oIdx]) {
            tIdx++; oIdx++;
          } else {
            calculatedErrors++;
            let realigned = false;
            for (let lookahead = 1; lookahead <= 5; lookahead++) {
              if (oIdx + lookahead < origWords.length && typedWords[tIdx] === origWords[oIdx + lookahead]) {
                oIdx += lookahead; realigned = true; break;
              }
              if (tIdx + lookahead < typedWords.length && typedWords[tIdx + lookahead] === origWords[oIdx]) {
                tIdx += lookahead; realigned = true; break;
              }
            }
            if (!realigned) { tIdx++; oIdx++; }
          }
        }
        
        // Always penalize extra typed words
        if (tIdx < typedWords.length) calculatedErrors += (typedWords.length - tIdx);
        
        // ONLY CGL/CHSL penalizes un-typed words at the end (Master Passage Error)
        if (config.metric === 'ERROR' && oIdx < origWords.length) {
          calculatedErrors += (origWords.length - oIdx);
        }
      }
      
      const totalPenalty = (item.originalText && item.typedText) ? calculatedErrors : Number(item.totalErrors ?? item.fullMistakes ?? 0);
      const masterWords = origWords.length > 0 ? origWords.length : 352;
      
      // FIXED: Older database saves WPM as `item.wpm`, newer saves as `item.grossWpm`
      const grossWpm = Number((item as any).wpm ?? item.grossWpm ?? 0);
      const timeInMins = (item.timeTakenInSeconds || 900) / 60;

      let netWpm = 0;
      let errorPercentage = 0;
      let isQualified = false;
      
      if (config.metric === 'ERROR') {
        // CGL / CHSL: Standard Formula (Gross - Penalty/Time) and Master Passage Error %
        netWpm = Math.max(0, grossWpm - (totalPenalty / timeInMins));
        errorPercentage = masterWords > 0 ? (totalPenalty / masterWords) * 100 : 0;
        isQualified = errorPercentage <= config.passThreshold;
      } else {
        // DP HCM: Strict Formula (Gross - Total Errors)
        netWpm = Math.max(0, grossWpm - totalPenalty);
        errorPercentage = masterWords > 0 ? (totalPenalty / masterWords) * 100 : Number(item.errorPercentage || 0);
        isQualified = netWpm >= config.passThreshold;
      }
      
      const accuracy = grossWpm > 0 ? Math.max(0, (netWpm / grossWpm) * 100) : 0;

      return {
        id: item.id,
        exam: examName,
        passage: item.name || 'Practice',
        speed: Number(netWpm.toFixed(1)),
        grossSpeed: Number(grossWpm.toFixed(1)),
        accuracy: Number(accuracy.toFixed(1)),
        errorPercentage: Number(errorPercentage.toFixed(2)),
        status: isQualified ? 'Qualified' : 'Needs Work',
        date: item.date || 'Unknown date',
        time: item.time || 'Unknown time',
        createdAt: item.createdAt || 0,
        raw: item,
      };
    });
  }, [history]);

  // Filters (Only showing records for the active tab)
  const filteredRecords = useMemo(() => {
    if (!activeExamTab) return [];
    let result = allRecords.filter(r => r.exam === activeExamTab);
    
    if (statusFilter !== 'All Status') result = result.filter((r) => r.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.passage.toLowerCase().includes(q));
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
  }, [allRecords, activeExamTab, statusFilter, searchQuery, dateRange, sortOrder]);

  const activeConfig = getExamConfig(activeExamTab || '');

  const totalTests = filteredRecords.length;
  const qualifiedTests = filteredRecords.filter((r) => r.status === 'Qualified').length;
  
  // DYNAMIC GAUGE
  let gaugeValue = '0';
  let gaugePercentage = 0;
  
  if (totalTests > 0) {
    if (activeConfig.metric === 'ERROR') {
      const avgErr = filteredRecords.reduce((acc, curr) => acc + curr.errorPercentage, 0) / totalTests;
      gaugeValue = avgErr.toFixed(2);
      gaugePercentage = Math.max(0, 100 - (avgErr * 4)); 
    } else {
      const avgWpm = filteredRecords.reduce((acc, curr) => acc + curr.speed, 0) / totalTests;
      gaugeValue = avgWpm.toFixed(1);
      gaugePercentage = Math.min((avgWpm / 100) * 100, 100);
    }
  }

  const semiCircleLength = 125.66; 
  const gaugeOffset = semiCircleLength - (semiCircleLength * gaugePercentage) / 100;

  // WEAK WORDS EXTRACTION (Upgraded with Greedy Lookahead Aligner)
  const topWeakWords = useMemo(() => {
    const wordCounts: Record<string, number> = {};
    const stopWords = new Set(['the', 'and', 'that', 'was', 'but', 'they', 'have', 'which', 'our', 'their', 'are', 'this', 'with', 'from', 'what', 'were', 'when', 'your', 'said', 'there', 'will', 'would', 'could', 'should', 'about', 'these', 'them', 'then', 'than', 'into', 'only', 'other', 'some', 'such', 'very', 'been', 'much', 'many', 'also', 'more', 'like', 'find', 'because']);

    // 1. Cloud Text Sanitizer to strip invisible characters
    const normalizeText = (text: string) => {
      return text
        .replace(/[\u2018\u2019]/g, "'") 
        .replace(/[\u201C\u201D]/g, '"') 
        .replace(/[\u2013\u2014]/g, '-') 
        .replace(/[\u200B-\u200D\uFEFF]/g, '') 
        .replace(/\u00A0/g, ' ') 
        .trim();
    };

    filteredRecords.forEach(record => {
      if (!record.raw.originalText || !record.raw.typedText) return;
      
      const cleanOrig = normalizeText(record.raw.originalText);
      const cleanTyped = normalizeText(record.raw.typedText);
      
      const originalWords = cleanOrig.split(/\s+/).filter(Boolean);
      const typedWords = cleanTyped.split(/\s+/).filter(Boolean);
      
      let oIdx = 0;
      let tIdx = 0;
      
      // 2. Greedy Lookahead Aligner to prevent cascading false-positives
      while(tIdx < typedWords.length && oIdx < originalWords.length) {
        if (typedWords[tIdx] === originalWords[oIdx]) {
          tIdx++;
          oIdx++;
        } else {
          // It's a true mistake! Extract the original word, clean it, and log it.
          const cleanWord = originalWords[oIdx].replace(/[^a-zA-Z]/g, '').toLowerCase();
          if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
            wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
          }
          
          // Re-align the array to prevent marking the rest of the passage as an error
          let realigned = false;
          for (let lookahead = 1; lookahead <= 5; lookahead++) {
            if (oIdx + lookahead < originalWords.length && typedWords[tIdx] === originalWords[oIdx + lookahead]) {
              oIdx += lookahead; realigned = true; break;
            }
            if (tIdx + lookahead < typedWords.length && typedWords[tIdx + lookahead] === originalWords[oIdx]) {
              tIdx += lookahead; realigned = true; break;
            }
          }
          if (!realigned) { tIdx++; oIdx++; }
        }
      }
    });
    
    // Sort by frequency and take the top 15 true weaknesses
    return Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 15).map(entry => entry[0]);
  }, [filteredRecords]);
  
  const handleStartCustomDrill = () => {
    if (topWeakWords.length === 0) return;
    let drillWords: string[] = [];
    for (let i = 0; i < 15; i++) {
      const shuffledBlock = [...topWeakWords].sort(() => 0.5 - Math.random());
      drillWords = [...drillWords, ...shuffledBlock];
    }
    sessionStorage.setItem('customTypingDrill', drillWords.join(" ").trim());
    router.push('/typing/custom'); 
  };

  // CHART DATA MAPPING
  const { chartData, chartAvgPrimary, chartAvgSecondary } = useMemo(() => {
    const sorted = [...filteredRecords].sort((a, b) => a.createdAt - b.createdAt);
    const last20 = sorted.slice(-20);
    let totalPrimary = 0, totalSecondary = 0;
    
    const mappedData = last20.map(r => {
      const primaryVal = activeConfig.metric === 'ERROR' ? r.errorPercentage : r.speed;
      const secondaryVal = activeConfig.metric === 'ERROR' ? r.speed : r.accuracy;
      totalPrimary += primaryVal; 
      totalSecondary += secondaryVal;
      return { 
        id: r.id, 
        name: r.passage, 
        date: r.date, 
        time: r.time, 
        primaryValue: primaryVal, 
        secondaryValue: secondaryVal 
      };
    });
    return { 
      chartData: mappedData, 
      chartAvgPrimary: mappedData.length > 0 ? Number((totalPrimary / mappedData.length).toFixed(1)) : 0, 
      chartAvgSecondary: mappedData.length > 0 ? Number((totalSecondary / mappedData.length).toFixed(1)) : 0 
    };
  }, [filteredRecords, activeConfig]);

  const clearFilters = () => {
    setStatusFilter('All Status'); setSortOrder('Date (Newest First)'); setDateRange('All Time'); setSearchQuery('');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 border border-slate-200 rounded-xl shadow-xl">
          <p className="text-sm font-black text-slate-800 mb-1">{data.name}</p>
          <p className="text-xs font-bold text-slate-600">{data.date} • {data.time}</p>
          <div className="mt-3 space-y-1">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((entry: any, index: number) => {
              const isPrimary = entry.dataKey === 'primaryValue';
              const suffix = isPrimary 
                ? (activeConfig.metric === 'ERROR' ? '%' : ' WPM') 
                : (activeConfig.metric === 'ERROR' ? ' WPM' : '%');
                
              return (
                <div key={index} className="flex items-center gap-2 text-sm font-bold">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-slate-700">{entry.name}:</span>
                  <span style={{ color: entry.color }}>{entry.value}{suffix}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!activeExamTab) {
    return <div className="text-center py-12 text-slate-500 font-medium">No typing history found. Take a test to see your dashboard!</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* EXAM TABS */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-max overflow-x-auto">
        {availableExams.map((examTab) => (
          <button
            key={examTab}
            onClick={() => {
              setActiveExamTab(examTab);
              clearFilters();
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap
              ${activeExamTab === examTab ? 'bg-[#5b58f5] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {examTab}
          </button>
        ))}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute top-5 right-5 bg-slate-50 text-slate-500 p-3 rounded-2xl"><Activity size={32} strokeWidth={2.5} /></div>
          <span className="text-4xl font-black text-slate-800 mb-2 mt-2">{totalTests}</span>
          <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Tests Taken</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm relative overflow-hidden">
          <div className="absolute top-5 right-5 bg-emerald-50 text-emerald-500 p-3 rounded-2xl"><Target size={32} strokeWidth={2.5} /></div>
          <span className="text-4xl font-black text-slate-800 mb-2 mt-2">{qualifiedTests}</span>
          <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">Tests Qualified</span>
        </div>
        
        {/* DYNAMIC GAUGE */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg relative">
          <span className="text-sm font-bold tracking-wider text-slate-300 uppercase absolute top-4 left-6">Avg {activeConfig.primaryLabel}</span>
          <div className="relative w-40 h-24 mt-4 flex flex-col items-center justify-end">
            <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-md">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={activeConfig.primaryColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={semiCircleLength} strokeDashoffset={gaugeOffset} className="transition-all duration-1000 ease-out"/>
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center">
              <span className="text-3xl font-black text-white leading-none">{gaugeValue}</span>
              <span className="text-xs font-bold text-slate-400 mt-1">{activeConfig.metric === 'ERROR' ? '%' : 'WPM'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WEAKNESS BANNER */}
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

      {/* DYNAMIC CHARTS */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Primary Metric Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} color={activeConfig.primaryColor} /> {activeConfig.primaryLabel} Trend
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Last 20 Tests</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={activeConfig.primaryColor} stopOpacity={0.3}/><stop offset="95%" stopColor={activeConfig.primaryColor} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="id" tickFormatter={(id) => chartData.find(d => d.id === id)?.date || ''} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, fill: 'transparent' }} />
                  <ReferenceLine y={chartAvgPrimary} stroke="#94a3b8" strokeDasharray="4 4" label={{ position: 'top', value: `Avg: ${chartAvgPrimary}`, fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  
                  {/* Show cutoff line ONLY if it's CGL (Error based) */}
                  {activeConfig.metric === 'ERROR' && (
                    <ReferenceLine y={activeConfig.passThreshold} stroke="#f59e0b" strokeOpacity={0.5} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Qualifying Cutoff', fill: '#f59e0b', fontSize: 10 }} />
                  )}
                  
                  <Area type="monotone" dataKey="primaryValue" name={activeConfig.primaryLabel} stroke={activeConfig.primaryColor} strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Metric Chart (Speed for CGL, Accuracy for HCM) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Target size={20} color={activeConfig.secondaryColor} /> {activeConfig.secondaryLabel} Breakdown
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Last 20 Tests</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="id" tickFormatter={(id) => chartData.find(d => d.id === id)?.date || ''} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} minTickGap={30} />
                  
                  {/* Dynamic YAxis Domain */}
                  <YAxis domain={activeConfig.metric === 'WPM' ? [0, 100] : ['auto', 'auto']} tick={{fontSize: 12, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                  
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{fill: '#f1f5f9'}} />
                  <ReferenceLine y={chartAvgSecondary} stroke={activeConfig.secondaryColor} strokeOpacity={0.6} strokeDasharray="4 4" label={{ position: 'top', value: `Avg: ${chartAvgSecondary}`, fill: activeConfig.secondaryColor, fontSize: 12, fontWeight: 'bold' }} />
                  <Bar dataKey="secondaryValue" name={activeConfig.secondaryLabel} fill={activeConfig.secondaryColor} radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
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
            <input type="text" placeholder="Search test name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 pl-9 text-sm outline-none focus:border-[#5b58f5] focus:ring-1 focus:ring-[#5b58f5]" />
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button onClick={clearFilters} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors flex-1 lg:flex-none whitespace-nowrap"><X size={16} /> Clear</button>
        </div>
      </div>

      {/* DYNAMIC TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Test Name</th>
                <th className="px-5 py-4 text-indigo-600">Speed (WPM)</th>
                
                {/* Dynamically swap column Header */}
                {activeConfig.metric === 'ERROR' ? (
                  <th className="px-5 py-4 text-rose-600">Error %</th>
                ) : (
                  <th className="px-5 py-4 text-emerald-600">Accuracy</th>
                )}
                
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-600">{index + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeConfig.primaryColor }}></div>
                      <div className="text-sm font-semibold text-slate-800">{row.passage}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1">{row.speed}</span>
                  </td>
                  
                  {/* Dynamic Metric Data */}
                  {activeConfig.metric === 'ERROR' ? (
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">
                      <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 px-2.5 py-1">{row.errorPercentage}%</span>
                    </td>
                  ) : (
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{row.accuracy}%</td>
                  )}
                  
                  <td className="px-5 py-4"><span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${row.status === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{row.status}</span></td>
                  <td className="px-5 py-4 text-sm text-slate-600"><div className="font-medium">{row.date}</div><div className="text-xs text-slate-400">{row.time}</div></td>
                  <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => setSelectedRecord(row)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#5b58f5] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors"><Eye size={14} /> View</button>
                    <button onClick={() => onDelete(row.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-red-100 transition-colors"><X size={14} /> Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 font-medium">No records found for this exam.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Details Modal */}
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
                    testName: selectedRecord.passage, 
                    wpm: selectedRecord.grossSpeed || 0, 
                    netWpm: selectedRecord.speed, 
                    errorPercentage: selectedRecord.errorPercentage,
                    accuracy: selectedRecord.accuracy,
                    marks: selectedRecord.raw.score || 0, 
                    keyStrokesByCandidate: selectedRecord.raw.keyStrokesByCandidate || 0, 
                    fullMistakes: selectedRecord.raw.fullMistakes || 0, 
                    totalErrors: selectedRecord.raw.totalErrors || 0, 
                    backspacePresses: selectedRecord.raw.backspacePresses || 0, 
                    timeTakenInSeconds: selectedRecord.raw.timeTakenInSeconds || 0, 
                    qualified: selectedRecord.status === 'Qualified', 
                    originalText: selectedRecord.raw.originalText, 
                    typedText: selectedRecord.raw.typedText,
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