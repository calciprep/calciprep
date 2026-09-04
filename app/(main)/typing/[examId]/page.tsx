'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { UserService } from '@/services/userService';
import { exams } from '@/lib/typing';
import { 
  ArrowLeft, Info, FileText, Play, RefreshCw, 
  Search, Layers, Clock, Leaf, Equal, Flame, FileDown 
} from 'lucide-react';

// --- TAB CONFIGURATION ---
const TABS = [
  { 
    id: 'All', 
    label: 'All', 
    icon: Layers, 
    activeClass: 'bg-[#5b58f5] text-white border-transparent shadow-md', 
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-gray-100 text-gray-500'
  },
  { 
    id: 'PYTT', 
    label: 'PYTT', 
    icon: Clock, 
    activeClass: 'bg-amber-50 text-amber-700 border-amber-300', 
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-amber-50',
    badgeActive: 'bg-amber-200 text-amber-800',
    badgeInactive: 'bg-gray-100 text-gray-500'
  },
  { 
    id: 'Easy', 
    label: 'Easy', 
    icon: Leaf, 
    activeClass: 'bg-[#e6fbf0] text-[#006838] border-[#a3e8c3]', 
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-[#e6fbf0]',
    badgeActive: 'bg-[#c2efd6] text-[#006838]',
    badgeInactive: 'bg-gray-100 text-gray-500'
  },
  { 
    id: 'Medium', // Mapped to 'Moderate' in UI
    label: 'Moderate', 
    icon: Equal, 
    activeClass: 'bg-[#f0f3ff] text-[#343a9a] border-[#c2d1ff]', 
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-[#f0f3ff]',
    badgeActive: 'bg-[#d8e2ff] text-[#343a9a]',
    badgeInactive: 'bg-gray-100 text-gray-500'
  },
  { 
    id: 'Hard', 
    label: 'Hard', 
    icon: Flame, 
    activeClass: 'bg-[#fff0f0] text-[#a51a1a] border-[#ffc2c2]', 
    inactiveClass: 'bg-white text-gray-600 border-gray-200 hover:bg-[#fff0f0]',
    badgeActive: 'bg-[#ffdada] text-[#a51a1a]',
    badgeInactive: 'bg-gray-100 text-gray-500'
  }
];

export default function ExamPassageSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  const examData = exams[examId];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // FETCH USER HISTORY TO DETERMINE "START" vs "RETAKE"
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) {
        setIsLoadingHistory(false);
        return;
      }
      try {
        if (UserService.getHistory) {
          const history = await UserService.getHistory(currentUser.uid, 'typing_history');
          const completedNames = new Set<string>(history.map((h: any) => h.name));
          setCompletedPassages(completedNames);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  // HELPER TO GET TAB COUNTS
  const getTabCount = (tabId: string) => {
    if (!examData) return 0;
    if (tabId === 'All') return examData.passages.length;
    return examData.passages.filter(p => (p.difficulty || 'Easy').toLowerCase() === tabId.toLowerCase()).length;
  };

  // FILTER PASSAGES BASED ON SELECTED TAB & SEARCH
  const filteredPassages = useMemo(() => {
    if (!examData) return [];
    return examData.passages.filter(passage => {
      const diff = passage.difficulty || 'Easy';
      const matchesTab = activeTab === 'All' || diff.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = passage.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            passage.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [examData, activeTab, searchQuery]);

  if (!examData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Exam not found.</h1>
        <button onClick={() => router.push('/typing')} className="text-blue-500 underline hover:text-blue-700">
          Return to Exams
        </button>
      </div>
    );
  }

  // Boolean flag to conditionally show/hide PDF features
  const showPdfFeatures = examId === 'delhi_police_hcm';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 pt-[120px] font-sans">
        
        {/* Top Header Section (Centered Logo & Text) */}
        <div className="flex flex-col items-center text-center mb-10">
          {examData.rules.logo && (
            <div className="h-20 w-20 relative mb-4">
              <Image
                src={examData.rules.logo}
                alt={examData.rules.name}
                fill
                className="object-contain"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-black text-[#6a64f1] uppercase tracking-wide mb-4">
              {examData.rules.name}
            </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Practice for the {examData.rules.name} through our Computer Based Examination (CBE)...
          </p>
        </div>

        {/* Rules Box with "Back to Exams" embedded in top-left */}
        <div className="relative bg-[#f8f9fa] border border-gray-200 rounded-xl p-6 md:p-8 text-center shadow-sm mb-16 max-w-5xl mx-auto">
          
          {/* Embedded Back Button matching "image_9d75dc.png" */}
          <Link 
            href="/typing" 
            className="absolute top-5 left-6 flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors text-sm md:text-base"
          >
            <ArrowLeft size={18} className="mr-1.5" /> Back to Exams
          </Link>

          <div className="flex justify-center items-center gap-4 mb-4 mt-8 md:mt-0">
            <span className="flex items-center text-[#1a73e8] font-bold gap-1.5 text-lg">
              <Info size={20} /> Typing Rules
            </span>
            
            {/* Conditional PDF Button - Only shows for Delhi Police */}
            {showPdfFeatures && (
              <span className="flex items-center text-red-500 font-medium gap-1.5 border border-red-200 bg-red-50 px-3 py-1 rounded cursor-pointer text-sm hover:bg-red-100 transition-colors">
                <FileText size={16} /> Official PDF
              </span>
            )}
          </div>
          
          <p className="text-sm md:text-base text-gray-600 leading-relaxed text-justify md:text-center mt-4">
            {examData.rules.description || `Key Depression: The skill test will involve passages with approximately 2000 key depressions in the text. Time Required: Candidates will have ${examData.rules.duration / 60} minutes to complete the typing test. DEST will be mandatory for all the posts; however, it will be qualifying in nature. For English Typing: ${examData.rules.targetWpm} Words Per Minute (WPM).`}
          </p>
        </div>

        {/* PASSAGES HEADING */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-[#10b981] tracking-tight mb-2">Passages</h2>
          <div className="w-12 h-1.5 bg-[#2563eb] mx-auto rounded-full"></div>
        </div>

        {/* SEARCH AND TABS BAR */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-8 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          
          {/* TABS */}
          <div className="flex flex-wrap gap-3 items-center">
            {TABS.map(tab => {
              const count = getTabCount(tab.id);
              // Hide empty tabs to keep the UI clean (except 'All')
              if (tab.id !== 'All' && count === 0) return null;

              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold transition-all border ${
                    isActive ? tab.activeClass : tab.inactiveClass
                  }`}
                >
                  <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{tab.label}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${isActive ? tab.badgeActive : tab.badgeInactive}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH BOX */}
          <div className="relative w-full xl:w-72 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search passages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5b58f5] focus:border-[#5b58f5] font-medium transition-all shadow-sm"
            />
          </div>
        </div>

        {/* RESTORED PASSAGE CARD GRID */}
        {filteredPassages.length === 0 ? (
          <div className="bg-gray-50 p-12 rounded-2xl border border-gray-200 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No passages found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPassages.map((passage) => {
              const wordCount = passage.text.trim().split(/\s+/).length;
              const diff = passage.difficulty || 'Easy';
              const tabStyle = TABS.find(t => t.id === diff) || TABS[2]; // Fallback to easy
              
              const isCompleted = completedPassages.has(passage.title);

              return (
                <div 
                  key={passage.id} 
                  className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                    isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      {/* Difficulty Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${tabStyle.activeClass}`}>
                        <tabStyle.icon size={12} strokeWidth={2.5} />
                        {tabStyle.label}
                      </span>
                      
                      {/* Completed / Download indicators */}
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-green-200">
                            Completed
                          </span>
                        )}
                        {showPdfFeatures && passage.pdfUrl && (
                          <a
                            href={passage.pdfUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Download PDF"
                          >
                            <FileDown size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">{passage.title}</h3>
                    <p className={`text-sm font-medium line-clamp-2 leading-relaxed mb-4 ${isCompleted ? 'text-gray-600' : 'text-gray-500'}`}>
                      {passage.text}
                    </p>
                    
                    <div className={`flex items-center gap-4 text-xs font-bold ${isCompleted ? 'text-green-700/60' : 'text-gray-400'}`}>
                      <span>{wordCount} Words</span>
                      <span>•</span>
                      <span>{passage.text.length} Keystrokes</span>
                    </div>
                  </div>

                  <div className={`p-4 border-t ${isCompleted ? 'bg-green-100/50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                    <button
                      onClick={() => router.push(`/typing/${examId}/${passage.id}`)}
                      disabled={isLoadingHistory}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
                        isCompleted 
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm border border-green-700' 
                          : 'bg-[#5b58f5] text-white hover:bg-indigo-700 shadow-sm'
                      } ${isLoadingHistory ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isCompleted ? (
                        <>
                          <RefreshCw size={18} strokeWidth={2.5} /> Retake Test
                        </>
                      ) : (
                        <>
                          <Play size={18} strokeWidth={2.5} /> Start Test
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}