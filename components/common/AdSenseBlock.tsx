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
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pushAd = () => {
      if (!adRef.current) return;

      // FIX 1: Prevent "availableWidth=0" error
      // If the ad container is hidden or hasn't painted its width yet, wait and try again.
      if (adRef.current.clientWidth === 0) {
        timeoutId = setTimeout(pushAd, 200);
        return;
      }

      // FIX 2: Prevent double-pushing in React Strict Mode
      // Only push if AdSense hasn't already marked this exact slot as "done"
      if (!adRef.current.hasAttribute('data-adsbygoogle-status')) {
        try {
          ((window as Window & typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle = 
            (window as Window & typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
        } catch (err: unknown) {
          const error = err as Error;
          // Safely ignore the "already have ads" error in development
          if (!error.message.includes('already have ads')) {
            console.error("AdSense execution error:", error);
          }
        }
      }
    };

    // Small delay ensures the DOM layout is completely finished before AdSense calculates the responsive width
    timeoutId = setTimeout(pushAd, 100);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [adSlot]); 

  return (
    <div className={`ad-placeholder w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm min-h-[100px] rounded-lg ${className}`}>
      <ins
        ref={adRef}
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