'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/common/AuthModal';
import { User, ChevronDown, Menu, X, LogOut, Settings, ShieldCheck, LifeBuoy } from 'lucide-react';
import gsap from 'gsap';

// Updated Nav Items: Removed Maths/English, Added Image Resizer
const navItems = [
  { label: 'Home', href: '/', icon: '/media/nav/home-nav.svg', bgColor: 'bg-white', textColor: 'text-slate-900' },
  { label: 'Typing', href: '/typing', icon: '/media/nav/typing-nav.svg', bgColor: 'bg-[#E25E3E]', textColor: 'text-white' },
  { label: 'Image Resizer', href: '/tools/image-resizer', icon: '/media/nav/image-nav.svg', bgColor: 'bg-[#ADD8E6]', textColor: 'text-slate-900' },
  { label: 'Live Tests', href: '/live-tests', icon: '/media/nav/live-tests-nav.svg', bgColor: 'bg-[#C1E1C1]', textColor: 'text-slate-900' }, 
  { label: 'Dashboard', href: '/dashboard', icon: '/media/nav/dashboard-nav.svg', bgColor: 'bg-[#E6E6FA]', textColor: 'text-slate-900' },
  { label: 'Support', href: '/support', icon: '/media/nav/contact-nav.svg', bgColor: 'bg-[#FDFD96]', textColor: 'text-slate-900' },
];

