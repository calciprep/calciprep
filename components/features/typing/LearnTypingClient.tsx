"use client";

import React, { useState, useEffect, useRef } from 'react';
import TypingInterface from './TypingInterface';
import './Tabs.css';
import { TypingMode } from '@/lib/typing-types';

// Define a more specific type for the exercises data structure
type ExerciseData = Record<string, string[]> | string[] | null;

interface LearnTypingClientProps {
  learnKeysExercises: ExerciseData;
  practiceWords: ExerciseData;
  typeParagraphs: ExerciseData;
}

const LearnTypingClient: React.FC<LearnTypingClientProps> = ({
  learnKeysExercises,
  practiceWords,
  typeParagraphs
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Define the structure for tabs data more explicitly
  const tabsData: { name: string; data: ExerciseData; type: TypingMode }[] = [
    { name: 'Learn Keys', data: learnKeysExercises, type: 'learn-keys' },
    { name: 'Practice Words', data: practiceWords, type: 'practice-words' },
    { name: 'Type Paragraphs', data: typeParagraphs, type: 'type-paragraphs' },
  ];

  useEffect(() => {
    if (tabsRef.current) {
      tabsRef.current.style.setProperty('--k', `${activeTab}`);
    }
  }, [activeTab]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    const targetButton = tabsRef.current?.querySelector<HTMLButtonElement>(`#tab${index}`);
    targetButton?.focus();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    let nextTab = activeTab;
    if (key === 'ArrowRight') {
      nextTab = (activeTab + 1) % tabsData.length;
    } else if (key === 'ArrowLeft') {
      nextTab = (activeTab - 1 + tabsData.length) % tabsData.length;
    } else if (key === 'Home') {
      nextTab = 0;
    } else if (key === 'End') {
      nextTab = tabsData.length - 1;
    }

    if (nextTab !== activeTab) {
      handleTabClick(nextTab);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28" onKeyUp={handleKeyUp}>
      <section
        className="tabs"
        ref={tabsRef}
        style={{ '--n': tabsData.length, '--k': activeTab, '--u': 5 } as React.CSSProperties}
      >
        <nav className="tablist" role="tablist" aria-label="Typing Modes">
          {tabsData.map((tab, i) => (
            <button
              key={i}
              role="tab"
              id={`tab${i}`}
              aria-controls={`panel${i}`}
              aria-selected={activeTab === i}
              tabIndex={activeTab === i ? 0 : -1}
              onClick={() => handleTabClick(i)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        {tabsData.map((tab, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`panel${i}`}
            aria-labelledby={`tab${i}`}
            aria-hidden={activeTab !== i}
          >
            <div className="back" aria-hidden="true"></div>
            <div className="content">
              {/* Render only if data is not null */}
              {activeTab === i && tab.data !== null && (
                <TypingInterface
                  key={tab.type} // Re-mount component on tab change to reset state
                  exercises={tab.data}
                  mode={tab.type} // Type is already correct
                />
              )}
               {/* Optionally show a message if data is null */}
              {activeTab === i && tab.data === null && (
                <p>Exercises for this section could not be loaded.</p>
              )}
            </div>
          </div>
        ))}
      </section>
      {/* SVG filter remains unchanged */}
      <svg width="0" height="0" aria-hidden="true">
        <filter id="roundstroke" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 1 0"></feFuncA>
          </feComponentTransfer>
          <feMorphology operator="dilate" radius="10" result="line"></feMorphology>
          <feComponentTransfer in="SourceGraphic">
            <feFuncA type="table" tableValues="0 0 1"></feFuncA>
          </feComponentTransfer>
          <feGaussianBlur stdDeviation="5" result="blur"></feGaussianBlur>
          <feComponentTransfer result="fill">
            <feFuncA type="table" tableValues="-3 6"></feFuncA>
          </feComponentTransfer>
          <feComponentTransfer in="blur">
            <feFuncA type="table" tableValues="-5 5 -5"></feFuncA>
          </feComponentTransfer>
          <feComposite in="line" operator="in"></feComposite>
          <feBlend in="fill"></feBlend>
        </filter>
      </svg>
    </div>
  );
};

export default LearnTypingClient;

