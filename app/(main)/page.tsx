'use client';

import React, { useState, useEffect } from 'react';
import HeroSection from "@/components/features/home/HeroSection";
import SubjectsSection from "@/components/features/home/SubjectsSection";
import FeaturesSection from "@/components/features/home/FeaturesSection";
// NOTE: ContactSection has been completely removed!
import Link from "next/link";
import { Bell } from "lucide-react";

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function HomePage() {
  const [tickerText, setTickerText] = useState("Loading live updates...");
  const [tickerLink, setTickerLink] = useState("");
  
  // FETCH TICKER DATA FROM FIREBASE
  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const docRef = doc(db!, 'app_settings', 'live_tests');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.tickerText) {
            setTickerText(data.tickerText);
          }
          if (data.tickerLink) {
            setTickerLink(data.tickerLink);
          }
        }
      } catch (error) {
        console.error("Error fetching ticker:", error);
      }
    };
    
    fetchTicker();
  }, []);

  const TICKER_ELEMENT = (
    <>
      {tickerText}{' '}
      <Link href={tickerLink || "/live-tests/typing/delhi_police_hcm"} className="underline hover:text-red-200 transition-colors ml-2">
        Login now to check your ranking.
      </Link>
    </>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes seamless-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-ticker {
          animation: seamless-ticker 45s linear infinite; 
          display: flex;
          white-space: nowrap;
        }
        .ticker-container:hover .animate-ticker {
          animation-play-state: paused;
        }
        .mask-image-fade {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}} />

      <div className="w-full bg-red-600 text-white py-2.5 flex items-center ticker-container shadow-sm mt-[72px] lg:mt-[80px] relative z-10">
        <div className="container mx-auto flex items-center px-4 relative overflow-hidden mask-image-fade">
          <Bell size={18} className="absolute left-4 z-20 text-white drop-shadow-md" />
          
          <div className="flex ml-8 pl-4">
            <div className="animate-ticker shrink-0">
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
            </div>
            <div className="animate-ticker shrink-0" aria-hidden="true">
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_ELEMENT}</span>
            </div>
          </div>
          
        </div>
      </div>

      <HeroSection />
      <SubjectsSection />
      <FeaturesSection />
      {/* ContactSection removed! Clean and lightweight! */}
    </>
  );
}