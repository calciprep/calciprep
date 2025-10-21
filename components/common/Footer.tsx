"use client";
import React from 'react';
import Link from 'next/link';
import { TwitterIcon, YouTubeIcon, TelegramIcon } from './SocialMediaIcons';

const Footer = () => {
  // Function to handle smooth scrolling for anchor links on the homepage
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* Styles for the new social media icons hover effect */}
      <style jsx>{`
        .social-icons-list {
          display: flex;
          justify-content: flex-start;
          flex-flow: wrap;
          gap: 1rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .social-icons-list li {
          position: relative;
          flex-basis: 3rem; /* Adjusted size */
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
          inset-block-start: -85%; /* Adjusted position */
        }

        .social-icons-list a {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          aspect-ratio: 1;
          font-size: 1.25rem; /* Adjusted icon size */
          color: #9ca3af; /* gray-400 */
          border: 1px solid #4b5563; /* gray-600 */
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

      <footer className="bg-black text-gray-400 py-16 font-sans">
        <div className="container mx-auto px-6">
          {/* Top Section with Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/" onClick={(e) => handleSmoothScroll(e, 'home')} className="hover:text-white transition-colors">Homepage</Link></li>
                <li><Link href="/#subjects" onClick={(e) => handleSmoothScroll(e, 'subjects')} className="hover:text-white transition-colors">Subjects</Link></li>
                <li><Link href="/#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Contact & Legal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact & Legal</h3>
              <ul className="space-y-3">
                <li><a href="mailto:contact@calciprep.online" className="hover:text-white transition-colors">contact@calciprep.online</a></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">Join the Conversation - Let's Connect!</h3>
              <ul className="social-icons-list">
                <li data-tooltip="Twitter" style={{ '--bg': '#1DA1F2' } as React.CSSProperties}>
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
            </div>
          </div>

          {/* Bottom Section with Newsletter */}
          <div className="border-t border-gray-800 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-oswald)"}}>Get an Edge - Join Our Community!</h2>
              </div>
              <div>
                <form className="flex flex-col sm:flex-row gap-4">
                  <label htmlFor="footer-email" className="sr-only">Email</label>
                  <input
                    type="email"
                    id="footer-email"
                    placeholder="Email"
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  />
                  <button
                    type="submit"
                    className="bg-lime-300 text-black font-bold px-6 py-3 rounded-md hover:bg-lime-400 transition-colors whitespace-nowrap"
                  >
                    SUBSCRIBE FOR FREE
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>Copyright &copy; 2024 | Privacy Policy</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

