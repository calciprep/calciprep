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

  // Read the URL to see if we were sent here from a specific subject result page
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
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 rounded-[2rem]">
          <h2 className="text-3xl font-black text-black mb-2 font-serif">Please log in</h2>
          <p className="text-black font-bold mb-6">You need an account to access your dashboard.</p>
          <button
            type="button"
            onClick={() => openModal(true)}
            className="bg-[#D4FF2A] border-[3px] border-black hover:-translate-y-1 text-black font-black px-8 py-3 rounded-full text-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans pt-[80px] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-8 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-[2rem]">
          <h1 className="text-4xl font-black text-black tracking-tight font-serif">Performance Dashboard</h1>
          <p className="text-slate-800 font-bold mt-2 text-lg">Review your practice performance, test history, and track improvements.</p>
        </div>

        {/* Subject Selector Tabs */}
        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveSubject('typing')}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-base font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${activeSubject === 'typing' ? 'bg-[#D4FF2A] text-black' : 'bg-white text-black'}`}
          >
            <Keyboard size={20} strokeWidth={2.5} /> Typing
          </button>
          
          <button
            onClick={() => setActiveSubject('maths')}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-base font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${activeSubject === 'maths' ? 'bg-[#D4FF2A] text-black' : 'bg-white text-black'}`}
          >
            <Calculator size={20} strokeWidth={2.5} /> Mathematics
          </button>
          
          <button
            onClick={() => setActiveSubject('english')}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-base font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 whitespace-nowrap hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              ${activeSubject === 'english' ? 'bg-[#D4FF2A] text-black' : 'bg-white text-black'}`}
          >
            <BookOpen size={20} strokeWidth={2.5} /> English
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