'use client';

import React, { useState, useMemo } from 'react';
import { HistoryEntry } from '@/services/userService';
import { Eye, Filter, ArrowUpDown, Calendar, Search, X, Activity, Target, Hash } from 'lucide-react';

type DashboardRecord = { id: string; exam: string; passage: string; score: number; accuracy: number; status: 'Qualified' | 'Needs Work'; date: string; time: string; createdAt: number; raw: HistoryEntry; };
interface MathsDashboardProps { history: HistoryEntry[]; onDelete: (id: string) => Promise<void>; }

export default function MathsDashboard({ history, onDelete }: MathsDashboardProps) {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Date (Newest First)');
  const [dateRange, setDateRange] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(null);

  const allRecords = useMemo<DashboardRecord[]>(() => {
    return history.map((item) => {
      const score = Number(item.score ?? 0);
      return { id: item.id, exam: 'Mathematics', passage: item.name || 'Maths Challenge', score: score, accuracy: Number(item.accuracy ?? score), status: score >= 60 ? 'Qualified' : 'Needs Work', date: item.date || 'Unknown date', time: item.time || 'Unknown time', createdAt: item.createdAt || 0, raw: item, };
    });
  }, [history]);

  const totalTests = allRecords.length;
  const qualifiedTests = allRecords.filter((r) => r.status === 'Qualified').length;
  const avgScore = totalTests > 0 ? (allRecords.reduce((acc, curr) => acc + curr.score, 0) / totalTests).toFixed(1) : '0';

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];
    if (statusFilter !== 'All Status') result = result.filter((r) => r.status === statusFilter);
    if (searchQuery.trim()) result = result.filter((r) => r.passage.toLowerCase().includes(searchQuery.toLowerCase()) || r.exam.toLowerCase().includes(searchQuery.toLowerCase()));
    if (dateRange === 'Last 7 Days') result = result.filter((r) => r.createdAt >= Date.now() - 7 * 86400000);
    else if (dateRange === 'Last 30 Days') result = result.filter((r) => r.createdAt >= Date.now() - 30 * 86400000);
    if (sortOrder === 'Date (Newest First)') result.sort((a, b) => b.createdAt - a.createdAt);
    else if (sortOrder === 'Date (Oldest First)') result.sort((a, b) => a.createdAt - b.createdAt);
    else if (sortOrder === 'Highest Score') result.sort((a, b) => b.score - a.score);
    else if (sortOrder === 'Lowest Score') result.sort((a, b) => a.score - b.score);
    return result;
  }, [allRecords, statusFilter, searchQuery, dateRange, sortOrder]);

  const clearFilters = () => { setStatusFilter('All Status'); setSortOrder('Date (Newest First)'); setDateRange('All Time'); setSearchQuery(''); };

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
          <div className="absolute top-6 right-6 bg-white border-2 border-black text-black p-3 rounded-full"><Target size={24} strokeWidth={3} /></div>
          <span className="text-5xl font-black text-black mb-2 mt-2">{qualifiedTests}</span>
          <span className="text-sm font-black tracking-wider text-black uppercase">Qualified</span>
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
          <label className="text-sm font-black text-black flex items-center gap-2"><Filter size={18} strokeWidth={2.5} /> Filter by Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer">
            <option>All Status</option><option>Qualified</option><option>Needs Work</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label className="text-sm font-black text-black flex items-center gap-2"><ArrowUpDown size={18} strokeWidth={2.5} /> Sort by</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer">
            <option>Date (Newest First)</option><option>Date (Oldest First)</option><option>Highest Score</option><option>Lowest Score</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
          <label className="text-sm font-black text-black flex items-center gap-2"><Calendar size={18} strokeWidth={2.5} /> Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-[2.5px] border-black rounded-xl p-3 text-sm font-bold outline-none focus:-translate-y-1 transition-all bg-white cursor-pointer">
            <option>All Time</option><option>Last 7 Days</option><option>Last 30 Days</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-sm font-black text-black flex items-center gap-2"><Search size={18} strokeWidth={2.5} /> Search</label>
          <div className="relative">
            <Search size={18} strokeWidth={2.5} className="absolute left-3 top-3 text-black" />
            <input type="text" placeholder="Search by exam or test..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border-[2.5px] border-black rounded-xl p-3 pl-10 text-sm font-bold outline-none focus:-translate-y-1 transition-all" />
          </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <button onClick={clearFilters} className="bg-white border-[3px] border-black hover:bg-slate-100 text-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-black hover:-translate-y-1 transition-all flex-1 lg:flex-none whitespace-nowrap"><X size={18} strokeWidth={3} /> Clear</button>
        </div>
      </div>

      {/* Brutalist Table */}
      <div className="bg-white border-[3px] border-black rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[3px] border-black bg-[#D4FF2A] text-sm font-black uppercase tracking-wider text-black">
                <th className="px-6 py-5">#</th>
                <th className="px-6 py-5">Exam</th>
                <th className="px-6 py-5">Test</th>
                <th className="px-6 py-5">Score</th>
                <th className="px-6 py-5">Accuracy</th>
                <th className="px-6 py-5">Status</th>
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
                    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-black border-2 border-black ${row.status === 'Qualified' ? 'bg-[#C4F2B0] text-black' : 'bg-white text-black'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-black"><div className="font-bold">{row.date}</div><div className="font-medium text-slate-500 mt-0.5">{row.time}</div></td>
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                    <button onClick={() => setSelectedRecord(row)} className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-black text-white hover:bg-slate-800 transition-colors"><Eye size={16} strokeWidth={2.5} /> View</button>
                    <button onClick={() => onDelete(row.id)} className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-black text-black px-4 py-2 text-xs font-black hover:bg-[#FF8787] transition-colors"><X size={16} strokeWidth={3} /> Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-black font-black text-lg">No mathematics records found matching your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brutalist Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-[#FDFBF7] border-[4px] border-black p-8">
            <div className="flex items-center justify-between mb-8 border-b-[3px] border-black pb-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-slate-500">Result Details</p>
                <h4 className="mt-1 text-3xl font-black text-black font-serif">Mathematics</h4>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-full bg-white border-[3px] border-black p-3 text-black hover:-translate-y-1 transition-all"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="rounded-[1.5rem] bg-[#AEE8F5] p-6 border-[3px] border-black text-center">
                  <p className="text-sm font-black uppercase tracking-wider text-black">Score</p>
                  <p className="mt-2 text-4xl font-black text-black">{selectedRecord.score}%</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#FF8787] p-6 border-[3px] border-black text-center">
                  <p className="text-sm font-black uppercase tracking-wider text-black">Accuracy</p>
                  <p className="mt-2 text-4xl font-black text-black">{selectedRecord.accuracy}%</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-white border-[3px] border-black p-6">
                <p className="text-sm font-black uppercase tracking-wider text-slate-500">Test</p>
                <p className="mt-2 text-xl font-black text-black">{selectedRecord.passage}</p>
              </div>

              <div className="grid grid-cols-2 gap-5 text-sm">
                <div className="rounded-[1.5rem] bg-white p-6 border-[3px] border-black">
                  <p className="font-black text-slate-500 uppercase tracking-wider">Status</p>
                  <p className={`mt-2 text-xl font-black ${selectedRecord.status === 'Qualified' ? 'text-green-600' : 'text-red-600'}`}>{selectedRecord.status}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-6 border-[3px] border-black">
                  <p className="font-black text-slate-500 uppercase tracking-wider">Date & Time</p>
                  <p className="mt-2 font-black text-black">{selectedRecord.date}</p>
                  <p className="text-sm font-bold text-slate-500">{selectedRecord.time}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}