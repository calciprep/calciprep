import React from 'react';

const HeroSection = () => {
  const handleStartNowClick = (e) => {
    e.preventDefault();
    const subjectsSection = document.getElementById('subjects');
    if (subjectsSection) {
      subjectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-28 pb-12 lg:pt-32 lg:pb-20">
      <style>{`
        #home h1 {
          font-family: 'Abril Fatface', cursive;
        }
        .btn-primary-dark {
          background-color: #111827;
          color: #FFFFFF;
          transition: all 0.3s ease;
        }
        .btn-primary-dark:hover {
          background-color: #374151;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-amber-300 rounded-3xl p-8 md:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-gray-900">
                Sharpen your skills with fun, <span className="text-white">gamified practice</span>
              </h1>
              <p className="text-base md:text-lg text-gray-800 max-w-lg mx-auto lg:mx-0 mb-8 font-sans">
                Prepare for your exams the fun way. CalciPrep offers free, game-like exercises to improve your speed, accuracy, and confidence.
              </p>
              <a href="#subjects" onClick={handleStartNowClick} className="btn-primary-dark px-8 py-3 rounded-xl font-bold text-lg inline-flex items-center">Start now</a>
            </div>
            <div className="flex justify-center items-center">
              <img src="/media/hero-illustration.svg" alt="Skills Illustration" className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
