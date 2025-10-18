import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Timer, Swords, Zap, ArrowRight } from 'lucide-react';
import AdSenseBlock from '../components/common/AdSenseBlock';
import SettingsModal from '../features/maths/SettingsModal';

const MathsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const navigate = useNavigate();

  const openSettingsModal = (mode) => {
    setSelectedMode(mode);
    setIsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsModalOpen(false);
  };

  const handleStartChallenge = (settings) => {
    closeSettingsModal();
    // Navigate to the game page with settings as URL parameters
    const searchParams = new URLSearchParams({
      mode: settings.mode,
      types: settings.types.join(','),
      difficulty: settings.difficulty
    });
    navigate(`/maths/game?${searchParams.toString()}`);
  };

  return (
    <main className="container mx-auto px-6 pt-28 pb-12">
      <Helmet>
        <title>Maths Practice for SSC - Speed & Accuracy | CalciPrep</title>
        <meta name="description" content="Enhance your maths skills for competitive exams. Practice with timed challenges focusing on speed and accuracy in arithmetic, algebra, and more." />
      </Helmet>
      <style>{`
        .category-card {
          border: 1px solid #F3F4F6;
          border-radius: 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .category-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
      `}</style>
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-8 md:p-12">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Maths Practice Arena</h1>
            <p className="text-purple-100 mt-4 text-lg font-sans">Sharpen your calculation speed. Choose your challenge below.</p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <img src="/media/maths-card-illustration.svg" alt="Maths Arena Illustration" className="h-56 w-auto" />
          </div>
        </div>
      </div>

      <div id="game-selection" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
        <div onClick={() => openSettingsModal('1-minute')} className="category-card bg-purple-100">
           <div className="p-8 text-center flex flex-col flex-grow">
                <div className="bg-white/60 text-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Timer size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">1-Minute Challenge</h2>
                <p className="text-gray-600 font-sans text-sm">Solve as many problems as you can in 60 seconds.</p>
            </div>
            <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-800">Select</span>
                <ArrowRight className="text-gray-400" />
            </div>
        </div>
        <div onClick={() => openSettingsModal('bitter-end')} className="category-card bg-blue-100">
          <div className="p-8 text-center flex flex-col flex-grow">
                <div className="bg-white/60 text-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Swords size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">To the Bitter End</h2>
                <p className="text-gray-600 font-sans text-sm">One wrong answer ends the game.</p>
            </div>
            <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-800">Select</span>
                <ArrowRight className="text-gray-400" />
            </div>
        </div>
        <div onClick={() => openSettingsModal('speed-challenge')} className="category-card bg-amber-100">
          <div className="p-8 text-center flex flex-col flex-grow">
                <div className="bg-white/60 text-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Zap size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Speed Challenge</h2>
                <p className="text-gray-600 font-sans text-sm">Solve 20 problems as fast as you can.</p>
            </div>
            <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-800">Select</span>
                <ArrowRight className="text-gray-400" />
            </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto mt-8 px-4">
        <AdSenseBlock adSlot="7250075025" />
      </section>

      <SettingsModal 
        isOpen={isModalOpen} 
        onClose={closeSettingsModal} 
        onStartChallenge={handleStartChallenge}
        mode={selectedMode} 
      />
    </main>
  );
};

export default MathsPage;
