'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/common/AuthModal';
import { User, ChevronDown, Menu, X, LogOut, Settings, ShieldCheck, LifeBuoy } from 'lucide-react';
import gsap from 'gsap';

const navItems = [
  { label: 'Home', href: '/', icon: '/media/nav/home-nav.svg' },
  { label: 'Typing', href: '/typing', icon: '/media/nav/typing-nav.svg' },
  { label: 'Mathematics', href: '/maths', icon: '/media/nav/maths-nav.svg' }, 
  { label: 'English', href: '/english', icon: '/media/nav/english-nav.svg' },
  { label: 'Live Tests', href: '/live-tests', icon: '/media/nav/live-tests-nav.svg' }, 
  { label: 'Dashboard', href: '/dashboard', icon: '/media/nav/dashboard-nav.svg' },
  { label: 'Support', href: '/support', icon: '/media/nav/contact-nav.svg' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { currentUser, logout, openModal, setLoginMode } = useAuth() as any;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
        mobileMenuRef.current,
        { x: '-100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        mobileLinksRef.current?.children || [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.1, ease: 'power2.out' }
      );
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    gsap.to(mobileMenuRef.current, {
      x: '-100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => setIsMobileMenuOpen(false)
    });
  };

  const handleOpenAuth = (view: 'signin' | 'signup') => {
    if (setLoginMode) setLoginMode(view === 'signin');
    if (openModal) openModal();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200 shadow-sm z-40 px-4 md:px-8 font-sans">
        <div className="w-full max-w-screen-2xl mx-auto h-full flex items-center justify-between">
          
          {/* 1. Logo & Mobile Hamburger */}
          <div className="flex-1 flex items-center justify-start gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-black hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <Menu size={26} strokeWidth={2.5} />
            </button>

            <Link href="/" className="flex items-center flex-shrink-0">
              <img
                src="/media/New-logo.svg"
                alt="CalciPrep"
                className="w-auto h-7 md:h-8"
              />
            </Link>
          </div>

          {/* 2. Desktop Navigation Links */}
          <div className="flex-1 hidden lg:flex items-center justify-center gap-5 xl:gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href) && !item.href.includes('#'));
              
              const iconRef = useRef<HTMLImageElement>(null);
              const textRef = useRef<HTMLSpanElement>(null);

              const handleMouseEnter = () => {
                gsap.to(iconRef.current, { y: -3, scale: 1.15, rotation: 5, duration: 0.25, ease: 'back.out(2)' });
                gsap.to(textRef.current, { color: '#2563eb', scale: 1.05, duration: 0.25, ease: 'power2.out' });
              };

              const handleMouseLeave = () => {
                gsap.to(iconRef.current, { y: 0, scale: 1, rotation: 0, duration: 0.25, ease: 'power2.out' });
                gsap.to(textRef.current, { color: '#000000', scale: 1, duration: 0.25, ease: 'power2.out' });
              };

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="flex items-center gap-2.5 py-2 px-1 cursor-pointer text-decoration-none"
                >
                  <img ref={iconRef} src={item.icon} alt="" className="w-5 h-5 object-contain" />
                  <span 
                    ref={textRef} 
                    className={`whitespace-nowrap text-base font-extrabold tracking-wide transition-colors ${
                      isActive ? 'text-blue-600' : 'text-[#000000]'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* 3. Account / Dropdown / Login */}
          <div className="flex-1 flex items-center justify-end">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold uppercase text-xs">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || <User size={16} />}
                    </div>
                  )}
                  <span className="text-sm font-extrabold text-[#000000] hidden sm:block max-w-[120px] truncate px-1">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={16} className={`text-black transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 shadow-xl rounded-2xl py-2 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-black text-slate-900 truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.email === 'calciprep@gmail.com' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-indigo-700 hover:bg-indigo-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ShieldCheck size={16} /> Admin Panel
                      </Link>
                    )}

                    <Link 
                      href="/account" 
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} /> Account
                    </Link>

                    {/* NEW: Direct Link to Support & Ticket History */}
                    <Link 
                      href="/support" 
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LifeBuoy size={16} /> Support & Queries
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm font-extrabold text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenAuth('signin')}
                  className="text-sm font-extrabold text-[#000000] hover:text-blue-600 transition-colors px-3 py-2 hidden sm:block"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-5 py-2.5 bg-slate-900 text-white text-sm font-extrabold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden font-sans">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMobileMenu} />

          <div ref={mobileMenuRef} className="absolute top-0 left-0 w-[300px] h-full bg-white shadow-2xl z-10 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <span className="text-xl font-black text-slate-900">Menu</span>
              <button onClick={closeMobileMenu} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-black transition-colors" aria-label="Close Menu">
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            <div ref={mobileLinksRef} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={closeMobileMenu} className="flex items-center gap-3 py-2">
                  <img src={item.icon} alt="" className="w-6 h-6 object-contain" />
                  <span className="whitespace-nowrap text-lg font-extrabold text-[#000000] tracking-wide">
                    {item.label}
                  </span>
                </Link>
              ))}

              {currentUser?.email === 'calciprep@gmail.com' && (
                <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 py-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <span className="whitespace-nowrap text-lg font-extrabold text-indigo-700 tracking-wide">Admin Panel</span>
                </Link>
              )}

              <hr className="border-slate-100 my-2" />

              {!currentUser ? (
                <div className="flex flex-col gap-3 mt-2">
                  <button onClick={() => { closeMobileMenu(); handleOpenAuth('signin'); }} className="w-full py-3 bg-slate-100 text-[#000000] font-extrabold rounded-xl text-center">
                    Sign In
                  </button>
                  <button onClick={() => { closeMobileMenu(); handleOpenAuth('signup'); }} className="w-full py-3 bg-slate-900 text-white font-extrabold rounded-xl text-center shadow-sm">
                    Get Started
                  </button>
                </div>
              ) : (
                <button onClick={() => { closeMobileMenu(); logout(); }} className="flex items-center gap-3 py-2 text-red-600 font-extrabold text-lg text-left">
                  <LogOut size={20} /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal />
    </>
  );
}