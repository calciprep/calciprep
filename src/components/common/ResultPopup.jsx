import React, { useState, useEffect } from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

const ResultPopup = ({ results, onNext, onRepeat, isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // When the parent tries to close the modal, ensure it's not minimized
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  // The minimized view
  if (isMinimized) {
    return (
      <div className="fixed right-4 bottom-4 z-[101] bg-white border rounded-lg shadow-lg px-4 py-2 animate-fade-in-up">
        <div className="flex items-center space-x-3 font-sans">
          <div className="text-sm text-slate-700">
            Net: {results?.netWpm || 0} WPM · Acc: {results?.accuracy || 0}%
          </div>
          <button onClick={handleRestore} className="p-1 text-gray-500 hover:text-gray-800" title="Restore">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // The full modal view
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
      <div className="bg-white w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto border rounded-lg shadow-lg p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold">Detailed Result</h3>
          <div className="flex items-center space-x-2">
            <button onClick={handleMinimize} title="Minimize" className="p-1 text-gray-500 hover:text-gray-800">
              <Minus className="w-5 h-5" />
            </button>
            <button onClick={onClose} title="Close" className="p-1 text-gray-500 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div id="result-content" className="text-sm text-slate-800 font-sans space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
            <div>
              <div className="flex justify-between"><span className="font-medium">Test Duration</span><span>: {results?.durationFormatted || '00:00'}</span></div>
              <div className="flex justify-between mt-2"><span className="font-medium">Correct Words</span><span>: {results?.correctWords || 0}</span></div>
            </div>
            <div>
              <div className="flex justify-between"><span className="font-medium">Total Words</span><span>: {results?.totalWords || 0}</span></div>
              <div className="flex justify-between mt-2"><span className="font-medium">Incorrect Words</span><span>: {results?.incorrectWords || 0}</span></div>
            </div>
          </div>
          <div>
            <div className="text-slate-500 italic mb-2">Method 1 <span className="text-xs">(one word = 5 keystrokes)</span></div>
            <div className="grid grid-cols-2 gap-2 pl-4">
              <div>Net Speed</div><div>: {results?.netWpm || 0} wpm</div>
              <div>Gross Speed</div><div>: {results?.grossWpm || 0} wpm</div>
              <div>Accuracy</div><div>: {results?.accuracy || 0}%</div>
            </div>
          </div>
          <div>
            <div className="text-slate-500 italic mb-2">Method 2 <span className="text-xs">(word = letters separated by space)</span></div>
            <div className="grid grid-cols-2 gap-2 pl-4">
              <div>Net Speed</div><div>: {results?.netWpm2 || 0} wpm</div>
              <div>Gross Speed</div><div>: {results?.grossWpm2 || 0} wpm</div>
               <div>Accuracy</div><div>: {results?.accuracy || 0}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pl-4 border-t pt-4">
            <div>Keystrokes/min</div><div>: {results?.strokesPerMin || 0}</div>
            <div>Backspace Count</div><div>: {results?.backspaceCount || 0}</div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 font-sans">
          <button onClick={onRepeat} className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Repeat</button>
          <button onClick={onNext} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Next &gt;&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default ResultPopup;
