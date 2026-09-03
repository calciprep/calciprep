'use client';

import React, { useState, useEffect } from 'react';
import { Keyboard, Calculator, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HistoryCollection, HistoryEntry, UserService } from '@/services/userService';

import TypingDashboard from '@/components/features/dashboard/TypingDashboard';
import MathsDashboard from '@/components/features/dashboard/MathsDashboard';
import EnglishDashboard from '@/components/features/dashboard/EnglishDashboard';

export default function DashboardPage() {
  const { currentUser, authLoading, openModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<'typing' | 'maths' | 'english'>('typing');
  
  const [typingHistory, setTypingHistory] = useState<HistoryEntry[]>([]);
  const [mathsHistory, setMathsHistory] = useState<HistoryEntry[]>([]);
  const [englishHistory, setEnglishHistory] = useState<HistoryEntry[]>([]);

  // NEW: Read the URL to see if we were sent here from a specific subject result page
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab === 'typing' || tab === 'maths' || tab === 'english') {
      setActiveSubject(tab);
    }
  }, []);

  // Fetch data
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
        console.error("Error fetching user history data:", error);
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
          <p className="text-slate-500 mb-6">You need an account to access your dashboard.</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance Dashboard</h1>
          <p className="text-slate-500 mt-1">Review your practice performance, test history, and track improvements.</p>
        </div>

        {/* Subject Selector Tabs */}
        <div className="mb-6 flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-max overflow-x-auto">
          <button
            onClick={() => setActiveSubject('typing')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${activeSubject === 'typing' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Keyboard size={18} /> Typing
          </button>
          
          <button
            onClick={() => setActiveSubject('maths')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${activeSubject === 'maths' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Calculator size={18} /> Mathematics
          </button>
          
          <button
            onClick={() => setActiveSubject('english')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
              ${activeSubject === 'english' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <BookOpen size={18} /> English
          </button>
        </div>

        {/* Main Content View Switcher */}
        {activeSubject === 'typing' && (
          <TypingDashboard 
            history={typingHistory} 
            onDelete={(id) => handleDeleteHistory('typing_history', id)} 
          />
        )}

        {activeSubject === 'maths' && (
          <MathsDashboard 
            history={mathsHistory} 
            onDelete={(id) => handleDeleteHistory('maths_history', id)} 
          />
        )}

        {activeSubject === 'english' && (
          <EnglishDashboard 
            history={englishHistory} 
            onDelete={(id) => handleDeleteHistory('english_history', id)} 
          />
        )}

      </div>
    </div>
  );
}