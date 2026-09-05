'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { db } from '@/lib/firebase'; 
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

type LeaderboardEntry = {
  id: string;
  uid: string;
  userName: string;
  wpm: number;
  netWpm: number;
  accuracy: number;
  marks: number;
  timeTaken: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timestamp: any;
};

export default function SSCCHSL_LiveLeaderboard() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(today.getHours() - 4); 
    const dateString = today.toLocaleDateString('en-CA'); 
    
    // READ FROM UNIQUE CHSL COLLECTION
    const leaderboardRefName = `live_leaderboards_chsl_${dateString}`;

    const q = query(
      collection(db!, leaderboardRefName), 
      orderBy('netWpm', 'desc'), 
      orderBy('accuracy', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uniqueUsers = new Map<string, LeaderboardEntry>();
      
      snapshot.forEach((doc) => {
        const data = doc.data() as LeaderboardEntry;
        if (!uniqueUsers.has(data.uid)) {
          uniqueUsers.set(data.uid, { ...data, id: doc.id });
        }
      });
      
      setLeaderboard(Array.from(uniqueUsers.values()));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching CHSL leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const formatStat = (num: number) => Number.isInteger(num) ? num : Number(num).toFixed(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatISTDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-[100px] pb-20">
      <div className="max-w-6xl mx-auto px-4">
        
        <button onClick={() => router.push('/live-tests/typing/ssc_chsl')} className="flex items-center text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} className="mr-2" /> Back to CHSL Live Hub
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-600 rounded-2xl mb-4">
            <Trophy size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-3" style={{fontFamily: 'var(--font-oswald)'}}>
            Live Leaderboard
          </h1>
          <p className="text-slate-600 font-medium">SSC CHSL Tier-II • Today's Pan-India Rankings</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
            <p className="text-slate-500 font-bold">Syncing live CHSL scores...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <p className="text-xl font-bold text-slate-400">No one has completed today's CHSL test yet.</p>
            <p className="text-slate-500 mt-2">Be the first to secure the #1 spot!</p>
          </div>
        ) : (
          <>
            {/* TOP 3 PODIUM */}
            {topThree.length > 0 && (
              <div className="flex items-end justify-center gap-2 md:gap-6 mb-16 pt-10 h-64">
                {topThree[1] && (
                  <div className="w-1/3 max-w-[150px] flex flex-col items-center animate-in slide-in-from-bottom duration-500 delay-100">
                    <div className="text-center mb-3">
                      <p className="font-bold text-slate-700 truncate w-full px-2">{topThree[1].userName}</p>
                      <p className="font-black text-xl text-slate-900">{formatStat(topThree[1].netWpm)} <span className="text-xs text-slate-500">WPM</span></p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-slate-300 to-slate-200 h-24 rounded-t-2xl border-t-4 border-slate-400 flex justify-center pt-3 relative shadow-inner">
                      <Medal size={28} className="text-slate-500 drop-shadow-md" />
                    </div>
                  </div>
                )}
                <div className="w-1/3 max-w-[160px] flex flex-col items-center animate-in slide-in-from-bottom duration-500 z-10">
                  <div className="text-center mb-3 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                      <Trophy size={24} fill="currentColor" />
                    </div>
                    <p className="font-bold text-slate-800 truncate w-full px-2">{topThree[0].userName}</p>
                    <p className="font-black text-2xl text-amber-600">{formatStat(topThree[0].netWpm)} <span className="text-xs text-amber-600/70">WPM</span></p>
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-300 to-amber-200 h-32 rounded-t-2xl border-t-4 border-amber-400 flex justify-center pt-3 relative shadow-lg">
                    <Medal size={32} className="text-amber-600 drop-shadow-md" />
                  </div>
                </div>
                {topThree[2] && (
                  <div className="w-1/3 max-w-[150px] flex flex-col items-center animate-in slide-in-from-bottom duration-500 delay-200">
                    <div className="text-center mb-3">
                      <p className="font-bold text-slate-700 truncate w-full px-2">{topThree[2].userName}</p>
                      <p className="font-black text-xl text-slate-900">{formatStat(topThree[2].netWpm)} <span className="text-xs text-slate-500">WPM</span></p>
                    </div>
                    <div className="w-full bg-gradient-to-t from-amber-800/40 to-amber-700/30 h-20 rounded-t-2xl border-t-4 border-amber-700/50 flex justify-center pt-3 relative shadow-inner">
                      <Medal size={28} className="text-amber-800/60 drop-shadow-md" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FULL TABLE */}
            <div className="rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#0a738c] text-white text-[15px] font-bold tracking-wide">
                      <th className="px-6 py-4">Rank</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4 text-center">Gross WPM</th>
                      <th className="px-6 py-4 text-center">Net WPM</th>
                      <th className="px-6 py-4 text-center">Accuracy</th>
                      <th className="px-6 py-4 text-center">Marks</th>
                      <th className="px-6 py-4 text-center text-red-500">Status</th>
                      <th className="px-6 py-4 text-right">Date (IST)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1; 
                      const isCurrentUser = entry.uid === currentUser?.uid;
                      const isTop3 = rank <= 3;

                      return (
                        <tr key={entry.id} className={`border-b border-slate-100 transition-colors ${isCurrentUser ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                          <td className="px-6 py-4"><span className={`font-black ${isTop3 ? 'text-amber-600' : isCurrentUser ? 'text-blue-600' : 'text-slate-500'}`}>#{rank}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                {entry.userName.charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-bold ${isCurrentUser ? 'text-blue-900' : 'text-slate-700'}`}>{entry.userName} {isCurrentUser && '(You)'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-600">{formatStat(entry.wpm)}</td>
                          <td className="px-6 py-4 text-center"><span className={`inline-flex items-center px-3 py-1 rounded-lg font-black ${isCurrentUser ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{formatStat(entry.netWpm)}</span></td>
                          <td className="px-6 py-4 text-center font-bold text-slate-600">{formatStat(entry.accuracy)}%</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-600">{formatStat(entry.marks)}</td>
                          <td className="px-6 py-4 text-center font-bold"><span className="text-emerald-600">Qualified</span></td>
                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">{formatISTDate(entry.timestamp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}