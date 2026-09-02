"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Eye, Loader2, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HistoryEntry, UserService } from '@/services/userService';

type DashboardRecord = {
  id: string;
  subject: 'Typing' | 'Mathematics' | 'English';
  exam: string;
  passage: string;
  speed: number;
  accuracy: number;
  status: 'Qualified' | 'Needs Work';
  date: string;
  time: string;
  createdAt: number;
};

export default function AnalyticsPage() {
  const { currentUser, authLoading } = useAuth();
  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DashboardRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !currentUser) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const uid = currentUser.uid;
    let active = true;

    async function loadHistory() {
      setLoading(true);
      try {
        const [typingData, mathsData, englishData] = await Promise.all([
          UserService.getHistory(uid, 'typing_history'),
          UserService.getHistory(uid, 'maths_history'),
          UserService.getHistory(uid, 'english_history'),
        ]);

        if (!active) return;

        const mapRecord = (item: HistoryEntry, subject: DashboardRecord['subject'], exam: string, passage: string): DashboardRecord => {
          const speed = subject === 'Typing' ? Number(item.netWpm ?? item.grossWpm ?? 0) : Number(item.score ?? 0);
          const accuracy = Number(item.accuracy ?? item.score ?? 0);
          const status = subject === 'Typing'
            ? (Number(item.netWpm ?? 0) >= 30 ? 'Qualified' : 'Needs Work')
            : (Number(item.score ?? 0) >= 60 ? 'Qualified' : 'Needs Work');

          return {
            id: item.id,
            subject,
            exam,
            passage: passage || item.name || `${subject} Test`,
            speed,
            accuracy,
            status,
            date: item.date || 'Unknown date',
            time: item.time || 'Unknown time',
            createdAt: item.createdAt || 0,
          };
        };

        const merged = [
          ...typingData.map((item) => mapRecord(item, 'Typing', 'Delhi Police', item.name || 'HCM Typing')),
          ...mathsData.map((item) => mapRecord(item, 'Mathematics', 'Mathematics', item.name || 'Maths Challenge')),
          ...englishData.map((item) => mapRecord(item, 'English', 'English', item.name || 'English Quiz')),
        ].sort((a, b) => b.createdAt - a.createdAt);

        setRecords(merged);
      } catch (error) {
        console.error('Failed to load dashboard records:', error);
        setRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();
    return () => {
      active = false;
    };
  }, [authLoading, currentUser]);

  const totalTests = records.length;
  const avgAccuracy = totalTests > 0 ? (records.reduce((sum, item) => sum + item.accuracy, 0) / totalTests).toFixed(1) : '0';
  const avgSpeed = totalTests > 0 ? (records.reduce((sum, item) => sum + item.speed, 0) / totalTests).toFixed(1) : '0';
  const qualifiedCount = records.filter((item) => item.status === 'Qualified').length;

  const chartData = useMemo(() => {
    const buckets = new Map<string, { label: string; speed: number; accuracy: number; count: number }>();

    records.forEach((item) => {
      const existing = buckets.get(item.date) ?? { label: item.date, speed: 0, accuracy: 0, count: 0 };
      existing.speed += item.speed;
      existing.accuracy += item.accuracy;
      existing.count += 1;
      buckets.set(item.date, existing);
    });

    return [...buckets.values()]
      .slice(0, 8)
      .reverse()
      .map((item) => ({
        label: item.label.split(',')[0] || item.label,
        speed: Number((item.speed / item.count).toFixed(1)),
        accuracy: Number((item.accuracy / item.count).toFixed(1)),
      }));
  }, [records]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Please log in</h2>
          <p className="mt-3 text-slate-600">Sign in to view your analytics and test history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Your Analytics</h1>
            <p className="mt-2 text-lg text-slate-600">Track your performance from real test history across typing, English, and mathematics.</p>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 md:mt-0">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold uppercase tracking-wide text-emerald-700">Live Tracking Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Tests" value={String(totalTests)} accent="text-slate-900" icon={<Target className="h-6 w-6 text-slate-700" />} />
          <MetricCard label="Avg Accuracy" value={`${avgAccuracy}%`} accent="text-blue-600" icon={<TrendingUp className="h-6 w-6 text-blue-600" />} />
          <MetricCard label="Avg Speed" value={`${avgSpeed} WPM`} accent="text-purple-600" icon={<CheckCircle2 className="h-6 w-6 text-purple-600" />} />
          <MetricCard label="Qualified" value={String(qualifiedCount)} accent="text-emerald-600" icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-bold text-slate-900">Speed Trend</h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="speedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)' }} />
                    <Area type="monotone" dataKey="speed" stroke="#2563eb" strokeWidth={3} fill="url(#speedFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No data yet.</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-bold text-slate-900">Accuracy Trend</h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)' }} />
                    <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} fill="url(#accuracyFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">No data yet.</div>
              )}
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
            <h3 className="text-2xl font-bold">Test Records ({records.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Exam</th>
                  <th className="px-5 py-4">Passage</th>
                  <th className="px-5 py-4">Speed (WPM)</th>
                  <th className="px-5 py-4">Accuracy</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? records.map((row, index) => (
                  <tr key={`${row.subject}-${row.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-600">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-semibold text-slate-800">{row.subject}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{row.passage}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">{row.speed}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{row.accuracy}%</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${row.status === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <div className="font-medium">{row.date}</div>
                      <div className="text-xs text-slate-400">{row.time}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(row)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                      >
                        <Eye size={15} />
                        View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-500">No analytics record found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Result details</p>
                  <h4 className="mt-1 text-2xl font-bold text-slate-900">{selectedRecord.subject}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Speed</p>
                    <p className="mt-2 text-2xl font-bold text-blue-700">{selectedRecord.speed} WPM</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Accuracy</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{selectedRecord.accuracy}%</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Test</p>
                  <p className="mt-2 text-lg font-semibold text-slate-800">{selectedRecord.passage}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">Status</p>
                    <p className={`mt-2 font-semibold ${selectedRecord.status === 'Qualified' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedRecord.status}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">Date</p>
                    <p className="mt-2 font-semibold text-slate-800">{selectedRecord.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className={`mt-2 text-3xl font-black ${accent}`}>{value}</h3>
        </div>
        <div className="rounded-xl bg-slate-100 p-3">{icon}</div>
      </div>
    </div>
  );
}