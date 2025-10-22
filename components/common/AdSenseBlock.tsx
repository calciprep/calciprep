"use client";

import React, { useEffect } from 'react';

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
  useEffect(() => {
    try {
      // The push({}) method tells AdSense to look for and fill an ad slot.
      // Explicitly type window as Window & typeof globalThis & { adsbygoogle?: unknown[] }
      ((window as Window & typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle = (window as Window & typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
    } catch (err) {
      // Use Error type for caught error
      console.error("AdSense execution error:", err as Error);
    }
  }, [adSlot]); // Removed unnecessary dependencies

  return (
    <div className={`ad-placeholder w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm min-h-[100px] rounded-lg ${className}`}>
      <ins
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
