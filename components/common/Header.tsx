"use client";

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import HamburgerIcon from './HamburgerIcon';
import MobileMenu from './MobileMenu';
import AnimatedButton from '../ui/AnimatedButton';
import { LenisContext } from '@/components/common/LenisProvider';
import Image from 'next/image'; // Import Next.js Image

const Header = () => {
  const { currentUser, openModal, logout } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [backLink, setBackLink] = useState('/');

  const lastScrollTop = useRef(0);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const lenis = useContext(LenisContext);

  const pathname = usePathname();
  const isSubPage = pathname !== '/';

  // Effect to handle closing the account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  // Effect to determine the correct "back" link
  useEffect(() => {
    // Ensure window is defined (runs only on client-side)
    if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const category = searchParams.get('category');

        let link = '/';
        if (pathname === '/english/quiz-list') {
        link = '/english';
        } else if (pathname === '/english/quiz' && category) {
        link = `/english/quiz-list?category=${encodeURIComponent(category)}`;
        } else if (['/english', '/maths', '/typing', '/account'].includes(pathname)) {
        link = '/';
        } else if (['/typing/learn', '/typing/test'].includes(pathname)) {
        link = '/typing';
        } else if (pathname === '/maths/games') {
            link = '/maths';
        }
        setBackLink(link);
    }
  }, [pathname]);

  // This effect handles scrolling to a hash link when navigating from another page.
  useEffect(() => {
    // Ensure window is defined
    if (lenis && typeof window !== 'undefined' && window.location.hash) {
      const timeoutId = setTimeout(() => {
        lenis.scrollTo(window.location.hash, { offset: -80 });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [lenis, pathname]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMenuOpen(false);

    // Only intercept and smooth-scroll if we are on the homepage and lenis is available.
    if (pathname === '/' && lenis) {
      e.preventDefault();
      const targetSelector = targetId === 'home' ? 0 : `#${targetId}`;
      lenis.scrollTo(targetSelector, { offset: -80 });
    }
  };

  // Scroll handler for mobile header visibility
  useEffect(() => {
    // Ensure window is defined
    if (typeof window !== 'undefined') {
        const handleScroll = () => {
            if (window.innerWidth >= 768) {
                setIsVisible(true);
                return;
            }
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop.current && scrollTop > 100) {
                setIsVisible(false); // Scrolling Down
            } else {
                setIsVisible(true); // Scrolling Up
            }
            // Ensure scrollTop is non-negative
            lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []); // Empty dependency array as it only needs to run once

  return (
    <>
      <header
        id="app-header"
        className={`fixed top-4 inset-x-0 z-[102] px-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-[120%]'}`}
      >
        <div className={`max-w-7xl mx-auto bg-white/40 backdrop-blur-xl border border-white/20 shadow-lg rounded-full`}>
          <div className="flex justify-between items-center h-14 px-4 sm:px-6 py-2">

              <div className="flex-1 flex justify-start items-center space-x-2">
                  {isSubPage && (
                      <Link href={backLink} className="p-2 rounded-full hover:bg-gray-200/50 transition-colors hidden md:inline-flex" title="Go Back">
                          <ArrowLeft />
                      </Link>
                  )}
                  <Link href="/" className="flex items-center flex-shrink-0">
                      {/* Use Next.js Image component */}
                      <Image
                          src="/media/New-logo.svg"
                          alt="CalciPrep Logo"
                          width={160} // Provide appropriate width based on original logo size
                          height={40} // Provide appropriate height based on original logo size
                          className="h-10 w-auto" // Keep existing classes for sizing control
                          priority // Added priority as it's likely part of the LCP
                      />
                  </Link>
              </div>

              <nav className="hidden md:flex items-center space-x-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Link href="/#home" onClick={(e) => handleSmoothScroll(e, 'home')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Home</Link>
                  <Link href="/#subjects" onClick={(e) => handleSmoothScroll(e, 'subjects')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Subjects</Link>
                  <Link href="/#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Features</Link>
                  <Link href="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Contact</Link>
              </nav>

              <div className="flex-1 flex justify-end items-center">
                  <div className="hidden md:flex items-center space-x-2">
                      {currentUser ? (
                        <div className="relative" ref={accountMenuRef}>
                          <button onClick={() => setAccountMenuOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors cursor-pointer overflow-hidden"> {/* Added overflow-hidden */}
                            {currentUser.photoURL ? (
                                /* Use Next.js Image for user photo */
                                <Image
                                    src={currentUser.photoURL}
                                    alt="User"
                                    width={40} // Match button size
                                    height={40} // Match button size
                                    className="w-full h-full object-cover" // Keep existing classes
                                />
                             ) : <User />}
                          </button>
                          {isAccountMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] top-full border border-gray-200">
                              <Link href="/account" onClick={() => setAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                              <button onClick={() => { logout(); setAccountMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <AnimatedButton onClick={() => openModal(true)} color="secondary" className="px-4 py-2 text-sm rounded-full">Sign In</AnimatedButton>
                          <AnimatedButton onClick={() => openModal(false)} color="primary" className="px-4 py-2 text-sm rounded-full">Sign Up</AnimatedButton>
                        </div>
                      )}
                  </div>
                  <div className="md:hidden">
                    <HamburgerIcon isOpen={isMenuOpen} onClick={() => setMenuOpen(!isMenuOpen)} />
                  </div>
              </div>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} handleSmoothScroll={handleSmoothScroll} />
    </>
  );
};

export default Header;

