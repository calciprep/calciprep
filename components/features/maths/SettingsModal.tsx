"use client";

import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChallenge: (settings: { mode: string; types: string[]; difficulty: string }) => void;
  mode: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onStartChallenge, mode }) => {
  const [challengeTypes, setChallengeTypes] = useState(['add']);
  const [difficulty, setDifficulty] = useState('easy');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setChallengeTypes(prev => [...prev, value]);
    } else {
      setChallengeTypes(prev => prev.filter(type => type !== value));
    }
  };

  const handleStartClick = () => {
    if (challengeTypes.length === 0) {
      alert('Please select at least one challenge type.');
      return;
    }
    onStartChallenge({
      mode,
      types: challengeTypes,
      difficulty
    });
  };

  if (!isOpen) {
    return null;
  }

  const modeTitles: { [key: string]: string } = {
    '1-minute': '1-Minute Challenge',
    'bitter-end': 'To the Bitter End',
    'speed-challenge': 'Speed Challenge',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <style jsx>{`
        .custom-checkbox {
          appearance: none;
          -webkit-appearance: none;
          display: inline-grid;
          place-content: center;
          cursor: pointer;
        }
        .custom-checkbox::before {
          content: "";
          width: 0.65rem;
          height: 0.65rem;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em white;
          transform-origin: bottom left;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .custom-checkbox:checked {
          background-color: #8B5CF6;
          border-color: #8B5CF6 !important;
        }
        .custom-checkbox:checked::before {
          transform: scale(1);
        }
        .custom-checkbox:checked + label {
          color: #8B5CF6 !important;
          font-weight: 800;
        }
        .custom-radio {
          cursor: pointer;
        }
        .custom-radio:checked {
          border-color: #8B5CF6 !important;
        }
        .custom-radio:checked::after {
          background-color: #8B5CF6;
          content: '';
          display: block;
          width: 0.65rem;
          height: 0.65rem;
          border-radius: 50%;
          margin: 3px;
        }
        .custom-radio:checked + label {
          color: #8B5CF6 !important;
          font-weight: 800;
        }
      `}</style>
      <div className="bg-white dark:bg-zinc-950 border-[3px] border-black dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="bg-purple-600 p-6 text-center border-b-[3px] border-black dark:border-zinc-800">
          <h2 className="text-3xl font-black text-white tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
            {modeTitles[mode] || 'Challenge Settings'}
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {/* Challenge Type Checkboxes */}
          <div className="mb-6">
            <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-white flex items-center justify-between" style={{ fontFamily: "var(--font-serif)" }}>
              <span>Challenge Type</span>
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 font-sans tracking-normal">(Select at least one)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-black p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800">
              {['add', 'subtract', 'multiply', 'divide', 'simplify', 'percentage'].map(type => (
                <div className="flex items-center" key={type}>
                  <input
                    id={`type-${type}`}
                    type="checkbox"
                    value={type}
                    checked={challengeTypes.includes(type)}
                    onChange={handleCheckboxChange}
                    className="custom-checkbox w-5 h-5 mr-3 rounded border-2 border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 transition-colors"
                  />
                  <label htmlFor={`type-${type}`} className="text-base font-bold text-slate-800 dark:text-zinc-200 capitalize cursor-pointer select-none transition-colors">
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Level Radio Buttons */}
          <div className="mb-6">
            <h3 className="text-xl font-black mb-3 text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-serif)" }}>
              Difficulty Level
            </h3>
            <div className="flex justify-around bg-slate-50 dark:bg-black p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800">
              {['easy', 'intermediate', 'advanced'].map(level => (
                <div className="flex items-center" key={level}>
                  <input
                    id={`level-${level}`}
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="custom-radio w-5 h-5 mr-2 appearance-none rounded-full border-2 border-slate-400 dark:border-zinc-600 bg-white dark:bg-zinc-900 relative transition-colors"
                  />
                  <label htmlFor={`level-${level}`} className="text-base font-bold text-slate-800 dark:text-zinc-200 capitalize cursor-pointer select-none transition-colors">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-zinc-800 pt-5 mt-6">
            <button
              onClick={onClose}
              className="font-bold text-sm text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white px-5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="start-challenge-btn"
              onClick={handleStartClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-sm px-6 py-3 rounded-xl border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(38,38,38,1)] hover:-translate-y-0.5 transition cursor-pointer"
            >
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
