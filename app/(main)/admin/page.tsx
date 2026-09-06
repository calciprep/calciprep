'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Settings, Users, Trophy, Save, Inbox, FileText } from 'lucide-react';

import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import LeaderboardsTab from './tabs/LeaderboardsTab';
import InboxTab from './tabs/InboxTab';
import CMSTab from './tabs/CMSTab';

export default function AdminDashboard() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser } = useAuth() as any;
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'leaderboards' | 'inbox' | 'cms'>('overview');

  // Lifted saving states so the main page can control the Publish button!
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // SECURITY CHECK
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.email !== 'calciprep@gmail.com') {
      router.push('/');
    } else {
      setLoading(false);
    }
  }, [currentUser, router]);

  if (loading || currentUser?.email !== 'calciprep@gmail.com') {
    return <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-[100px] pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* HEADER AREA */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
          Admin Command Center
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Manage your platform, users, support, and content.</p>
      </div>

      {/* ACTION BAR: Tabs & Publish Button on the SAME LINE */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* VIBRANT YELLOW TAB SWITCHER */}
        <div className="flex items-center gap-2 bg-amber-100 p-2 rounded-2xl shadow-sm border border-amber-200 inline-flex w-full xl:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-emerald-500 text-white shadow-md' : 'text-amber-800 hover:bg-amber-200/60'
            }`}
          >
            <Settings size={16} /> Overview
          </button>
          
          <button 
            onClick={() => setActiveTab('users')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-indigo-500 text-white shadow-md' : 'text-amber-800 hover:bg-amber-200/60'
            }`}
          >
            <Users size={16} /> User Management
          </button>
          
          <button 
            onClick={() => setActiveTab('leaderboards')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'leaderboards' ? 'bg-cyan-500 text-white shadow-md' : 'text-amber-800 hover:bg-amber-200/60'
            }`}
          >
            <Trophy size={16} /> Leaderboards
          </button>

          <button 
            onClick={() => setActiveTab('inbox')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'inbox' ? 'bg-rose-500 text-white shadow-md' : 'text-amber-800 hover:bg-amber-200/60'
            }`}
          >
            <Inbox size={16} /> Support Inbox
          </button>

          <button 
            onClick={() => setActiveTab('cms')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'cms' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-amber-800 hover:bg-amber-200/60'
            }`}
          >
            <FileText size={16} /> Passage Manager
          </button>
        </div>

        {/* COLORFUL PUBLISH BUTTON (Only visible on Overview tab) */}
        {activeTab === 'overview' && (
          <button 
            onClick={() => document.getElementById('hidden-save-btn')?.click()}
            disabled={isSaving} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200/50 disabled:opacity-70 w-full xl:w-auto shrink-0"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Deploying...' : 'Publish Changes'}
          </button>
        )}
      </div>

      {/* SAVE NOTIFICATION */}
      {saveMessage && activeTab === 'overview' && (
        <div className="max-w-7xl mx-auto bg-emerald-100 text-emerald-800 p-4 rounded-xl font-bold border border-emerald-200 mb-6 animate-in fade-in">
          {saveMessage}
        </div>
      )}

      {/* MODULAR TAB RENDERING */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && <OverviewTab setSaveState={setIsSaving} setSaveMsg={setSaveMessage} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'leaderboards' && <LeaderboardsTab />}
        {activeTab === 'inbox' && <InboxTab />}
        {activeTab === 'cms' && <CMSTab />}
      </div>

    </div>
  );
}