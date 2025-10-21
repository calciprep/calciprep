"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useAuth } from '@/contexts/AuthContext';
import AnimatedButton from '../ui/AnimatedButton';
import { TwitterIcon, YouTubeIcon, TelegramIcon } from './SocialMediaIcons';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    handleSmoothScroll: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, handleSmoothScroll }) => {
    const menuContainerRef = useRef<HTMLDivElement>(null);
    const topBgRef = useRef<HTMLElement>(null);
    const middleBgRef = useRef<HTMLElement>(null);
    const bottomBgRef = useRef<HTMLElement>(null);
    const finalBgRef = useRef<HTMLDivElement>(null);
    const menuLinksRef = useRef<HTMLUListElement>(null);
    const pathname = usePathname();

    const tl = useRef<gsap.core.Timeline | null>(null);

    const { currentUser, openModal, logout } = useAuth();

    useEffect(() => {
        tl.current = gsap.timeline({
            paused: true,
            onReverseComplete: () => {
                gsap.set(menuContainerRef.current, { visibility: 'hidden' });
            }
        });

        // Build the animation sequence
        tl.current
            .set(menuContainerRef.current, { visibility: 'visible' })
            .to(topBgRef.current, { y: '0%', duration: 0.8, ease: 'power4.inOut' })
            .to(middleBgRef.current, { scaleY: 1, duration: 0.8, ease: 'power4.inOut' }, "-=0.7") // Overlap animations
            .to(bottomBgRef.current, { y: '0%', duration: 0.8, ease: 'power4.inOut' }, "-=0.7") // Overlap animations
            .to(finalBgRef.current, { opacity: 1, duration: 0.4, ease: 'power2.in' }, "-=0.5")
            .fromTo(menuLinksRef.current,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: 'power4.out' },
                "-=0.2"
            );

    }, []);

    useEffect(() => {
        if (isOpen) {
            tl.current?.play();
        } else {
            tl.current?.reverse();
        }
    }, [isOpen]);

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        if (pathname === '/') {
            handleSmoothScroll(e, targetId);
        }
        onClose();
    }

    return (
        <>
            <style jsx>{`
                .menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 100;
                    visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .menu-bg {
                    position: absolute;
                    display: block;
                    width: 300vw; /* Make panels extremely wide */
                    height: 150vh; /* Make panels extra tall */
                }
                .bg-top {
                    background-color: #8B5CF6; /* Purple */
                    left: -50%;
                    top: -25%;
                    transform: rotate(-45deg) translateY(-100%);
                }
                .bg-middle {
                    background-color: #3B82F6; /* Blue */
                    left: -100%;
                    top: -25%;
                    transform: rotate(-45deg) scaleY(0);
                }
                .bg-bottom {
                    background-color: #FBBF24; /* Amber */
                    left: -50%;
                    bottom: -25%;
                    top: auto;
                    transform: rotate(-45deg) translateY(100%);
                }
                .final-bg {
                    position: absolute;
                    inset: 0;
                    background-color: white;
                    opacity: 0;
                    z-index: 101;
                }
                .menu-links {
                    position: relative;
                    z-index: 102;
                    text-align: center;
                    opacity: 0;
                    list-style: none;
                    padding: 0;
                }
                .menu-links li { padding: 10px 0; }
                .menu-links a {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    text-decoration: none;
                    padding: 8px 0;
                    position: relative;
                }
                .menu-links a:hover::before { transform: scaleX(1); }
                .menu-links a::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 3px;
                    background-color: #8B5CF6;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s cubic-bezier(0.55, 0, 0.1, 1);
                }

                .social-icons-list {
                  display: flex;
                  justify-content: center;
                  gap: 1rem;
                  list-style: none;
                  padding: 0;
                  margin: 0 0 2rem 0;
                }
        
                .social-icons-list li {
                  position: relative;
                  flex-basis: 3rem;
                }
        
                .social-icons-list li::after {
                  position: absolute;
                  content: attr(data-tooltip);
                  inset: -70% auto auto 50%;
                  z-index: 10;
                  translate: -50%;
                  padding: 0.25rem 0.75rem;
                  font-size: 0.875rem;
                  color: #fff;
                  background: var(--bg, #070707);
                  border-radius: 0.25rem;
                  opacity: 0;
                  visibility: hidden;
                  pointer-events: none;
                  transition: inset 0.3s cubic-bezier(0.47, 1.64, 0.41, 0.8),
                              visibility 0.3s ease-in-out, opacity 0.2s ease-in-out;
                }
        
                .social-icons-list li:hover::after {
                  opacity: 1;
                  visibility: visible;
                  inset-block-start: -85%;
                }
        
                .social-icons-list a {
                  position: relative;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  aspect-ratio: 1;
                  font-size: 1.25rem;
                  color: #4b5563; 
                  border: 1px solid #d1d5db;
                  border-radius: 100%;
                  text-decoration: none;
                  outline: none;
                  overflow: hidden;
                  transition: color 0.3s ease-in-out, border-color 0.3s ease-in-out;
                }
                
                .social-icons-list a:hover {
                    border-color: transparent;
                }
        
                .social-icons-list a > :global(svg) {
                  position: relative;
                  z-index: 1;
                  transition: transform 0.3s ease-in-out;
                }
        
                .social-icons-list a::after {
                  position: absolute;
                  content: "";
                  inset: 100% 0 0;
                  background: var(--bg, #070707);
                  pointer-events: none;
                  transition: inset 0.3s ease-in-out;
                }
        
                .social-icons-list a:hover,
                .social-icons-list a:focus-visible {
                  color: #fff;
                }
        
                .social-icons-list a:hover::after,
                .social-icons-list a:focus-visible::after {
                  inset-block-start: 0;
                }
                .social-icons-list a:hover > :global(svg) {
                    transform: scale(1.1);
                }
            `}</style>
            <div ref={menuContainerRef} className="menu-overlay font-sans">
                <i ref={topBgRef} className="menu-bg bg-top"></i>
                <i ref={middleBgRef} className="menu-bg bg-middle"></i>
                <i ref={bottomBgRef} className="menu-bg bg-bottom"></i>

                <div ref={finalBgRef} className="final-bg"></div>

                <ul ref={menuLinksRef} className="menu-links">
                    <li>
                        <ul className="social-icons-list">
                            <li data-tooltip="Twitter" style={{ '--bg': '#101419' } as React.CSSProperties}>
                              <a href="https://x.com/calciprep?s=21" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <TwitterIcon size={18} />
                              </a>
                            </li>
                            <li data-tooltip="Telegram" style={{ '--bg': '#0088cc' } as React.CSSProperties}>
                              <a href="https://t.me/+ROdUqD-NYTkyMTY1" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                                <TelegramIcon size={18} />
                              </a>
                            </li>
                            <li data-tooltip="YouTube" style={{ '--bg': '#ff0000' } as React.CSSProperties}>
                              <a href="#" aria-label="YouTube">
                                <YouTubeIcon size={18} />
                              </a>
                            </li>
                        </ul>
                    </li>
                    <li><Link href="/#home" onClick={(e) => handleLinkClick(e, 'home')}>Home</Link></li>
                    <li><Link href="/#subjects" onClick={(e) => handleLinkClick(e, 'subjects')}>Subjects</Link></li>
                    <li><Link href="/#features" onClick={(e) => handleLinkClick(e, 'features')}>Features</Link></li>
                    <li><Link href="/#contact" onClick={(e) => handleLinkClick(e, 'contact')}>Contact Us</Link></li>
                    
                    <div className="border-t border-gray-200/80 mt-6 pt-6">
                      {currentUser ? (
                        <div className="space-y-4">
                          <Link href="/account" onClick={onClose} className="text-xl font-semibold text-gray-800">My Account</Link>
                          <button onClick={() => { logout(); onClose(); }} className="text-xl font-semibold text-red-600 block w-full text-center">Logout</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4 mt-4">
                           <AnimatedButton onClick={() => { openModal(true); onClose(); }} color="secondary" className="py-3 px-8 text-base">Sign In</AnimatedButton>
                           <AnimatedButton onClick={() => { openModal(false); onClose(); }} color="primary" className="py-3 px-8 text-base font-bold">Sign Up</AnimatedButton>
                        </div>
                      )}
                    </div>
                </ul>
            </div>
        </>
    );
};

export default MobileMenu;

