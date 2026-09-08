'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HistoryEntry } from '@/services/userService';
import { Eye, Filter, ArrowUpDown, Calendar, Search, X, Hash, Award, Activity } from 'lucide-react';
import { ReactLenis } from '@studio-freight/react-lenis';

import EnglishResult from '@/components/features/english/EnglishResult';

type DashboardRecord = {
  id: string;
  exam: string;
  passage: string;
  score: number;
  accuracy: number;
  points: number; // NEW
  date: string;
  time: string;
  createdAt: number;
  raw: HistoryEntry;
};

interface EnglishDashboardProps {
  history: HistoryEntry[];
  onDelete: (id: string) => Promise<void>;
}

export default function EnglishDashboard({ history, onDelete }: EnglishDashboardProps) {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Date (Newest First)');
  const [dateRange, setDateRange] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(null);

  useEffect(() => {
    if (selectedRecord) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedRecord]);

  // 1. Map raw history to typed records including POINTS calculation
  const allRecords = useMemo<DashboardRecord[]>(() => {
    return history.map((item) => {
      const score = Number(item.score ?? 0);
      
      // Calculate points (Fallback to calculating from score if old test)
      const points = item.correctAnswers !== undefined 
        ? item.correctAnswers 
        : Math.round((score / 100) * (item.totalQuestions || 0));

      return {
        id: item.id,
        exam: item.category || 'English',
        passage: item.name || 'English Quiz',
        score: score,
        accuracy: Number(item.accuracy ?? score),
        points: points,
        date: item.date || 'Unknown date',
        time: item.time || 'Unknown time',
        createdAt: item.createdAt || 0,
        raw: item,
      };
    });
  }, [history]);

  // 2. Calculate Specific Stats
  const totalTests = allRecords.length;
  const totalAwardPoints = allRecords.reduce((acc, curr) => acc + curr.points, 0);
  const avgScore = totalTests > 0 
    ? (allRecords.reduce((acc, curr) => acc + curr.score, 0) / totalTests).toFixed(1) 
    : '0';

  // 3. Apply Filters and Sorting
  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => 
        r.passage.toLowerCase().includes(q) || 
        r.exam.toLowerCase().includes(q)
      );
    }

    if (dateRange === 'Last 7 Days') {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((r) => r.createdAt >= cutoff);
    } else if (dateRange === 'Last 30 Days') {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      result = result.filter((r) => r.createdAt >= cutoff);
    }

    if (sortOrder === 'Date (Newest First)') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortOrder === 'Date (Oldest First)') {
      result.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortOrder === 'Highest Score') {
      result.sort((a, b) => b.score - a.score);
    } else if (sortOrder === 'Lowest Score') {
      result.sort((a, b) => a.score - b.score);
    }

    return result;
  }, [allRecords, statusFilter, searchQuery, dateRange, sortOrder]);

  const clearFilters = () => {
    setStatusFilter('All Status');
    setSortOrder('Date (Newest First)');
    setDateRange('All Time');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Brutalist Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#AEE8F5] border-[3px] border-black rounded-[2rem] p-8 flex flex-col justify-center relative">
          <div className="absolute top-6 right-6 bg-white border-2 border-black text-black p-3 rounded-full"><Hash size={24} strokeWidth={3} /></div>
          <span className="text-5xl font-black text-black mb-2 mt-2">{totalTests}</span>
          <span className="text-sm font-black tracking-wider text-black uppercase">Total Tests</span>
        </div>
        <div className="bg-[#C4F2B0] border-[3px] border-black rounded-[2rem] p-8 flex flex-col justify-center relative">
          <div className="absolute top-6 right-6 bg-white border-2 border-black text-black p-3 rounded-full"><Award size={24} strokeWidth={3} /></div>
          <span className="text-5xl font-black text-black mb-2 mt-2 flex items-center gap-3">
            <img src="/media/award-point.svg" alt="Points" className="w-10 h-10 drop-shadow-md" /> {totalAwardPoints}
          </span>
          <span className="text-sm font-black tracking-wider text-black uppercase">Total Points</span>
        </div>
        <div className="bg-[#FF8787] border-[3px] border-black rounded-[2rem] p-8 flex flex-col justify-center relative">
          <div className="absolute top-6 right-6 bg-white border-2 border-black text-black p-3 rounded-full"><Activity size={24} strokeWidth={3} /></div>
          <span className="text-5xl font-black text-black mb-2 mt-2">{avgScore}%</span>
          <span className="text-sm font-black tracking-wider text-black uppercase">Avg Score</span>
        </div>
      </div>

      {/* Brutalist Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border-[3px] border-black flex flex-wrap lg:flex-nowrap items-end gap-5">
        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label className="text-sm font-black text-black flex items-center gap-2"><ArrowUpDown size={18} strokeWidth={2.5} /> Sort by</label>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer"
          >
            <option>Date (Newest First)</option>
            <option>Date (Oldest First)</option>
            <option>Highest Score</option>
            <option>Lowest Score</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label className="text-sm font-black text-black flex items-center gap-2"><Calendar size={18} strokeWidth={2.5} /> Date Range</label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer"
          >
            <option>All Time</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-sm font-black text-black flex items-center gap-2"><Search size={18} strokeWidth={2.5} /> Search</label>
          <div className="relative">
            <Search size={18} strokeWidth={2.5} className="absolute left-3 top-3 text-black" />
            <input 
              type="text" 
              placeholder="Search by exam or test..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-[2.5px] border-black rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button 
            onClick={clearFilters}
            className="bg-white border-[3px] border-black hover:bg-slate-100 text-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap"
          >
            <X size={18} strokeWidth={3} /> Clear
          </button>
        </div>
      </div>

      {/* Brutalist Table */}
      <div className="bg-white border-[3px] border-black rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[3px] border-black bg-[#D4FF2A] text-sm font-black uppercase tracking-wider text-black">
                <th className="px-6 py-5">#</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Quiz</th>
                <th className="px-6 py-5">Score</th>
                <th className="px-6 py-5">Accuracy</th>
                <th className="px-6 py-5">Points</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? filteredRecords.map((row, index) => (
                <tr key={row.id} className="border-b-[2px] border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-black text-black">{index + 1}</td>
                  <td className="px-6 py-5 font-black text-black">{row.exam}</td>
                  <td className="px-6 py-5 text-sm font-black text-black">{row.passage}</td>
                  <td className="px-6 py-5 text-sm font-black text-black">
                    <span className="inline-flex items-center rounded-full bg-[#AEE8F5] border-2 border-black px-3 py-1">{row.score}%</span>
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-black">{row.accuracy}%</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 font-black text-black bg-[#C4F2B0] border-2 border-black px-3 py-1 rounded-full">
                      <img src="/media/award-point.svg" alt="Points" className="w-5 h-5 drop-shadow-sm" /> {row.points}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-black"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 mt-0.5">{row.time}</div></td>
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                    <button
                      onClick={() => setSelectedRecord(row)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors"
                    >
                      <Eye size={16} strokeWidth={2.5} /> View
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-black text-black px-4 py-2 text-xs font-black hover:bg-[#FF8787] transition-colors"
                    >
                      <X size={16} strokeWidth={3} /> Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-black font-black text-lg">
                    No English records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL SCREEN SMOOTH-SCROLLING MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-8">
          <div className="w-full max-w-[1300px] h-[90vh] bg-[#FDFBF7] border-[4px] border-black rounded-[2rem] overflow-hidden relative flex flex-col overscroll-contain">
            
            <div className="flex justify-between items-center px-8 py-5 border-b-[3px] border-black bg-white shrink-0 z-10">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Test History Details</span>
                <h3 className="text-2xl font-black text-black font-serif">{selectedRecord.passage} - {selectedRecord.date}</h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="bg-white border-[3px] border-black hover:bg-[#FF8787] text-black px-6 py-2.5 rounded-full font-black flex items-center gap-2 hover:-translate-y-1 transition-all"
              >
                <X size={20} strokeWidth={3} /> Close Details
              </button>
            </div>

            <ReactLenis 
              className="flex-1 overflow-y-auto w-full custom-scrollbar" 
              options={{ lerp: 0.08, smoothWheel: true }}
            >
              <div className="min-h-max pb-8 relative will-change-transform">
                <EnglishResult 
                  category={selectedRecord.raw.category || 'English'}
                  passPercentage={selectedRecord.accuracy}
                  totalQuestions={selectedRecord.raw.totalQuestions || 0}
                  answeredCount={(selectedRecord.raw.correctAnswers || 0) + (selectedRecord.raw.incorrectAnswers || 0)}
                  questionsState={selectedRecord.raw.questionsState || []}
                  onRetake={() => setSelectedRecord(null)}
                  isHistoryView={true} 
                />
              </div>
            </ReactLenis>

          </div>
        </div>
      )}
    </div>
  );
}