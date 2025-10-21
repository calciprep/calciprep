"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Timer, Swords, Zap, ArrowRight } from 'lucide-react';
import AdSenseBlock from '@/components/common/AdSenseBlock';
import SettingsModal from '@/components/features/maths/SettingsModal';
import mathsIllustration from '@/public/media/maths-card-illustration.svg';

export default function MathsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const router = useRouter();

  const openSettingsModal = (mode: string) => {
    setSelectedMode(mode);
    setIsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsModalOpen(false);
  };

  const handleStartChallenge = (settings: { mode: string; types: string[]; difficulty: string }) => {
    closeSettingsModal();
    const searchParams = new URLSearchParams({
      mode: settings.mode,
      types: settings.types.join(','),
      difficulty: settings.difficulty
    });
    // This line is the key fix: it pushes to the new game page
    router.push(`/maths/games?${searchParams.toString()}`);
  };

  const modes = [
    {
        name: '1-minute',
        title: '1-Minute Challenge',
        description: 'Solve as many problems as you can in 60 seconds.',
        icon: Timer,
        color: 'purple',
    },
    {
        name: 'bitter-end',
        title: 'To the Bitter End',
        description: 'One wrong answer ends the game.',
        icon: Swords,
        color: 'blue',
    },
    {
        name: 'speed-challenge',
        title: 'Speed Challenge',
        description: 'Solve 20 problems as fast as you can.',
        icon: Zap,
        color: 'amber',
    },
  ]

  const colorClasses: { [key: string]: { bg: string; text: string } } = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };

  return (
    <main className="container mx-auto px-6 pt-28 pb-12">
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
            <Image src={mathsIllustration} alt="Maths Arena Illustration" className="h-56 w-auto" priority />
          </div>
        </div>
      </div>

      <div id="game-selection" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
        {modes.map(mode => {
            const Icon = mode.icon;
            const { bg, text } = colorClasses[mode.color];
            return (
                <div key={mode.name} onClick={() => openSettingsModal(mode.name)} className={`category-card ${bg}`}>
                   <div className="p-8 text-center flex flex-col flex-grow">
                        <div className={`bg-white/60 ${text} w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                            <Icon size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">{mode.title}</h2>
                        <p className="text-gray-600 font-sans text-sm">{mode.description}</p>
                    </div>
                    <div className="p-5 bg-white flex justify-between items-center mt-auto">
                        <span className="font-semibold text-gray-800">Select</span>
                        <ArrowRight className="text-gray-400" />
                    </div>
                </div>
            )
        })}
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

