import React, { useState } from 'react';

const SettingsModal = ({ isOpen, onClose, onStartChallenge, mode }) => {
  const [challengeTypes, setChallengeTypes] = useState(['add']);
  const [difficulty, setDifficulty] = useState('easy');

  const handleCheckboxChange = (event) => {
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

  const modeTitles = {
    '1-minute': '1-Minute Challenge',
    'bitter-end': 'To the Bitter End',
    'speed-challenge': 'Speed Challenge',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
      <style>{`
        .custom-checkbox:checked { background-color: #8B5CF6; border-color: #8B5CF6; }
        .custom-checkbox:checked + label { color: #7C3AED; font-weight: 700; }
        .custom-radio:checked { border-color: #8B5CF6; }
        .custom-radio:checked::after { background-color: #8B5CF6; content: ''; display: block; width: 0.75rem; height: 0.75rem; border-radius: 50%; margin: 2px; }
        .btn-primary { background-color: #8B5CF6; transition: background-color 0.3s ease; }
        .btn-primary:hover { background-color: #7C3AED; }
      `}</style>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-purple-500 p-6">
          <h2 className="text-3xl font-bold text-center text-white" style={{ fontFamily: "'Abril Fatface', cursive" }}>
            {modeTitles[mode] || 'Challenge Settings'}
          </h2>
        </div>
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Abril Fatface', cursive" }}>Challenge Type <span className="text-sm font-normal text-gray-500">(Select at least one)</span></h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input id="type-add" type="checkbox" value="add" checked={challengeTypes.includes('add')} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                <label htmlFor="type-add" className="text-lg">Addition</label>
              </div>
              <div className="flex items-center">
                <input id="type-subtract" type="checkbox" value="subtract" checked={challengeTypes.includes('subtract')} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                <label htmlFor="type-subtract" className="text-lg">Subtraction</label>
              </div>
              <div className="flex items-center">
                <input id="type-multiply" type="checkbox" value="multiply" checked={challengeTypes.includes('multiply')} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                <label htmlFor="type-multiply" className="text-lg">Multiplication</label>
              </div>
              <div className="flex items-center">
                <input id="type-divide" type="checkbox" value="divide" checked={challengeTypes.includes('divide')} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                <label htmlFor="type-divide" className="text-lg">Division</label>
              </div>
              <div className="flex items-center">
                <input id="type-simplify" type="checkbox" value="simplify" checked={challengeTypes.includes('simplify')} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                <label htmlFor="type-simplify" className="text-lg">Simplification</label>
              </div>
              <div className="flex items-center">
                <input id="type-percentage" type="checkbox" value="percentage" checked={challengeTypes.includes('percentage')} onChange={handleCheckboxChange} className="custom-checkbox w-5 h-5 mr-3 rounded text-purple-600 focus:ring-0" />
                <label htmlFor="type-percentage" className="text-lg">Percentage</label>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: "'Abril Fatface', cursive" }}>Difficulty Level</h3>
            <div className="flex justify-around">
              <div className="flex items-center">
                <input id="level-easy" type="radio" name="difficulty" value="easy" checked={difficulty === 'easy'} onChange={(e) => setDifficulty(e.target.value)} className="custom-radio w-5 h-5 mr-2 appearance-none rounded-full border-2 border-gray-300 relative" />
                <label htmlFor="level-easy" className="text-lg">Easy</label>
              </div>
              <div className="flex items-center">
                <input id="level-intermediate" type="radio" name="difficulty" value="intermediate" checked={difficulty === 'intermediate'} onChange={(e) => setDifficulty(e.target.value)} className="custom-radio w-5 h-5 mr-2 appearance-none rounded-full border-2 border-gray-300 relative" />
                <label htmlFor="level-intermediate" className="text-lg">Intermediate</label>
              </div>
              <div className="flex items-center">
                <input id="level-advanced" type="radio" name="difficulty" value="advanced" checked={difficulty === 'advanced'} onChange={(e) => setDifficulty(e.target.value)} className="custom-radio w-5 h-5 mr-2 appearance-none rounded-full border-2 border-gray-300 relative" />
                <label htmlFor="level-advanced" className="text-lg">Advanced</label>
              </div>
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
