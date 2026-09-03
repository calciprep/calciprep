'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HistoryEntry } from '@/services/userService';
import { Eye, Filter, ArrowUpDown, Calendar, Search, X } from 'lucide-react';

// Lenis import for local smooth modal scrolling
import { ReactLenis } from '@studio-freight/react-lenis';

import TypingResult from '@/components/features/typing/TypingResult';

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
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Date (Newest First)');
  const [dateRange, setDateRange] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(null);

  // 1. Natural Body Scroll Lock (Replaces lenis.stop() to prevent animation lag)
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

  // 2. Map raw history to typed records
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

  // 3. Calculate Specific Stats
  const totalTests = allRecords.length;
  const qualifiedTests = allRecords.filter((r) => r.status === 'Qualified').length;
  const avgWpm = totalTests > 0 
    ? (allRecords.reduce((acc, curr) => acc + curr.speed, 0) / totalTests).toFixed(1) 
    : '0';

  // 4. Apply Filters and Sorting
  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (statusFilter !== 'All Status') {
      result = result.filter((r) => r.status === statusFilter);
    }

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
    } else if (sortOrder === 'Highest WPM') {
      result.sort((a, b) => b.speed - a.speed);
    } else if (sortOrder === 'Lowest WPM') {
      result.sort((a, b) => a.speed - b.speed);
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Stats Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-[#f8faff] border border-blue-100 rounded-xl p-5 flex flex-col items-center justify-center min-w-[140px] shadow-sm">
          <span className="text-3xl font-bold text-blue-600 mb-1">{totalTests}</span>
          <span className="text-sm font-medium text-slate-500">Total Tests</span>
        </div>
        <div className="bg-[#f8faff] border border-blue-100 rounded-xl p-5 flex flex-col items-center justify-center min-w-[140px] shadow-sm">
          <span className="text-3xl font-bold text-blue-600 mb-1">{qualifiedTests}</span>
          <span className="text-sm font-medium text-slate-500">Qualified</span>
        </div>
        <div className="bg-[#f8faff] border border-blue-100 rounded-xl p-5 flex flex-col items-center justify-center min-w-[140px] shadow-sm">
          <span className="text-3xl font-bold text-blue-600 mb-1">{avgWpm}</span>
          <span className="text-sm font-medium text-slate-500">Avg WPM</span>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap lg:flex-nowrap items-end gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Filter size={16} className="text-slate-900" /> Filter by Status
          </label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option>All Status</option>
            <option>Qualified</option>
            <option>Needs Work</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <ArrowUpDown size={16} className="text-slate-900" /> Sort by
          </label>
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option>Date (Newest First)</option>
            <option>Date (Oldest First)</option>
            <option>Highest WPM</option>
            <option>Lowest WPM</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar size={16} className="text-slate-900" /> Date Range
          </label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option>All Time</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            <Search size={16} className="text-slate-900" /> Search
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by exam or test..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button 
            className="bg-[#4176ff] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors flex-1 lg:flex-none whitespace-nowrap"
          >
            <Filter size={16} /> Apply Filters
          </button>
          <button 
            onClick={clearFilters}
            className="bg-white border border-[#4176ff] text-[#4176ff] hover:bg-blue-50 px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors flex-1 lg:flex-none whitespace-nowrap"
          >
            <X size={16} /> Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Exam</th>
                <th className="px-5 py-4">Test</th>
                <th className="px-5 py-4">Speed (WPM)</th>
                <th className="px-5 py-4">Accuracy</th>
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
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <div className="text-sm font-semibold text-slate-800">{row.exam}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{row.passage}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                      {row.speed}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{row.accuracy}%</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${row.status === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    <div className="font-medium">{row.date}</div>
                    <div className="text-xs text-slate-400">{row.time}</div>
                  </td>
                  <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedRecord(row)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => onDelete(row.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-red-100 transition-colors"
                    >
                      <X size={14} /> Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500 font-medium">
                    No typing records found matching your filters.
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
          <div className="w-full max-w-[1300px] h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col overscroll-contain">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-white shrink-0 shadow-sm z-10">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Test History Details</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedRecord.passage} - {selectedRecord.date}</h3>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <X size={18} /> Close Details
              </button>
            </div>

            {/* Smooth Scrollable Local Lenis Result View */}
            <ReactLenis 
              className="flex-1 overflow-y-auto w-full custom-scrollbar" 
              options={{ 
                lerp: 0.08, // Custom smoothness multiplier for the modal
                smoothWheel: true 
              }}
            >
              <div className="min-h-max pb-8 relative will-change-transform">
                <TypingResult 
                  result={{
                    testName: selectedRecord.passage,
                    wpm: selectedRecord.raw.grossWpm || 0,
                    netWpm: selectedRecord.raw.netWpm || 0,
                    accuracy: selectedRecord.raw.accuracy || 0,
                    marks: selectedRecord.raw.score || 0,
                    keyStrokesByCandidate: selectedRecord.raw.keyStrokesByCandidate || 0,
                    fullMistakes: selectedRecord.raw.fullMistakes || 0,
                    totalErrors: selectedRecord.raw.totalErrors || 0,
                    errorPercentage: selectedRecord.raw.errorPercentage || 0,
                    backspacePresses: selectedRecord.raw.backspacePresses || 0,
                    timeTakenInSeconds: selectedRecord.raw.timeTakenInSeconds || 0,
                    qualified: selectedRecord.status === 'Qualified',
                    originalText: selectedRecord.raw.originalText,
                    typedText: selectedRecord.raw.typedText,
                  }}
                  onRestart={() => setSelectedRecord(null)} 
                  onTakeAnother={() => setSelectedRecord(null)}
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