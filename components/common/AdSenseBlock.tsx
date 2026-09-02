"use client";

import React, { useEffect, useRef } from 'react';

interface AdSenseBlockProps {
  adClient?: string;
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: string;
  adLayoutKey?: string;
  className?: string;
}

const AdSenseBlock: React.FC<AdSenseBlockProps> = ({
  adClient = "ca-pub-2382040431534049",
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = "true",
  adLayoutKey,
  className = ""
}) => {
  const adRef = useRef<HTMLModElement>(null); // Use HTMLModElement for <ins>

  useEffect(() => {
    // Check if the ad slot already has content or has the 'adsbygoogle-no-fill' class
    if (adRef.current && (adRef.current.innerHTML.trim() !== "" || adRef.current.dataset.adsbygoogleStatus === 'done')) {
        // console.log(`Ad slot ${adSlot} already filled or marked as done. Skipping push.`);
        return; // Don't push again if already filled or processed
    }

    try {
      // The push({}) method tells AdSense to look for and fill an ad slot.
      // Explicitly type window
      ((window as Window & typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle = (window as Window & typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});

      // Optionally mark the slot as processed
       if (adRef.current) {
           adRef.current.dataset.adsbygoogleStatus = 'done';
       }

    } catch (err) {
      console.error("AdSense execution error:", err as Error);
    }
  }, [adSlot]); // Dependency array still just needs adSlot

  return (
    <div className={`ad-placeholder w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm min-h-[100px] rounded-lg ${className}`}>
      <ins
        ref={adRef} // Add ref to the ins tag
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
        data-ad-layout-key={adLayoutKey}
      />
    </div>
  );
};

export default AdSenseBlock;
