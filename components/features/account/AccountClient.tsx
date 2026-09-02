"use client";

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  User, Shield, LayoutDashboard, Calculator, BookOpen, Keyboard, 
  CheckCircle2, Mail, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HistoryCollection, HistoryEntry, UserService } from '@/services/userService';
import SecurityTab from './SecurityTab';

// --- MAIN COMPONENT ---
export default function AccountClient() {
  const { currentUser, userData, authLoading, openModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'security'>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [typingHistory, setTypingHistory] = useState<HistoryEntry[]>([]);
  const [mathsHistory, setMathsHistory] = useState<HistoryEntry[]>([]);
  const [englishHistory, setEnglishHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setTypingHistory([]);
      setMathsHistory([]);
      setEnglishHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadHistory(uid: string) {
      setLoading(true);
      try {
        const [typingData, mathsData, englishData] = await Promise.all([
          UserService.getHistory(uid, 'typing_history'),
          UserService.getHistory(uid, 'maths_history'),
          UserService.getHistory(uid, 'english_history'),
        ]);

        if (!cancelled) {
          setTypingHistory(typingData);
          setMathsHistory(mathsData);
          setEnglishHistory(englishData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHistory(currentUser.uid);
    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading]);

  const handleDeleteHistory = async (collectionName: HistoryCollection, id: string) => {
    if (!currentUser) return;
    try {
      await UserService.deleteHistory(currentUser.uid, collectionName, id);
      if (collectionName === 'typing_history') {
        setTypingHistory((prev) => prev.filter((item) => item.id !== id));
      } else if (collectionName === 'maths_history') {
        setMathsHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        setEnglishHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Please log in</h2>
          <p className="text-slate-500 mb-6">You need an account to access the dashboard.</p>
          <button
            type="button"
            onClick={() => openModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Account</h1>
          <p className="text-slate-500 mt-1">Manage your progress, profile, and security settings.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
              <NavButton 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
              />
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                icon={<User size={20} />}
                label="Profile"
              />
              <NavButton 
                active={activeTab === 'security'} 
                onClick={() => setActiveTab('security')}
                icon={<Shield size={20} />}
                label="Security"
              />
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                typingHistory={typingHistory}
                mathsHistory={mathsHistory}
                englishHistory={englishHistory}
                onDelete={handleDeleteHistory}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                displayName={currentUser.displayName || userData?.name || 'User'}
                email={currentUser.email || ''}
              />
            )}
            {activeTab === 'security' && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-2xl animate-in fade-in duration-300">
                <SecurityTab />
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

// --- DASHBOARD TAB ---
function DashboardTab({
  typingHistory,
  mathsHistory,
  englishHistory,
  onDelete,
}: {
  typingHistory: HistoryEntry[];
  mathsHistory: HistoryEntry[];
  englishHistory: HistoryEntry[];
  onDelete: (collectionName: HistoryCollection, id: string) => Promise<void>;
}) {
  const [activeSubject, setActiveSubject] = useState<'typing' | 'maths' | 'english'>('typing');
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '15days' | '30days'>('30days');

  // Calculate Averages for Maths
  const avgMathsScore = mathsHistory.length > 0 
    ? (mathsHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / mathsHistory.length).toFixed(1) + '%' 
    : '0%';
  const bestMathsScore = mathsHistory.length > 0 
    ? Math.max(...mathsHistory.map(m => m.score || 0)) + '%' 
    : '0%';

  // Calculate Averages for English
  const avgEnglishScore = englishHistory.length > 0 
    ? (englishHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) / englishHistory.length).toFixed(1) + '%' 
    : '0%';
  const bestEnglishScore = englishHistory.length > 0 
    ? Math.max(...englishHistory.map(m => m.score || 0)) + '%' 
    : '0%';

  return (
    <div className="space-y-6">
      
      {/* Subject Selector Tabs */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-max overflow-x-auto">
        <SubjectButton 
          active={activeSubject === 'typing'} 
          onClick={() => setActiveSubject('typing')} 
          icon={<Keyboard size={18} />} 
          label="Typing" 
        />
        <SubjectButton 
          active={activeSubject === 'maths'} 
          onClick={() => setActiveSubject('maths')} 
          icon={<Calculator size={18} />} 
          label="Mathematics" 
        />
        <SubjectButton 
          active={activeSubject === 'english'} 
          onClick={() => setActiveSubject('english')} 
          icon={<BookOpen size={18} />} 
          label="English" 
        />
      </div>

      {/* Conditional Analytics View */}
      {activeSubject === 'typing' && (
        <TypingAnalytics
          history={typingHistory}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          onDelete={(id) => onDelete('typing_history', id)}
        />
      )}
      
      {activeSubject === 'maths' && (
        <SubjectAnalytics 
          subjectName="Mathematics" 
          totalTests={mathsHistory.length.toString()} 
          avgScore={avgMathsScore} 
          bestScore={bestMathsScore} 
          history={mathsHistory}
          onDelete={(id) => onDelete('maths_history', id)} 
        />
      )}

      {activeSubject === 'english' && (
        <SubjectAnalytics 
          subjectName="English" 
          totalTests={englishHistory.length.toString()} 
          avgScore={avgEnglishScore} 
          bestScore={bestEnglishScore} 
          history={englishHistory}
          onDelete={(id) => onDelete('english_history', id)} 
        />
      )}

    </div>
  );
}

// --- TYPING ANALYTICS ---
function TypingAnalytics({
  history,
  timeFilter,
  setTimeFilter,
  onDelete,
}: {
  history: HistoryEntry[];
  timeFilter: string;
  setTimeFilter: (v: 'today' | '7days' | '15days' | '30days') => void;
  onDelete: (id: string) => void;
}) {
  
  // Generate real stats from history array
  const totalTests = history.length;
  const avgAccuracy = totalTests > 0 ? (history.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / totalTests).toFixed(2) : "0";
  const avgGross = totalTests > 0 ? (history.reduce((acc, curr) => acc + (curr.grossWpm || 0), 0) / totalTests).toFixed(2) : "0";
  const avgNet = totalTests > 0 ? (history.reduce((acc, curr) => acc + (curr.netWpm || 0), 0) / totalTests).toFixed(2) : "0";
  const bestGross = totalTests > 0 ? Math.max(...history.map(h => h.grossWpm || 0)) : "0";
  const bestNet = totalTests > 0 ? Math.max(...history.map(h => h.netWpm || 0)) : "0";

  // Reverse history so oldest is on the left of the chart
  const chartData = [...history].reverse().map(item => ({
    date: item.date || 'Unknown',
    wpm: item.netWpm || 0,
    accuracy: item.accuracy || 0
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Performance Insights</h2>
        <div className="flex bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden text-sm">
          <TimeFilterButton active={timeFilter === 'today'} onClick={() => setTimeFilter('today')} label="Today" />
          <TimeFilterButton active={timeFilter === '7days'} onClick={() => setTimeFilter('7days')} label="7 Days" />
          <TimeFilterButton active={timeFilter === '15days'} onClick={() => setTimeFilter('15days')} label="15 Days" />
          <TimeFilterButton active={timeFilter === '30days'} onClick={() => setTimeFilter('30days')} label="30 Days" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Tests" value={totalTests.toString()} color="text-slate-900" />
        <StatCard title="Avg Accuracy" value={`${avgAccuracy}%`} color="text-blue-600" />
        <StatCard title="Avg Gross" value={avgGross.toString()} unit="WPM" color="text-slate-700" />
        <StatCard title="Avg Net" value={avgNet.toString()} unit="WPM" color="text-emerald-600" />
        <StatCard title="Best Gross" value={bestGross.toString()} unit="WPM" color="text-indigo-600" />
        <StatCard title="Best Net" value={bestNet.toString()} unit="WPM" color="text-purple-600" />
      </div>

      {/* Charts Row */}
      {totalTests > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Speed Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Net Speed (WPM) Progress</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-6 h-3 border-2 border-blue-500 bg-blue-100 rounded-sm"></div>
                Net WPM
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="wpm" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWpm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accuracy Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Accuracy (%) Progress</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-6 h-3 border-2 border-emerald-500 bg-emerald-100 rounded-sm"></div>
                Accuracy %
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 1', 100]} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm text-center">
          <p className="text-slate-500">No typing tests taken yet. Start practicing to see your charts!</p>
        </div>
      )}

      {/* Detailed History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Detailed History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-4 px-4">Date & Time</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4">Test Name</th>
                <th className="pb-4 px-4">Net Speed (WPM)</th>
                <th className="pb-4 px-4">Accuracy</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-slate-700">{row.date}</div>
                      <div className="text-xs text-slate-400">{row.time}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">{row.category || 'Typing Practice'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{row.name || 'Typing Test'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-emerald-600">{row.netWpm}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{row.accuracy}%</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-md transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// --- GENERIC SUBJECT ANALYTICS (Maths & English) ---
function SubjectAnalytics({
  subjectName,
  totalTests,
  avgScore,
  bestScore,
  history,
  onDelete,
}: {
  subjectName: string;
  totalTests: string;
  avgScore: string;
  bestScore: string;
  history: HistoryEntry[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{subjectName} Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Tests Taken" value={totalTests} color="text-slate-900" />
        <StatCard title="Average Score" value={avgScore} color="text-blue-600" />
        <StatCard title="Personal Best" value={bestScore} color="text-emerald-600" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-6">{subjectName} Test History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-4 px-4">Date & Time</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4">Assessment Name</th>
                <th className="pb-4 px-4">Score</th>
                <th className="pb-4 px-4">Accuracy</th>
                <th className="pb-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length > 0 ? (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-slate-700">{row.date}</div>
                      <div className="text-xs text-slate-400">{row.time}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">{row.category || 'Practice'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{row.name || 'Assessment'}</td>
                    <td className="py-4 px-4 text-sm font-bold text-blue-600">{row.score}%</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{row.accuracy}%</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onDelete(row.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-md transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- PROFILE TAB ---
function ProfileTab({ displayName, email }: { displayName: string; email: string }) {
  const { currentUser, updateUserProfile, fetchUserData } = useAuth();
  const [name, setName] = useState(displayName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await updateUserProfile(currentUser, { name: name.trim() });
      await fetchUserData();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (saveError) {
      console.error("Profile save error:", saveError);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-2xl animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
      
      {saved && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={18} /> Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User size={18} />
            </span>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail size={18} />
            </span>
            <input 
              type="email" 
              value={email} 
              disabled
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg focus:outline-none text-sm cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Email address cannot be changed directly.</p>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 w-full text-left
        ${active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SubjectButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
        ${active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TimeFilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'bg-transparent text-slate-600 hover:bg-slate-50'
        }
        ${label !== 'Today' ? 'border-l border-slate-200' : ''}
      `}
    >
      {label}
    </button>
  );
}

function StatCard({ title, value, unit, color }: { title: string, value: string, unit?: string, color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center shadow-sm text-center">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{title}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-extrabold ${color}`}>{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-400 uppercase">{unit}</span>}
      </div>
    </div>
  );
}