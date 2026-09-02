'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/common/AuthModal';
import {
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Using 'as any' to safely bypass TypeScript checks for your context methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, logout, openModal, setLoginMode } = useAuth() as any;

  // Automatically close menu when you click a link
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to ensure scrolling is restored if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Prevent scroll propagation from sidebar to background page
  useEffect(() => {
    const scrollableElement = document.querySelector('.sidebar-scrollable');
    if (!scrollableElement) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleWheel = (e: any) => {
      e.stopPropagation();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTouchMove = (e: any) => {
      e.stopPropagation();
    };

    scrollableElement.addEventListener('wheel', handleWheel, { passive: true });
    scrollableElement.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      scrollableElement.removeEventListener('wheel', handleWheel);
      scrollableElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Triggers your global AuthContext
  const handleOpenAuth = (view: 'signin' | 'signup') => {
    if (setLoginMode) setLoginMode(view === 'signin');
    if (openModal) openModal();
    setIsOpen(false); // Close menu if open
  };

  // Structured Navigation Links
  const navSections = [
    {
      title: 'MENU',
      items: [
        { label: 'Home', href: '/', icon: '/media/nav/home-nav.svg' },
        { label: 'Dashboard', href: '/account', icon: '/media/nav/dashboard-nav.svg' },
        { label: 'Contact', href: '/#contact', icon: '/media/nav/contact-nav.svg' },
      ]
    },
    {
      title: 'PRACTICE HUB',
      items: [
        { label: 'Typing', href: '/typing', icon: '/media/nav/typing-nav.svg' },
        { label: 'Mathematics', href: '/maths', icon: '/media/nav/maths-nav.svg' },
        { label: 'English', href: '/english', icon: '/media/nav/english-nav.svg' },
      ]
    },
    {
      title: 'RESOURCES',
      items: [
        { label: 'Terms', href: '/terms-conditions', icon: '/media/nav/terms-nav.svg' },
        { label: 'Privacy', href: '/privacy-policy', icon: '/media/nav/privacy-nav.svg' },
      ]
    }
  ];

  // The Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 flex-shrink-0 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/media/New-logo.svg"
            alt="CalciPrep"
            className="w-auto h-8"
          />
        </Link>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links Area */}
      {/* FIXED: Added data-lenis-prevent="true" and overscroll-contain so the smooth scroller ignores this box! */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain py-6 px-4 scrollbar-thin scrollbar-thumb-slate-200 sidebar-scrollable"
        data-lenis-prevent="true"
      >
        {navSections.map((section, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="px-3 mb-3 text-xs font-extrabold tracking-[0.18em] text-slate-700 uppercase">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href) && !item.href.includes('#'));
                
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-bold ${
                      isActive
                        ? 'bg-slate-900/5 text-slate-900 shadow-sm'
                        : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className={`h-5 w-5 ${isActive ? 'opacity-100' : 'opacity-90'}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Authentication Section at bottom - flex-shrink-0 keeps it sticky */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
        {currentUser ? (
          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Link href="/account" className="flex items-center gap-3 flex-1 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0 uppercase">
                {currentUser.email?.[0] || <User size={20} />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-extrabold text-slate-900 truncate">My Account</span>
                <span className="text-xs font-medium text-slate-700 truncate">{currentUser.email}</span>
              </div>
            </Link>
            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 flex-shrink-0 ml-2"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleOpenAuth('signin')}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25"
          >
            Login / Register
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Universal Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 md:px-8 shadow-sm">
        
        {/* Left Side: Hamburger Menu */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-slate-900 hover:text-slate-950 transition-colors flex items-center gap-2"
        >
          <Menu size={28} />
          <span className="hidden md:inline font-extrabold text-sm tracking-[0.18em] uppercase text-slate-900">Menu</span>
        </button>

        {/* Right Side: Logo */}
        <Link href="/" className="flex items-center">
          <img
            src="/media/New-logo.svg"
            alt="CalciPrep"
            className="w-auto h-7 md:h-8"
          />
        </Link>
      </div>

      {/* Dark Overlay (Visible on all screens when menu is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 pointer-events-auto"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Retractable Sidebar (h-[100dvh] ensures perfect scrolling) */}
      {/* FIXED: Also added data-lenis-prevent here to block background scrolling perfectly */}
      <nav
        className={`fixed top-0 left-0 h-[100dvh] w-[280px] z-50 transform transition-transform duration-300 ease-in-out pointer-events-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-lenis-prevent="true"
      >
        <SidebarContent />
      </nav>

      <AuthModal />
    </>
  );
}