'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar as CalendarIcon, ExternalLink, Filter, Search, ChevronRight, FileText, Loader2, AlignLeft, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

interface ExamNotification {
  id: string;
  board: string;
  examName: string;
  title: string;
  summary?: string | null;
  type: string;
  date: string;
  link: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any; 
}

export default function AutomatedCalendarPage() {
  const [activeBoard, setActiveBoard] = useState('All Updates');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Database State
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for Summary Modal
  const [selectedSummary, setSelectedSummary] = useState<ExamNotification | null>(null);

  // Instantly fetch and listen to live updates from Firebase
  useEffect(() => {
    const q = query(collection(db!, 'calendar_notifications'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExamNotification[];

      // ADVANCED SORTING ENGINE
      const sortedData = liveData.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        const validDateA = isNaN(dateA) ? 0 : dateA;
        const validDateB = isNaN(dateB) ? 0 : dateB;

        if (validDateB !== validDateA) {
          return validDateB - validDateA; 
        }

        const createdA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const createdB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;

        return createdB - createdA; 
      });
      
      setNotifications(sortedData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching live notifications: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const BOARDS = useMemo(() => {
    return ['All Updates', ...Array.from(new Set(notifications.map(item => item.board)))];
  }, [notifications]);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Admit Card': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Apply Notification': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Corrigendum': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reschedule': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Vacancies': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'City Intimation': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Answer Key': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'Result': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      
      const matchesBoard = activeBoard === 'All Updates' || item.board === activeBoard;
      const matchesCategory = activeCategory === 'All' || item.type === activeCategory;
      
      const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) || 
        item.examName.toLowerCase().includes(searchLower) ||
        item.date.toLowerCase().includes(searchLower);

      return matchesBoard && matchesCategory && matchesSearch;
    });
  }, [notifications, activeBoard, activeCategory, searchQuery]);

  // COMPLETE SCROLL LOCK FIX FOR ALL DEVICES
  useEffect(() => {
    if (selectedSummary) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevents layout shift when scrollbar disappears
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '0px';
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.body.style.paddingRight = '0px';
    };
  }, [selectedSummary]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-20 relative">
      
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 py-12 mb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold tracking-wide uppercase mb-4">
                <Bell size={16} /> Live Feed
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Exam Updates & Tracker
              </h1>
              <p className="text-slate-600 text-lg max-w-xl">
                Real-time tracking for official notifications, admit cards, vacancies, and schedule changes.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search exams, titles, or dates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar: Navigation & Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            
            {/* Board Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-row lg:flex-col overflow-x-auto custom-scrollbar">
              {BOARDS.map((board) => (
                <button
                  key={board}
                  onClick={() => { setActiveBoard(board); setActiveCategory('All'); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal
                    ${activeBoard === board 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {board}
                  {activeBoard === board && <ChevronRight size={16} className="hidden lg:block opacity-70" />}
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="hidden sm:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter size={14} /> Filter by Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {['All', 'Admit Card', 'Apply Notification', 'Vacancies', 'City Intimation', 'Corrigendum', 'Reschedule', 'Answer Key', 'Result'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border
                      ${activeCategory === cat 
                        ? 'bg-slate-800 text-white border-slate-800' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content: Notification Feed */}
          <div className="flex-1">
            
            {/* Header for Active Board */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-600" /> 
                {activeBoard === 'All Updates' ? 'Latest Government Exam Updates' : `${activeBoard} Notifications`}
              </h2>
              <span className="text-sm font-semibold text-slate-500">{filteredNotifications.length} updates found</span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-slate-500 font-bold">Syncing live updates...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="block bg-white rounded-2xl border border-slate-200 shadow-sm transition-all p-5 lg:p-6 group relative overflow-hidden"
                    >
                      {/* Subtle Hover Highlight */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{notif.examName}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getBadgeStyle(notif.type)}`}>
                              {notif.type}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-900 leading-snug pr-4">
                            {notif.title}
                          </h3>

                          {/* DYNAMIC SUMMARY BUTTON */}
                          {notif.summary && (
                            <button 
                              onClick={() => setSelectedSummary(notif)}
                              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors border border-amber-200"
                            >
                              <AlignLeft size={14} /> Read Detailed Summary
                            </button>
                          )}

                        </div>

                        <div className="flex items-center md:flex-col justify-between md:justify-center md:items-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                          <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                            <CalendarIcon size={14} /> {notif.date}
                          </p>
                          
                          <a 
                            href={notif.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                          >
                            View Official Notice <ExternalLink size={14} />
                          </a>
                        </div>

                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl border-dashed">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No updates found</h3>
                    <p className="text-slate-500 text-sm">We couldn't find any notifications matching your filters.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ======================================================= */}
      {/* SUMMARY MODAL WINDOW (FIXED SCROLL AND OVERFLOW LOGIC) */}
      {/* ======================================================= */}
      {selectedSummary && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overscroll-none"
          onClick={() => setSelectedSummary(null)} // Clicking background closes modal
        >
          {/* 
            FIX: "max-h-full sm:max-h-[90vh]" prevents it from growing taller than the screen.
            "flex flex-col" paired with "flex-1 overflow-y-auto" ensures ONLY the body scrolls. 
          */}
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-full sm:max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Clicking inside modal prevents it from closing
          >
            
            {/* Modal Header (Fixed at Top) */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <AlignLeft size={18} className="text-blue-600" /> Notification Summary
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  {selectedSummary.examName} • {selectedSummary.date}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSummary(null)}
                className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable area) */}
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
              <h4 className="text-xl font-bold text-slate-800 mb-5 leading-snug">
                {selectedSummary.title}
              </h4>
              
              <div className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap bg-amber-50/50 p-5 rounded-xl border border-amber-100">
                {selectedSummary.summary}
              </div>

              <div className="mt-8 flex justify-end">
                <a 
                  href={selectedSummary.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  Open Full Official PDF <ExternalLink size={16} />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}