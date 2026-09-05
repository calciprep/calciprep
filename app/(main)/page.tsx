import HeroSection from "@/components/features/home/HeroSection";
import SubjectsSection from "@/components/features/home/SubjectsSection";
import FeaturesSection from "@/components/features/home/FeaturesSection";
import ContactSection from "@/components/features/home/ContactSection";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function HomePage() {
  const TICKER_TEXT = (
    <>
      🔴 Typing Live Test for HCM are Live.{' '}
      <Link href="/live-tests/typing/delhi_police_hcm" className="underline hover:text-red-200 transition-colors">
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

      {/* FIXED: Changed z-40 to z-10 so it scrolls safely UNDER your main navbar! */}
      <div className="w-full bg-red-600 text-white py-2.5 flex items-center ticker-container shadow-sm mt-[72px] lg:mt-[80px] relative z-10">
        <div className="container mx-auto flex items-center px-4 relative overflow-hidden mask-image-fade">
          <Bell size={18} className="absolute left-4 z-20 text-white drop-shadow-md" />
          
          <div className="flex ml-8 pl-4">
            <div className="animate-ticker shrink-0">
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_TEXT}</span>
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_TEXT}</span>
            </div>
            <div className="animate-ticker shrink-0" aria-hidden="true">
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_TEXT}</span>
              <span className="font-bold tracking-wide text-sm pr-16">{TICKER_TEXT}</span>
            </div>
          </div>
          
        </div>
      </div>

      <HeroSection />
      <SubjectsSection />
      <FeaturesSection />
      <ContactSection />
    </>
  );
}