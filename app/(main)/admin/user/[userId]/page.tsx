'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Keyboard, Calculator, BookOpen, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HistoryCollection, HistoryEntry, UserService } from '@/services/userService';

// Reusing your existing dashboard components!
import TypingDashboard from '@/components/features/dashboard/TypingDashboard';
import MathsDashboard from '@/components/features/dashboard/MathsDashboard';
import EnglishDashboard from '@/components/features/dashboard/EnglishDashboard';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminUserDashboardView() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, authLoading } = useAuth() as any;
  const [loading, setLoading] = useState(true);
  const [targetUser, setTargetUser] = useState({ name: 'User', email: 'Loading...' });
  
  const [activeSubject, setActiveSubject] = useState<'typing' | 'maths' | 'english'>('typing');
  
  const [typingHistory, setTypingHistory] = useState<HistoryEntry[]>([]);
  const [mathsHistory, setMathsHistory] = useState<HistoryEntry[]>([]);
  const [englishHistory, setEnglishHistory] = useState<HistoryEntry[]>([]);

  // 1. SECURITY & DATA FETCH
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser || currentUser.email !== 'calciprep@gmail.com') {
      router.push('/');
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch target user's basic profile (Using db! as requested)
        const userDocRef = doc(db!, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && !cancelled) {
          const data = userDocSnap.data();
          setTargetUser({
            name: data.name || data.displayName || 'Unknown Student',
            email: data.email || 'No email'
          });
        }

        // Fetch target user's history from all 3 subjects
        const [typingData, mathsData, englishData] = await Promise.all([
          UserService.getHistory(userId, 'typing_history'),
          UserService.getHistory(userId, 'maths_history'),
          UserService.getHistory(userId, 'english_history'),
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

    if (userId) loadData();

    return () => {
      cancelled = true;
    };
  }, [currentUser, authLoading, userId, router]);

  // Admin Delete History Handler
  const handleDeleteHistory = async (collectionName: HistoryCollection, id: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this test result?`);
    if (!confirmDelete) return;

    try {
      await UserService.deleteHistory(userId, collectionName, id);
      if (collectionName === 'typing_history') {
        setTypingHistory((prev) => prev.filter((item) => item.id !== id));
      } else if (collectionName === 'maths_history') {
        setMathsHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        setEnglishHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("Failed to delete record. Check Firebase rules.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pt-[100px] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back to Admin Panel */}
        <button 
          onClick={() => router.push('/admin')} 
          className="flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Admin Console
        </button>

        {/* Page Header (Admin View Context) */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-600">
              <Shield size={16} /> <span className="text-xs font-black uppercase tracking-wider">Admin Observation Mode</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{targetUser.name}'s Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">{targetUser.email} • UID: <span className="font-mono text-xs">{userId}</span></p>
          </div>
        </div>

        {/* Subject Selector Tabs */}
        <div className="mb-6 flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-max overflow-x-auto">
          <button
            onClick={() => setActiveSubject('typing')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${activeSubject === 'typing' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Keyboard size={18} /> Typing Tests
          </button>
          
          <button
            onClick={() => setActiveSubject('maths')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${activeSubject === 'maths' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Calculator size={18} /> Mathematics
          </button>
          
          <button
            onClick={() => setActiveSubject('english')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${activeSubject === 'english' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <BookOpen size={18} /> English
          </button>
        </div>

        {/* Main Content View Switcher */}
        {activeSubject === 'typing' && (
          <TypingDashboard history={typingHistory} onDelete={(id) => handleDeleteHistory('typing_history', id)} />
        )}
        {activeSubject === 'maths' && (
          <MathsDashboard history={mathsHistory} onDelete={(id) => handleDeleteHistory('maths_history', id)} />
        )}
        {activeSubject === 'english' && (
          <EnglishDashboard history={englishHistory} onDelete={(id) => handleDeleteHistory('english_history', id)} />
        )}

      </div>
    </div>
  );
}