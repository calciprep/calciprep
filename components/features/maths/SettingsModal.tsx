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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <style jsx>{`
        .custom-checkbox:checked { background-color: #8B5CF6; border-color: #8B5CF6; }
        .custom-checkbox:checked + label { color: #7C3AED; font-weight: 700; }
        .custom-radio:checked { border-color: #8B5CF6; }
        .custom-radio:checked::after { background-color: #8B5CF6; content: ''; display: block; width: 0.75rem; height: 0.75rem; border-radius: 50%; margin: 2px; }
        .btn-primary { background-color: #8B5CF6; transition: background-color 0.3s ease; }
        .btn-primary:hover { background-color: #7C3AED; }
      `}</style>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-purple-500 p-6">
          <h2 className="text-3xl font-bold text-center text-white" style={{ fontFamily: "var(--font-serif)" }}>
            {modeTitles[mode] || 'Challenge Settings'}
          </h2>
        </div>
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Challenge Type <span className="text-sm font-normal text-gray-500">(Select at least one)</span></h3>
            <div className="grid grid-cols-2 gap-4">
              {['add', 'subtract', 'multiply', 'divide', 'simplify', 'percentage'].map(type => (
                 <div className="flex items-center" key={type}>
                    <input id={`type-${type}`} type="checkbox" value={type} checked={challengeTypes.includes(type)} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                    <label htmlFor={`type-${type}`} className="text-lg capitalize">{type}</label>
                 </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Difficulty Level</h3>
            <div className="flex justify-around">
              {['easy', 'intermediate', 'advanced'].map(level => (
                <div className="flex items-center" key={level}>
                    <input id={`level-${level}`} type="radio" name="difficulty" value={level} checked={difficulty === level} onChange={(e) => setDifficulty(e.target.value)} className="custom-radio w-5 h-5 mr-2 appearance-none rounded-full border-2 border-gray-300 relative" />
                    <label htmlFor={`level-${level}`} className="text-lg capitalize">{level}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-6 mt-6">
            <button onClick={onClose} className="font-semibold text-gray-600 hover:text-gray-800 px-4 py-2">Cancel</button>
            <button id="start-challenge-btn" onClick={handleStartClick} className="btn-primary px-6 py-3 rounded-lg font-bold text-white">Start Challenge</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

