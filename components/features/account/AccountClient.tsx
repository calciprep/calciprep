"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import ProfileTab from './ProfileTab';
import SecurityTab from './SecurityTab';
import UpdateProfileModal from './UpdateProfileModal';
import '@/components/features/typing/Tabs.css';

const AccountClient = () => {
  const { currentUser, authLoading, userDataLoading, userData } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const tabsData = [
    { name: 'Profile', icon: UserIcon },
    { name: 'Security', icon: ShieldCheck },
  ];

  useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.style.setProperty('--k', `${activeTab}`);
    }
  }, [activeTab]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    const targetButton = tabsRef.current?.querySelector<HTMLButtonElement>(`#account-tab${index}`);
    targetButton?.focus();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    let nextTab = activeTab;
    if (key === 'ArrowRight') {
      nextTab = (activeTab + 1) % tabsData.length;
    } else if (key === 'ArrowLeft') {
      nextTab = (activeTab - 1 + tabsData.length) % tabsData.length;
    } else if (key === 'Home') {
      nextTab = 0;
    } else if (key === 'End') {
      nextTab = tabsData.length - 1;
    }

    if (nextTab !== activeTab) {
      handleTabClick(nextTab);
    }
  };

  const openUpdateModal = () => {
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };


  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <main className="container mx-auto px-6 pt-28 pb-12 font-sans text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be logged in to view this page.</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Reduced padding py-20 instead of py-28 */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-20" onKeyUp={handleKeyUp}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-800">
          My Account
        </h1>
        {/* Added max-w-3xl and mx-auto to center the tabs container */}
        <section
          className="tabs max-w-3xl mx-auto"
          ref={tabsRef}
          style={{ '--n': tabsData.length, '--k': activeTab, '--u': 5 } as React.CSSProperties}
        >
          <nav className="tablist" role="tablist" aria-label="Account Settings">
            {tabsData.map((tab, i) => {
              const Icon = tab.icon;
              return (
                  <button
                      key={i}
                      role="tab"
                      id={`account-tab${i}`}
                      aria-controls={`account-panel${i}`}
                      aria-selected={activeTab === i}
                      tabIndex={activeTab === i ? 0 : -1}
                      onClick={() => handleTabClick(i)}
                      className="flex items-center gap-2"
                  >
                      <Icon size={16} />
                      {tab.name}
                  </button>
              );
            })}
          </nav>
          {tabsData.map((tab, i) => (
            <div
              key={i}
              role="tabpanel"
              id={`account-panel${i}`}
              aria-labelledby={`account-tab${i}`}
              aria-hidden={activeTab !== i}
            >
              <div className="back" aria-hidden="true"></div>
              {/* Reduced padding in content p-6 */}
              <div className="content p-6">
                {activeTab === i && (
                  <>
                    {userDataLoading && (
                       <div className="flex justify-center items-center min-h-[200px]">
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                       </div>
                    )}
                    {!userDataLoading && i === 0 && <ProfileTab onOpenUpdateModal={openUpdateModal} />}
                    {!userDataLoading && i === 1 && <SecurityTab />}
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
         <svg width="0" height="0" aria-hidden="true">
            <filter id="roundstroke" colorInterpolationFilters="sRGB">
                <feComponentTransfer>
                    <feFuncA type="table" tableValues="0 1 0"></feFuncA>
                </feComponentTransfer>
                <feMorphology operator="dilate" radius="10" result="line"></feMorphology>
                <feComponentTransfer in="SourceGraphic">
                    <feFuncA type="table" tableValues="0 0 1"></feFuncA>
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="5" result="blur"></feGaussianBlur>
                <feComponentTransfer result="fill">
                    <feFuncA type="table" tableValues="-3 6"></feFuncA>
                </feComponentTransfer>
                <feComponentTransfer in="blur">
                    <feFuncA type="table" tableValues="-5 5 -5"></feFuncA>
                </feComponentTransfer>
                <feComposite in="line" operator="in"></feComposite>
                <feBlend in="fill"></feBlend>
            </filter>
        </svg>
      </main>
      <UpdateProfileModal isOpen={isUpdateModalOpen} onClose={closeUpdateModal} />
    </>
  );
};

export default AccountClient;

