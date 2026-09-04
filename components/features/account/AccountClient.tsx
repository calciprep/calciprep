"use client";

import React, { useState } from 'react';
import { User, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SecurityTab from './SecurityTab';
import ProfileTab from './ProfileTab';

export default function AccountClient() {
  const { currentUser, authLoading, openModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  if (authLoading) {
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
          <p className="text-slate-500 mb-6">You need an account to access settings.</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pt-[40px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Account</h1>
          <p className="text-slate-500 mt-1">Manage your profile details and security settings.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-2">
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
            {activeTab === 'profile' && (
               <div className="animate-in fade-in duration-300">
                  <ProfileTab />
               </div>
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

// --- HELPER COMPONENT ---
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