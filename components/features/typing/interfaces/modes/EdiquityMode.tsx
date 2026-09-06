'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CGLModeProps } from '../CGLInterface';
import { Settings, Maximize, Volume2, VolumeX, ArrowLeft, X } from 'lucide-react';
import { ReactLenis } from '@studio-freight/react-lenis';
import useTypingSound from '@/hooks/useTypingSound';

export default function EdiquityMode({ passage, examRules, onFinish, onCancel, currentMode, onChangeMode }: CGLModeProps) {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(examRules.duration);
  const [isStarted, setIsStarted] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [textSize, setTextSize] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [backspaceEnabled, setBackspaceEnabled] = useState(examRules.allowBackspace ?? true);
  const [showPassage, setShowPassage] = useState(true);
  const [fontFamily, setFontFamily] = useState('Times New Roman, serif');
  
  const playTypingSound = useTypingSound();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStarted && timeLeft > 0) interval = setInterval(() => setTimeLeft(p => p - 1), 1000);
    else if (isStarted && timeLeft === 0) submitTest();
    return () => clearInterval(interval);
  }, [isStarted, timeLeft]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isStarted) setIsStarted(true);
    if (soundEnabled && typeof playTypingSound === 'function') playTypingSound();
    if (e.key === 'Backspace' && !backspaceEnabled) {
      e.preventDefault();
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.warn);
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  const submitTest = useCallback(() => {
    const timeInMinutes = (examRules.duration - timeLeft) / 60;
    const typedWords = userInput.trim().split(/\s+/);
    const originalWords = passage.text.trim().split(/\s+/);
    let errors = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] !== originalWords[i] && typedWords[i] !== '') errors++;
    }
    const grossWpmRaw = timeInMinutes > 0 ? (userInput.length / 5) / timeInMinutes : 0;
    const netWpmRaw = Math.max(0, grossWpmRaw - (errors / timeInMinutes));
    const accuracyRaw = grossWpmRaw > 0 ? Math.max(0, (netWpmRaw / grossWpmRaw) * 100) : 0;
    
    onFinish({
      testName: `Typing Test - ${examRules.name} ${passage.title}`,
      keyStrokesByCandidate: userInput.length,
      fullMistakes: errors,
      totalErrors: errors,
      errorPercentage: userInput.length > 0 ? (errors / (userInput.length / 5)) * 100 : 0,
      wpm: grossWpmRaw,      
      netWpm: netWpmRaw,     
      accuracy: accuracyRaw, 
      timeTakenInSeconds: examRules.duration - timeLeft,
      qualified: netWpmRaw >= (examRules.targetWpm || 27),
      marks: netWpmRaw, 
      originalText: passage.text,
      typedText: userInput,
    });
  }, [userInput, passage.text, timeLeft, examRules, onFinish]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-screen bg-gray-200 text-black overflow-hidden font-sans">
      
      <div className="bg-[#334155] px-4 py-2 flex flex-wrap items-center justify-between text-white shadow-md shrink-0 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onCancel} className="bg-white text-black px-3 py-1 rounded-sm text-sm font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors"><ArrowLeft size={16}/> Back</button>
          <button onClick={() => setTextSize(s => Math.min(30, s + 1))} className="bg-white text-black px-3 py-1 rounded-sm text-sm font-bold hover:bg-gray-100 transition-colors">+ A+</button>
          <button onClick={() => setTextSize(s => Math.max(10, s - 1))} className="bg-white text-black px-3 py-1 rounded-sm text-sm font-bold hover:bg-gray-100 transition-colors">- A-</button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="bg-red-600 text-white px-3 py-1 rounded-sm text-sm font-bold flex items-center gap-1 hover:bg-red-700 transition-colors">
            {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>} Sound: {soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={() => setShowSettings(true)} className="bg-white text-black px-3 py-1 rounded-sm text-sm font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors"><Settings size={16}/> Settings</button>
          <button onClick={toggleFullScreen} className="bg-white text-black px-3 py-1 rounded-sm text-sm font-bold flex items-center gap-1 hover:bg-gray-100 transition-colors"><Maximize size={16}/> Full Screen</button>
        </div>
        <div className="font-bold text-xl tracking-wide">{examRules.name} {passage.title}</div>
        <div className="font-bold text-xl tracking-wide">Time Left {formatTime(timeLeft)}</div>
      </div>
      
      {/* Changed to fixed heights and removed max-width constraints */}
      <div className="flex-1 px-2 pt-4 pb-2 flex flex-col gap-4 w-full">
        
        {showPassage && (
          <ReactLenis className="h-[35vh] overflow-y-auto bg-white border border-gray-800 p-4 shadow-sm custom-scrollbar shrink-0" options={{ syncTouch: true, smoothWheel: true }}>
            <div className="text-gray-900" style={{ fontSize: `${textSize}pt`, fontFamily, lineHeight: '1.3' }}>
              {passage.text}
            </div>
          </ReactLenis>
        )}
        
        <textarea
          ref={textareaRef}
          className="h-[25vh] bg-[#eef7e1] border border-gray-800 p-4 outline-none resize-none shadow-sm text-gray-900 overflow-y-auto shrink-0"
          style={{ fontSize: `${textSize}pt`, fontFamily, lineHeight: '1.3' }}
          placeholder="Start typing here...."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          disabled={timeLeft === 0}
        />
        
        <div className="flex justify-center mt-2 shrink-0">
          <button onClick={submitTest} className="bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-500 hover:from-gray-200 hover:to-gray-400 text-black px-12 py-2.5 rounded font-bold shadow-md text-lg transition-all active:scale-95">
            Submit Test
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-xl font-bold">Test Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 border"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col gap-2">
                <span className="font-bold">Interface Mode:</span>
                <select value={currentMode} onChange={(e) => onChangeMode(e.target.value as any)} className="border rounded-lg px-4 py-2.5 bg-gray-50 font-medium">
                  <option value="ediquity">Ediquity Mode</option>
                  <option value="nta">NTA Mode</option>
                  <option value="tcs">TCS Mode (Official CGL)</option>
                </select>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Backspace:</span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={backspaceEnabled} onChange={() => setBackspaceEnabled(!backspaceEnabled)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${backspaceEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${backspaceEnabled ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-medium text-sm text-gray-700 w-16">{backspaceEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Show Passage:</span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={showPassage} onChange={() => setShowPassage(!showPassage)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${showPassage ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showPassage ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-medium text-sm text-gray-700 w-16">{showPassage ? 'Shown' : 'Hidden'}</span>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Typing Sound:</span>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${soundEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${soundEnabled ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-medium text-sm text-gray-700 w-16">{soundEnabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Text Size:</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setTextSize(Math.max(10, textSize - 1))} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold hover:bg-gray-300">-</button>
                  <span className="w-10 text-center">{textSize}pt</span>
                  <button onClick={() => setTextSize(Math.min(30, textSize + 1))} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold hover:bg-blue-600">+</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold">Font:</span>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="border rounded px-3 py-2 bg-gray-50 focus:ring-blue-500">
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