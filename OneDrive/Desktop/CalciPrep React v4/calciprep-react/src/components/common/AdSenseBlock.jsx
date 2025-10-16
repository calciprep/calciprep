import React, { useEffect } from 'react';

const AdSenseBlock = ({
  adClient = "ca-pub-2382040431534049", // Your AdSense client ID from ads.txt
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = "true",
  adLayoutKey,
  className = ""
}) => {
  useEffect(() => {
    // This effect will run after the component mounts to the screen.
    try {
      // The push({}) method tells AdSense to look for and fill an ad slot.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense execution error:", err);
    }
  }, [adSlot]); // We re-run this effect if the adSlot changes.

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
