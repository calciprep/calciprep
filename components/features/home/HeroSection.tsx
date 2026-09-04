"use client"; 

import Image from 'next/image';
import heroIllustration from '@/public/media/hero-illustration.svg';

const HeroSection = () => {
  // Smooth scroll handler for the Explore button
  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const subjectsSection = document.getElementById('subjects');
    if (subjectsSection) {
      subjectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-28 pb-12 lg:pt-32 lg:pb-20">
      <style jsx>{`
        #home h1 {
          font-family: var(--font-oswald);
        }
      `}</style>
      
      <div className="container mx-auto px-4 sm:px-6">
        {/* PREMIUM DARK GRADIENT BACKGROUND */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b] rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          {/* Subtle light flares for the background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[2.5rem] pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#5b58f5] opacity-20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[50%] bg-[#FF44EC] opacity-10 blur-[100px] rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Updated text colors to pop on the dark background */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white tracking-tight">
                Master your exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#44BCFF] to-[#FF44EC] drop-shadow-sm">real-time analytics</span>
              </h1>
              <p className="text-base md:text-xl text-slate-300 max-w-lg mb-10 font-sans leading-relaxed">
                Elevate your preparation for SSC, Delhi Police, and more. Track your typing speed, conquer complex mathematics, and master English with our premium, data-driven platform.
              </p>
              
              {/* EXPLORE BUTTON WITH SMOOTH SCROLL */}
              <a 
                href="#subjects" 
                onClick={handleExploreClick}
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white transition-all duration-300 bg-[#5b58f5] hover:bg-indigo-500 rounded-2xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1"
              >
                Explore Subjects
              </a>

            </div>

            <div className="flex justify-center items-center">
              <Image 
                src={heroIllustration} 
                alt="Exam Preparation Illustration" 
                priority
                className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto drop-shadow-2xl" 
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;