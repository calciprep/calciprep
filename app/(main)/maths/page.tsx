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
  ];

  const colorClasses: { [key: string]: { bg: string; text: string } } = {
    purple: { bg: 'bg-[#E6E6FA] dark:bg-[#2d224d]', text: 'text-purple-600 dark:text-purple-300' },
    blue: { bg: 'bg-[#ADD8E6] dark:bg-[#0c3547]', text: 'text-blue-600 dark:text-blue-300' },
    amber: { bg: 'bg-[#FEF3C7] dark:bg-[#453011]', text: 'text-amber-600 dark:text-amber-300' },
  };

  return (
    <main className="container mx-auto px-6 pt-28 pb-12 transition-colors duration-200">
      <div className="rounded-[2rem] bg-gradient-to-r from-purple-600 to-indigo-600 p-8 md:p-12 border-[3px] border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)]">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white font-serif tracking-tight">Maths Practice Arena</h1>
            <p className="text-purple-100 mt-4 text-lg font-sans font-medium">Sharpen your calculation speed. Choose your challenge below.</p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <Image src={mathsIllustration} alt="Maths Arena Illustration" className="h-56 w-auto drop-shadow-md" priority />
          </div>
        </div>
      </div>

      <div id="game-selection" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
        {modes.map(mode => {
            const Icon = mode.icon;
            const { bg, text } = colorClasses[mode.color];
            return (
                <div
                  key={mode.name}
                  onClick={() => openSettingsModal(mode.name)}
                  className={`flex flex-col border-[3px] border-black dark:border-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(38,38,38,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(38,38,38,1)] hover:-translate-y-2 transition-all duration-300 rounded-[2rem] overflow-hidden cursor-pointer ${bg}`}
                >
                   <div className="p-8 text-center flex flex-col flex-grow">
                        <div className={`bg-white dark:bg-black border-[3px] border-black dark:border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${text} w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                            <Icon size={30} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white font-serif tracking-wide">{mode.title}</h2>
                        <p className="text-slate-800 dark:text-zinc-300 font-sans text-sm font-semibold">{mode.description}</p>
                    </div>
                    <div className="p-5 bg-white dark:bg-black border-t-[3px] border-black dark:border-zinc-800 flex justify-between items-center mt-auto">
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm font-serif">Select</span>
                        <ArrowRight className="text-slate-900 dark:text-white" strokeWidth={2.5} size={20} />
                    </div>
                </div>
            );
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
}
