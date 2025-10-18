import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X, User } from 'lucide-react';

const Header = () => {
  const { currentUser, openModal, logout } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isAccountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const lastScrollTop = useRef(0);
  const accountMenuRef = useRef(null); // Ref to detect outside clicks

  const location = useLocation();
  const isSubPage = location.pathname !== '/' && location.pathname !== '/index.html';

  // Effect to handle closing the account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    // Add event listener when the menu is open
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  // Smooth scrolling for homepage anchors
  const handleSmoothScroll = (e, targetId) => {
    if (location.pathname === '/' || location.pathname === '/index.html') {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };
  
  // Back link logic
  const getBackLink = () => {
      const { pathname, search } = location;
      const params = new URLSearchParams(search);
      const category = params.get('category');

      if (pathname === '/quiz-list.html') return '/english.html';
      if (pathname === '/quiz.html' && category) return `/quiz-list.html?category=${encodeURIComponent(category)}`;
      if (['/english.html', '/maths.html', '/typing-selection.html', '/account.html'].includes(pathname)) return '/';
      if (['/learn-typing.html', '/typing.html'].includes(pathname)) return '/typing-selection.html';
      return '/';
  };

  // Scroll handler for mobile header visibility and closing the menu
  useEffect(() => {
    const handleScroll = () => {
      // Close the menu on scroll if it's open
      if (isMenuOpen) {
        setMenuOpen(false);
      }

      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop.current && scrollTop > 100) {
        setIsVisible(false); // Scrolling Down
      } else {
        setIsVisible(true); // Scrolling Up
      }
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]); // Re-attach listener when isMenuOpen changes

  return (
    <header 
      id="app-header" 
      className={`fixed top-4 inset-x-0 z-50 px-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-[120%]'}`}
    >
      <div className={`max-w-7xl mx-auto bg-white/40 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 ease-in-out ${isMenuOpen ? 'rounded-3xl' : 'rounded-full'}`}>
        <div className="flex justify-between items-center h-14 px-4 sm:px-6 py-2">
            
            <div className="flex-1 flex justify-start items-center space-x-2">
                {isSubPage && (
                    <Link to={getBackLink()} className="p-2 rounded-full hover:bg-gray-200/50 transition-colors hidden md:inline-flex" title="Go Back">
                        <ArrowLeft />
                    </Link>
                )}
                <Link to="/" className="flex items-center flex-shrink-0">
                    <img src="/media/New-logo.svg" alt="CalciPrep Logo" className="h-10 w-auto" />
                </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link to="/#subjects" onClick={(e) => handleSmoothScroll(e, 'subjects')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Subjects</Link>
                <Link to="/#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Features</Link>
                <Link to="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-gray-700 hover:text-gray-900 transition-colors text-base font-medium">Contact</Link>
            </nav>

            <div className="flex-1 flex justify-end items-center">
                <div className="hidden md:flex items-center space-x-2">
                    {currentUser ? (
                      <div className="relative" ref={accountMenuRef}>
                        <button onClick={() => setAccountMenuOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors cursor-pointer">
                           <User />
                        </button>
                        {isAccountMenuOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[9999] top-full border border-gray-200">
                            <Link to="/account.html" onClick={() => setAccountMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                            <button onClick={() => { logout(); setAccountMenuOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => openModal(true)} className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-full text-sm">Sign In</button>
                        <button onClick={() => openModal(false)} className="bg-purple-600 text-white px-4 py-2 rounded-full transition-colors text-sm font-medium">Sign Up</button>
                      </div>
                    )}
                </div>
                <button onClick={() => setMenuOpen(!isMenuOpen)} id="mobile-menu-button" className="md:hidden text-gray-700 p-2">
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </div>

        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2 pb-4 px-4 font-sans">
                {isSubPage && (
                    <div className="pb-2 mb-2 border-b border-gray-200/80">
                         <Link to={getBackLink()} onClick={() => setMenuOpen(false)} className="flex items-center text-lg font-semibold text-gray-800 hover:bg-gray-100/50 px-3 py-3 rounded-xl">
                            <ArrowLeft className="w-5 h-5 mr-3" />
                             Back
                         </Link>
                    </div>
                )}
                <Link to="/#home" onClick={(e) => handleSmoothScroll(e, 'home')} className="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Home</Link>
                <Link to="/#subjects" onClick={(e) => handleSmoothScroll(e, 'subjects')} className="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Subjects</Link>
                <Link to="/#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Features</Link>
                <Link to="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="block py-3 px-3 text-lg text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100/50">Contact Us</Link>
                <div className="border-t border-gray-200/80 mt-2 pt-4">
                  {currentUser ? (
                    <div>
                      <p className="px-3 py-2 text-sm text-gray-500 truncate">{currentUser.email}</p>
                      <div className="flex gap-3 mt-2">
                        <Link to="/account.html" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-gray-700 bg-gray-100 hover:bg-gray-200/80 font-medium py-3 rounded-xl border border-gray-200 text-base">My Account</Link>
                        <button onClick={() => { logout(); setMenuOpen(false); }} className="flex-1 text-center bg-red-600 text-white py-3 rounded-xl transition-opacity hover:bg-red-700 text-base font-medium">Logout</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-2">
                        <button onClick={() => { openModal(true); setMenuOpen(false); }} className="flex-1 text-center text-gray-700 bg-gray-100 hover:bg-gray-200/80 font-medium py-3 rounded-xl border border-gray-200 text-base">Sign In</button>
                        <button onClick={() => { openModal(false); setMenuOpen(false); }} className="flex-1 text-center bg-purple-600 text-white px-5 py-3 rounded-xl transition-opacity hover:opacity-90 text-base">Sign Up</button>
                    </div>
                  )}
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

