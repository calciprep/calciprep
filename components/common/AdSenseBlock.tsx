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
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense execution error:", err);
    }
  }, [adSlot]);

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
