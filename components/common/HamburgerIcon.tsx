"use client";

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface HamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
}

const HamburgerIcon: React.FC<HamburgerIconProps> = ({ isOpen, onClick }) => {
  const topBarRef = useRef<HTMLElement>(null);
  const middleBarRef = useRef<HTMLElement>(null);
  const bottomBarRef = useRef<HTMLElement>(null);
  const closeLeftRef = useRef<HTMLElement>(null);
  const closeRightRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Animate to 'X' (close icon)
    if (isOpen) {
      gsap.to(topBarRef.current, { x: 80, y: -80, duration: 0.4, ease: 'power4.in' });
      gsap.to(middleBarRef.current, { x: 80, y: -80, duration: 0.4, ease: 'power4.in' });
      gsap.to(bottomBarRef.current, { x: 80, y: -80, duration: 0.4, delay: 0.1, ease: 'power4.in' });
      gsap.to(closeLeftRef.current, { x: 0, y: 0, duration: 0.8, delay: 0.3, ease: 'power4.out' });
      gsap.to(closeRightRef.current, { x: 0, y: 0, duration: 0.8, delay: 0.5, ease: 'power4.out' });
    }
    // Animate back to hamburger
    else {
      gsap.to(closeLeftRef.current, { x: 100, y: -100, duration: 0.2, ease: 'power4.in' });
      gsap.to(closeRightRef.current, { x: -100, y: -100, duration: 0.2, delay: 0.1, ease: 'power4.in' });
      gsap.to(topBarRef.current, { x: 0, y: 0, duration: 1, delay: 0.3, ease: 'power4.out' });
      gsap.to(middleBarRef.current, { x: 0, y: 0, duration: 1, delay: 0.3, ease: 'power4.out' });
      gsap.to(bottomBarRef.current, { x: 0, y: 0, duration: 1, delay: 0.4, ease: 'power4.out' });
    }
  }, [isOpen]);


  return (
    <>
      <style jsx>{`
        .menu-trigger, .close-trigger {
          position: absolute;
          top: 50%;
          right: 0;
          width: 34px;
          height: 34px;
          cursor: pointer;
          transform: translateY(-50%);
        }
        .menu-trigger-bar {
          display: block;
          width: 100%;
          height: 2px;
          background-color: #1f2937;
          position: relative;
          margin-bottom: 7px;
        }
        .menu-trigger-bar:last-child {
            margin-bottom: 0;
        }
        .bar-top { width: 50%; }
        .bar-bottom { width: 50%; margin-left: 50%; }

        .close-trigger-bar {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 90%;
            height: 2px;
            background-color: #1f2937;
            margin-top: -1px;
            margin-left: -45%;
        }
        .bar-left { transform: translateX(100px) translateY(-100px) rotate(-45deg); }
        .bar-right { transform: translateX(-100px) translateY(-100px) rotate(45deg); }
      `}</style>
      <div className="relative w-9 h-9" onClick={onClick}>
        <div className={`menu-trigger ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
          <i ref={topBarRef} className="menu-trigger-bar bar-top"></i>
          <i ref={middleBarRef} className="menu-trigger-bar"></i>
          <i ref={bottomBarRef} className="menu-trigger-bar bar-bottom"></i>
        </div>
        <div className={`close-trigger ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <i ref={closeLeftRef} className="close-trigger-bar bar-left"></i>
            <i ref={closeRightRef} className="close-trigger-bar bar-right"></i>
        </div>
      </div>
    </>
  );
};

export default HamburgerIcon;