// Extracted Component to safely handle hooks for GSAP animations
const DesktopNavItem = ({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) => {
  const iconRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = () => {
    if (!isActive) {
      gsap.to(iconRef.current, { y: -2, scale: 1.1, rotation: 5, duration: 0.25, ease: 'back.out(2)' });
    }
  };

  const handleMouseLeave = () => {
    if (!isActive) {
      gsap.to(iconRef.current, { y: 0, scale: 1, rotation: 0, duration: 0.25, ease: 'power2.out' });
    }
  };

  // Clean flat design: Just a simple hover lift instead of bulky block shadows
  const activeStyle = isActive 
    ? "opacity-100" 
    : "hover:-translate-y-1 hover:shadow-sm";

  return (
    <Link
      href={item.href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`shrink-0 flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-4 py-1.5 xl:py-2 border-[2.5px] border-black rounded-full transition-all ${item.bgColor} ${activeStyle}`}
    >
      <img 
        ref={iconRef} 
        src={item.icon} 
        alt="" 
        className={`w-4 h-4 xl:w-[18px] xl:h-[18px] object-contain ${item.textColor === 'text-white' ? 'brightness-0 invert' : ''}`} 
      />
      <span className={`whitespace-nowrap text-[11px] xl:text-sm font-extrabold tracking-wide ${item.textColor}`}>
        {item.label}
      </span>
    </Link>
  );
};

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
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b-[2.5px] border-black z-40 px-4 md:px-8 font-sans">
        <div className="w-full max-w-screen-2xl mx-auto h-full flex items-center justify-between gap-2">
          
          {/* 1. Logo & Mobile Hamburger */}
          <div className="flex items-center justify-start gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-black hover:bg-slate-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
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
          <div className="hidden lg:flex flex-1 items-center justify-center gap-1.5 xl:gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href) && !item.href.includes('#'));
              return <DesktopNavItem key={item.label} item={item} isActive={isActive} />;
            })}
          </div>

          {/* 3. Account / Dropdown / Login */}
          <div className="flex items-center justify-end">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-white border-[2.5px] border-black rounded-full hover:-translate-y-1 transition-all shrink-0"
                >
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-black" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-black bg-[#FDFD96] text-black flex items-center justify-center font-bold uppercase text-xs">
                      {currentUser.displayName?.[0] || currentUser.email?.[0] || <User size={16} />}
                    </div>
                  )}
                  <span className="text-sm font-extrabold text-[#000000] hidden sm:block max-w-[100px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={16} strokeWidth={2.5} className={`text-black transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white border-[3px] border-black rounded-xl py-2 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b-[2.5px] border-black bg-[#ADD8E6] mb-1">
                      <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-black text-slate-900 truncate">{currentUser.email}</p>
                    </div>

                    {currentUser.email === 'calciprep@gmail.com' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-[#FDFD96] transition-colors border-b-[2.5px] border-transparent hover:border-black"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <ShieldCheck size={18} strokeWidth={2.5} /> Admin Panel
                      </Link>
                    )}

                    <Link 
                      href="/account" 
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-[#F9C5D1] transition-colors border-b-[2.5px] border-transparent hover:border-black"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={18} strokeWidth={2.5} /> Account
                    </Link>

                    <Link 
                      href="/support" 
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-[#C1E1C1] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LifeBuoy size={18} strokeWidth={2.5} /> Support
                    </Link>

                    <div className="border-t-[2.5px] border-black my-1"></div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-extrabold text-left text-white bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <LogOut size={18} strokeWidth={2.5} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3">
                <button
                  onClick={() => handleOpenAuth('signin')}
                  className="px-4 py-2 bg-white border-[2.5px] border-black rounded-full hover:-translate-y-1 transition-all text-xs xl:text-sm font-extrabold text-black hidden sm:block shrink-0"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('signup')}
                  className="px-4 py-2 bg-[#FDFD96] border-[2.5px] border-black rounded-full hover:-translate-y-1 transition-all text-xs xl:text-sm font-extrabold text-black shrink-0"
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

          <div ref={mobileMenuRef} className="absolute top-0 left-0 w-[300px] h-full bg-[#FDFBF7] border-r-[3px] border-black z-10 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b-[3px] border-black bg-white">
              <span className="text-2xl font-black text-slate-900 font-serif">Menu</span>
              <button onClick={closeMobileMenu} className="p-2 border-[2.5px] border-black rounded-full text-black hover:bg-red-400 hover:text-white transition-colors" aria-label="Close Menu">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div ref={mobileLinksRef} className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={closeMobileMenu} className={`flex items-center gap-3 py-3 px-4 border-[2.5px] border-black rounded-xl hover:-translate-y-1 transition-transform ${item.bgColor}`}>
                  <img src={item.icon} alt="" className={`w-6 h-6 object-contain ${item.textColor === 'text-white' ? 'brightness-0 invert' : ''}`} />
                  <span className={`whitespace-nowrap text-lg font-extrabold tracking-wide ${item.textColor}`}>
                    {item.label}
                  </span>
                </Link>
              ))}

              {currentUser?.email === 'calciprep@gmail.com' && (
                <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 py-3 px-4 mt-2 border-[2.5px] border-black rounded-xl bg-[#FDFD96] hover:-translate-y-1 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-black" strokeWidth={2.5} />
                  <span className="whitespace-nowrap text-lg font-extrabold text-black tracking-wide">Admin Panel</span>
                </Link>
              )}

              <hr className="border-t-[3px] border-black my-4" />

              {!currentUser ? (
                <div className="flex flex-col gap-4">
                  <button onClick={() => { closeMobileMenu(); handleOpenAuth('signin'); }} className="w-full py-3 bg-white border-[2.5px] border-black text-[#000000] font-extrabold rounded-xl text-center text-lg hover:-translate-y-1 transition-transform">
                    Sign In
                  </button>
                  <button onClick={() => { closeMobileMenu(); handleOpenAuth('signup'); }} className="w-full py-3 bg-[#E25E3E] border-[2.5px] border-black text-white font-extrabold rounded-xl text-center text-lg hover:-translate-y-1 transition-transform">
                    Get Started
                  </button>
                </div>
              ) : (
                <button onClick={() => { closeMobileMenu(); logout(); }} className="flex items-center gap-3 py-3 px-4 border-[2.5px] border-black rounded-xl bg-red-500 text-white font-extrabold text-lg text-left hover:-translate-y-1 transition-transform">
                  <LogOut size={20} strokeWidth={2.5} /> Logout
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