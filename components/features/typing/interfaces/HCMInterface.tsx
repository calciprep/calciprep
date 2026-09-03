'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../TypingInterface.css'; 
import { Passage, ExamRules } from '@/lib/typing/types';
import { TypingResult as TypingResultType } from '@/lib/typing-types';
import { X } from 'lucide-react';

// Import smooth scrolling for the localized passage box
import { ReactLenis } from '@studio-freight/react-lenis';

// Import custom typing sound hook
import useTypingSound from '@/hooks/useTypingSound';

interface HCMInterfaceProps {
  passage: Passage;
  examRules: ExamRules;
  onFinish: (stats: TypingResultType) => void;
  onCancel: () => void;
}

export default function HCMInterface({
  passage,
  examRules,
  onFinish,
  onCancel,
}: HCMInterfaceProps) {
  // --- TEST STATE ---
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(examRules.duration);
  const [isStarted, setIsStarted] = useState(false);

  // --- SETTINGS STATE ---
  const [showSettings, setShowSettings] = useState(false);
  const [backspaceEnabled, setBackspaceEnabled] = useState(examRules.allowBackspace);
  const [showPassage, setShowPassage] = useState(false); 
  const [textSize, setTextSize] = useState(15); // Default text size set to 15
  const [fontFamily, setFontFamily] = useState('Times New Roman, serif');
  const [soundEnabled, setSoundEnabled] = useState(false); // Typing sound toggle state

  // Initialize the typing sound hook
  const playTypingSound = useTypingSound();

  // --- TRACKING REFS ---
  const backspaceCount = useRef(0);
  const textareaRef = useRef(null);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isStarted && timeLeft === 0) {
      submitTest();
    }

    return () => clearInterval(interval);
  }, [isStarted, timeLeft]);

  // --- TYPING HANDLERS ---
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isStarted) setIsStarted(true);

    // Play sound if enabled and the hook returned a valid function
    if (soundEnabled && typeof playTypingSound === 'function') {
      playTypingSound();
    }

    if (e.key === 'Backspace') {
      backspaceCount.current += 1;
      if (!backspaceEnabled) {
        e.preventDefault(); // Block deletion completely
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  // --- FULL SCREEN LOGIC ---
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen error:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- SUBMIT EVALUATION (DELHI POLICE HCM LOGIC) ---
  const submitTest = useCallback(() => {
    const timeTaken = examRules.duration - timeLeft;
    const timeInMinutes = timeTaken / 60;

    const typedWords = userInput.trim().split(/\s+/);
    const originalWords = passage.text.trim().split(/\s+/);

    let errors = 0;

    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] !== originalWords[i] && typedWords[i] !== '') {
        errors++;
      }
    }

    const totalKeystrokes = userInput.length;

    // DP HCM Logic: 5 characters = 1 word. All errors are full errors.
    const grossWpm = timeInMinutes > 0 ? Math.round((totalKeystrokes / 5) / timeInMinutes) : 0;
    const netWpm = Math.max(0, grossWpm - Math.round(errors / timeInMinutes));
    const accuracy = grossWpm > 0 ? Math.max(0, Math.round((netWpm / grossWpm) * 100)) : 0;
    const errorPercentage = totalKeystrokes > 0 ? (errors / (totalKeystrokes / 5)) * 100 : 0;

    // Marks Calculation Tiers for HCM
    let calculatedMarks = 0;
    if (netWpm > 50) calculatedMarks = 25;
    else if (netWpm >= 46) calculatedMarks = 21;
    else if (netWpm >= 41) calculatedMarks = 18;
    else if (netWpm >= 36) calculatedMarks = 15;
    else if (netWpm >= 31) calculatedMarks = 12;
    else if (netWpm >= 30) calculatedMarks = 10;

    const stats: TypingResultType = {
      testName: `Typing Test - ${examRules.name} ${passage.title}`,
      keyStrokesByCandidate: totalKeystrokes,
      fullMistakes: errors,
      totalErrors: errors,
      errorPercentage: errorPercentage,
      backspacePresses: backspaceCount.current,
      wpm: grossWpm,
      netWpm: netWpm,
      accuracy: accuracy,
      timeTakenInSeconds: timeTaken,
      qualified: netWpm >= (examRules.targetWpm || 30),
      marks: calculatedMarks,
      originalText: passage.text,
      typedText: userInput,
    };

    onFinish(stats);
  }, [userInput, passage.text, timeLeft, examRules, onFinish]);

  // --- FORMAT UTILS ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-black overflow-hidden">
      
      {/* Header (Blue) */}
      <div className="bg-[#4c75c3] text-white text-center py-2 px-4 text-xl font-bold tracking-wide shrink-0">
        Typing Test - {examRules.name} {passage.title}
      </div>

      {/* Toolbar (Dark) */}
      <div className="bg-[#333333] text-white px-4 py-2 flex flex-wrap justify-between items-center text-sm gap-3 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-wider text-yellow-400 uppercase">{passage.title}</span>
          
          {passage.pdfUrl && (
            <a 
              href={passage.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#dc3545] hover:bg-[#c82333] px-4 py-1.5 rounded text-white font-medium shadow transition-colors"
            >
              Download PDF
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto flex-wrap justify-end">
          <span className="font-bold text-yellow-400 text-base mr-2">
            Time left: {formatTime(timeLeft)}
          </span>
          
          <button 
            onClick={() => setShowPassage(!showPassage)} 
            className="bg-[#10b981] hover:bg-[#0d9668] px-4 py-1.5 rounded text-white font-medium shadow transition-colors"
          >
            {showPassage ? 'Hide Passage' : 'Show Passage'}
          </button>

          <button 
            onClick={() => setShowSettings(true)} 
            className="bg-[#10b981] hover:bg-[#0d9668] px-4 py-1.5 rounded text-white font-medium shadow transition-colors"
          >
            Settings
          </button>

          <button 
            onClick={toggleFullScreen} 
            className="bg-[#10b981] hover:bg-[#0d9668] px-4 py-1.5 rounded text-white font-medium shadow transition-colors"
          >
            Full Screen
          </button>
        </div>
      </div>

      {/* Main Full-Width Typing Area */}
      <div className="flex-1 w-full px-2 md:px-6 py-4 flex flex-col overflow-hidden">
        
        {/* Container for Info Bar, Passage, and Textarea */}
        <div className="w-full flex flex-col flex-1 h-full">
          
          {/* Info Bar */}
          <div className="bg-[#5b87c6] text-white px-3 py-1.5 text-sm border border-[#5b87c6] shrink-0">
            Keyboard Layout: QWERTY Language: English
          </div>

          {/* Smooth Scrollable Passage Box */}
          {showPassage && (
            <ReactLenis 
              className="h-[32vh] overflow-y-auto bg-white border-l border-r border-b border-gray-400 p-4 shrink-0 custom-scrollbar"
              options={{ syncTouch: true, smoothWheel: true }}
            >
              <div 
                className="font-medium text-gray-800" 
                style={{ fontSize: `${textSize}pt`, fontFamily, lineHeight: '1.2' }}
              >
                {passage.text}
              </div>
            </ReactLenis>
          )}

          {/* Typing Area Box */}
          <textarea
            ref={textareaRef}
            className={`w-full flex-1 p-4 border border-gray-400 resize-none outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black ${showPassage ? 'mt-3' : ''}`}
            style={{ fontSize: `${textSize}pt`, fontFamily, lineHeight: '1.2' }}
            placeholder={!isStarted ? 'Start typing here to begin the test...' : ''}
            value={userInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => e.preventDefault()}
            autoComplete="off"
            spellCheck="false"
            disabled={timeLeft === 0}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 shrink-0 pb-2">
          <button onClick={onCancel} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-8 py-2 rounded-sm font-medium shadow-sm transition-colors">
            Cancel
          </button>
          <button onClick={submitTest} className="bg-[#4c75c3] hover:bg-[#3b5b99] text-white px-8 py-2 rounded-sm font-medium shadow-sm transition-colors">
            Submit
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex justify-center items-center backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-md rounded shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Test Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Backspace Toggle */}
              <div className="flex justify-between items-center">
                <span className="font-bold">Backspace:</span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={backspaceEnabled} onChange={() => setBackspaceEnabled(!backspaceEnabled)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${backspaceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${backspaceEnabled ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-medium text-sm text-gray-700">{backspaceEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              {/* Show Passage Toggle */}
              <div className="flex justify-between items-center">
                <span className="font-bold">Show Passage:</span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={showPassage} onChange={() => setShowPassage(!showPassage)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${showPassage ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showPassage ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-medium text-sm text-gray-700">{showPassage ? 'Shown' : 'Hidden'}</span>
                </label>
              </div>

              {/* Typing Sound Toggle */}
              <div className="flex justify-between items-center">
                <span className="font-bold">Typing Sound:</span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${soundEnabled ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-medium text-sm text-gray-700">{soundEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              {/* Text Size Config */}
              <div className="flex justify-between items-center">
                <span className="font-bold">Text Size:</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTextSize(Math.max(10, textSize - 1))} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold hover:bg-blue-600">-</button>
                  <span className="w-10 text-center">{textSize}pt</span>
                  <button onClick={() => setTextSize(Math.min(30, textSize + 1))} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold hover:bg-blue-600">+</button>
                </div>
              </div>

              {/* Font Type Config */}
              <div className="flex flex-col gap-2">
                <span className="font-bold">Font:</span>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Courier New, monospace">Courier New</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}