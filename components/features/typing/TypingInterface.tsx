'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ExamRules, Passage } from '@/lib/typing/types';
import { TypingResult as TypingResultType } from '@/lib/typing-types';

interface ClassicTypingProps {
  passage: Passage;
  examRules: ExamRules;
  onFinish: (stats: TypingResultType) => void;
  onCancel: () => void;
}

export default function TypingInterface({
  passage,
  examRules,
  onFinish,
  onCancel,
}: ClassicTypingProps) {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(examRules.duration);
  const [isStarted, setIsStarted] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [backspaceEnabled, setBackspaceEnabled] = useState(
    examRules.allowBackspace
  );
  const [showPassage, setShowPassage] = useState(false);
  const [textSize, setTextSize] = useState(15);
  const [fontFamily, setFontFamily] = useState('Times New Roman, serif');
  const [nightMode, setNightMode] = useState(false);

  const backspaceCount = useRef(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted && timeLeft > 0) {
      interval = setInterval(
        () => setTimeLeft((prev) => prev - 1),
        1000
      );
    } else if (isStarted && timeLeft === 0) {
      submitTest();
    }

    return () => clearInterval(interval);
  }, [isStarted, timeLeft]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isStarted) setIsStarted(true);

    if (e.key === 'Backspace') {
      backspaceCount.current += 1;

      if (!backspaceEnabled) {
        e.preventDefault(); 
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

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

  const submitTest = () => {
    const timeTaken = examRules.duration - timeLeft;
    const timeInMinutes = timeTaken / 60;

    // --- CLOUD SANITIZER & GREEDY LOOKAHEAD ENGINE ---
    const normalizeText = (text: string) => {
      return text
        .replace(/[\u2018\u2019]/g, "'") 
        .replace(/[\u201C\u201D]/g, '"') 
        .replace(/[\u2013\u2014]/g, '-') 
        .replace(/[\u200B-\u200D\uFEFF]/g, '') 
        .replace(/\u00A0/g, ' ') 
        .trim();
    };

    const cleanTyped = normalizeText(userInput);
    const cleanOrig = normalizeText(passage.text);

    const typedWords = cleanTyped.split(/\s+/).filter(Boolean);
    const originalWords = cleanOrig.split(/\s+/).filter(Boolean);

    let errors = 0;
    let origIdx = 0;
    let typedIdx = 0;

    while (typedIdx < typedWords.length && origIdx < originalWords.length) {
      if (typedWords[typedIdx] === originalWords[origIdx]) {
        typedIdx++;
        origIdx++;
      } else {
        errors++;
        let realigned = false;
        for (let lookahead = 1; lookahead <= 5; lookahead++) {
          if (origIdx + lookahead < originalWords.length && typedWords[typedIdx] === originalWords[origIdx + lookahead]) {
            origIdx += lookahead;
            realigned = true;
            break;
          }
          if (typedIdx + lookahead < typedWords.length && typedWords[typedIdx + lookahead] === originalWords[origIdx]) {
            typedIdx += lookahead;
            realigned = true;
            break;
          }
        }
        if (!realigned) {
          typedIdx++;
          origIdx++;
        }
      }
    }
    
    if (typedIdx < typedWords.length) {
      errors += (typedWords.length - typedIdx);
    }
    // ----------------------------------------------------------------

    const totalKeystrokes = userInput.length;

    const grossWpm =
      timeInMinutes > 0
        ? Math.round((totalKeystrokes / 5) / timeInMinutes)
        : 0;

    const netWpm = Math.max(
      0,
      grossWpm - Math.round(errors / timeInMinutes)
    );

    const accuracy =
      grossWpm > 0
        ? Math.max(0, Math.round((netWpm / grossWpm) * 100))
        : 0;

    const errorPercentage =
      totalKeystrokes > 0
        ? (errors / (totalKeystrokes / 5)) * 100
        : 0;

    let calculatedMarks = 0;

    if (netWpm >= 50) {
      calculatedMarks = 25;
    } else if (netWpm >= 46) {
      calculatedMarks = 21;
    } else if (netWpm >= 41) {
      calculatedMarks = 18;
    } else if (netWpm >= 36) {
      calculatedMarks = 15;
    } else if (netWpm >= 31) {
      calculatedMarks = 12;
    } else if (netWpm === 30) {
      calculatedMarks = 10;
    } else {
      calculatedMarks = 0; 
    }

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
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex flex-col min-h-screen ${
        nightMode
          ? 'bg-[#1e1e1e] text-white'
          : 'bg-gray-100 text-black'
      }`}
    >
      <div className="bg-[#4c75c3] text-white text-center py-2 px-4 text-xl font-bold tracking-wide">
        Typing Test - {examRules.name} {passage.title}
      </div>

      <div className="bg-[#333333] text-white px-4 py-2 flex flex-wrap justify-between items-center text-sm gap-2">
        <div className="flex items-center gap-4">
          <span>{examRules.name}</span>

          <a
            href={passage.pdfUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300"
          >
            Click to Download Passage PDF
          </a>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="font-bold text-yellow-400 text-base mr-2">
            Time left: {formatTime(timeLeft)}
          </span>

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

      <div className="flex-1 p-2 md:p-6 lg:px-12 flex flex-col mx-auto w-full max-w-7xl">
        <div className="bg-[#5b87c6] text-white px-3 py-1 text-sm border border-[#5b87c6]">
          Keyboard Layout: QWERTY Language: English
        </div>

        {showPassage && (
          <div
            className={`p-4 border-l border-r border-t overflow-y-auto max-h-48 leading-relaxed select-none ${
              nightMode
                ? 'bg-gray-800 border-gray-700 text-gray-200'
                : 'bg-white border-gray-400 text-gray-800'
            }`}
            style={{
              fontSize: `${textSize}pt`,
              fontFamily,
            }}
          >
            {passage.text}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className={`w-full flex-1 min-h-[400px] p-4 border resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner ${
            nightMode
              ? 'bg-[#121212] border-gray-700 text-white'
              : 'bg-white border-gray-400 text-black'
          }`}
          style={{
            fontSize: `${textSize}pt`,
            fontFamily,
            lineHeight: '1.6',
          }}
          placeholder={
            !isStarted
              ? 'Start typing here to begin the test...'
              : ''
          }
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          spellCheck="false"
          disabled={timeLeft === 0}
        />

        <div className="mt-6 flex gap-4">
          <button
            onClick={onCancel}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-6 py-2.5 rounded font-medium shadow-md transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={submitTest}
            className="bg-[#4c75c3] hover:bg-[#3b5b99] text-white px-6 py-2.5 rounded font-medium shadow-md transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-md rounded shadow-2xl flex flex-col max-h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Test Settings</h2>

              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-bold">Backspace:</span>

                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={backspaceEnabled}
                      onChange={() =>
                        setBackspaceEnabled(!backspaceEnabled)
                      }
                    />

                    <div
                      className={`block w-14 h-8 rounded-full transition-colors ${
                        backspaceEnabled
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    ></div>

                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        backspaceEnabled
                          ? 'transform translate-x-6'
                          : ''
                      }`}
                    ></div>
                  </div>

                  <span className="ml-3 font-medium text-sm text-gray-700">
                    {backspaceEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Show Passage:</span>

                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={showPassage}
                      onChange={() => setShowPassage(!showPassage)}
                    />

                    <div
                      className={`block w-14 h-8 rounded-full transition-colors ${
                        showPassage
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    ></div>

                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        showPassage
                          ? 'transform translate-x-6'
                          : ''
                      }`}
                    ></div>
                  </div>

                  <span className="ml-3 font-medium text-sm text-gray-700">
                    {showPassage ? 'Shown' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Text Size:</span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setTextSize(Math.max(10, textSize - 1))
                    }
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold hover:bg-blue-600"
                  >
                    -
                  </button>

                  <span className="w-10 text-center">
                    {textSize}pt
                  </span>

                  <button
                    onClick={() =>
                      setTextSize(Math.min(30, textSize + 1))
                    }
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold hover:bg-blue-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Font:</span>

                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Times New Roman, serif">
                    Times New Roman
                  </option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Courier New, monospace">
                    Courier New
                  </option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold">Screen Layout:</span>

                <select className="border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="nta">NTA Mode</option>
                  <option value="standard">Standard Mode</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Night Mode:</span>

                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={nightMode}
                      onChange={() => setNightMode(!nightMode)}
                    />

                    <div
                      className={`block w-14 h-8 rounded-full transition-colors ${
                        nightMode
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    ></div>

                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        nightMode
                          ? 'transform translate-x-6'
                          : ''
                      }`}
                    ></div>
                  </div>

                  <span className="ml-3 font-medium text-sm text-gray-700">
                    {nightMode ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}