import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Repeat } from 'lucide-react';
import { getTypingParagraphs } from '../services/dataService';
import { useTypingSound } from '../hooks/useTypingSound';
import ResultPopup from '../components/common/ResultPopup';

const TypingTestPage = () => {
  const [paragraphs, setParagraphs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [selectedDuration, setSelectedDuration] = useState(600);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [typedText, setTypedText] = useState('');
  
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [testStartTime, setTestStartTime] = useState(null);

  const [isResultOpen, setIsResultOpen] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  
  const [fontSize, setFontSize] = useState(20);

  const { soundEnabled, toggleSound, playKeySound } = useTypingSound(false); // Default sound OFF

  const typingInputRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getTypingParagraphs();
      if (data && data.length > 0) {
        setParagraphs(data);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  const finalizeExercise = useCallback(() => {
    if (!isTestActive || finalResults) return;
    
    setIsTestActive(false);
    setIsPaused(false);
    clearInterval(timerIntervalRef.current);
    if(typingInputRef.current) typingInputRef.current.disabled = true;

    const expectedText = paragraphs[currentParagraphIndex]?.passage || '';
    const durationTaken = testStartTime ? (Date.now() - testStartTime) / 1000 : selectedDuration;
    
    const typedWords = typedText.trim() ? typedText.trim().split(/\s+/).filter(Boolean) : [];
    const expectedWords = expectedText.trim().split(/\s+/);
    
    let correctChars = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (i < expectedText.length && typedText[i] === expectedText[i]) {
            correctChars++;
        }
    }
    
    const totalCharsTyped = typedText.length;
    const totalMistakes = totalCharsTyped - correctChars;
    const minutes = (durationTaken / 60) || 0.00001;

    const grossWpm = Math.round((totalCharsTyped / 5) / minutes);
    const netWpm = Math.max(0, Math.round(grossWpm - (totalMistakes / minutes)));
    
    let correctWordsCount = 0;
    typedWords.forEach((word, i) => {
        if (word === expectedWords[i]) {
            correctWordsCount++;
        }
    });
    const netWpm2 = Math.max(0, Math.round((correctWordsCount / minutes)));
    const grossWpm2 = Math.round(typedWords.length / minutes);

    const strokesPerMin = Math.round(keystrokeCount / minutes);
    const accuracy = totalCharsTyped > 0 ? Math.max(0, Math.round((correctChars / totalCharsTyped) * 100)) : 100;

    setFinalResults({
        durationFormatted: formatTime(Math.round(durationTaken)),
        correctWords: correctWordsCount,
        totalWords: typedWords.length,
        incorrectWords: typedWords.length - correctWordsCount,
        netWpm, grossWpm, netWpm2, grossWpm2,
        strokesPerMin, accuracy, backspaceCount
    });
    setIsResultOpen(true);
  }, [isTestActive, finalResults, paragraphs, currentParagraphIndex, testStartTime, selectedDuration, typedText, keystrokeCount, backspaceCount]);

  useEffect(() => {
    if (isTestActive && !isPaused) {
        timerIntervalRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current);
                    finalizeExercise();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    } else {
        clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTestActive, isPaused, finalizeExercise]);

  const resetTestState = useCallback((newIndex = currentParagraphIndex) => {
    setIsTestActive(false);
    setIsPaused(false);
    setTimeRemaining(selectedDuration);
    setTypedText('');
    setBackspaceCount(0);
    setKeystrokeCount(0);
    setTestStartTime(null);
    setIsResultOpen(false);
    setFinalResults(null);
    setCurrentParagraphIndex(newIndex);
    if(typingInputRef.current) {
        typingInputRef.current.disabled = false;
        typingInputRef.current.focus();
    }
  }, [selectedDuration, currentParagraphIndex]);
  
  const startTest = () => {
    if (isTestActive || paragraphs.length === 0 || isLoading) return;
    setIsTestActive(true);
    setIsPaused(false);
    setTestStartTime(Date.now());
  };
  
  const togglePause = () => {
    if (!isTestActive) return;
    setIsPaused(prev => !prev);
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10);
    setSelectedDuration(newDuration);
    if (!isTestActive) {
      setTimeRemaining(newDuration);
    }
  };
  
  const changeParagraph = (newIndex) => {
    if (newIndex >= 0 && newIndex < paragraphs.length) {
      resetTestState(newIndex);
    }
  };

  const handleKeyDown = (e) => {
    if (!isTestActive && !isLoading) {
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Shift') {
        startTest();
      }
    }

    if (e.key === 'Backspace') {
        setBackspaceCount(prev => prev + 1);
    } else if ((e.key.length === 1 || e.key === ' ') && !e.metaKey && !e.ctrlKey) {
        setKeystrokeCount(prev => prev + 1);
        playKeySound();
    }
  };
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const currentParagraph = paragraphs[currentParagraphIndex];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f0fdf4' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <style>{`
              @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0; }
              }
              .cursor::before {
                  content: '';
                  position: absolute;
                  top: 10%;
                  bottom: 10%;
                  left: -2px;
                  width: 2px;
                  background-color: #10b981;
                  animation: blink 1.2s infinite;
              }
              .correct-char { color: #15803d; }
              .incorrect-char { background-color: #fee2e2; color: #b91c1c; text-decoration: underline; border-radius: 2px;}
              #typing-input { caret-color: #10b981; }
          `}</style>
        <div className="mb-4 max-w-7xl mx-auto">
          <Link to="/typing-selection.html" className="text-sm text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Typing Selection
          </Link>
        </div>

        <div className="flex justify-center gap-8">
          <div className="flex-grow max-w-7xl bg-white p-2 sm:p-4 rounded-2xl shadow-lg border">
            <div style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }} className="w-full h-64 p-4 font-mono text-gray-700 bg-gray-50 rounded-lg border border-slate-200 overflow-y-auto whitespace-pre-wrap select-none leading-relaxed">
              {isLoading || !currentParagraph ? "Loading paragraph..." : 
              currentParagraph.passage.split('').map((char, index) => {
                  let className = '';
                  if (index < typedText.length) {
                      className = char === typedText[index] ? 'correct-char' : 'incorrect-char';
                  }
                  if (index === typedText.length) {
                      className = 'relative cursor';
                  }
                  return <span key={index} className={className}>{char}</span>
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-4 my-3 px-2 font-sans">
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="duration-select" className="text-sm font-medium">Duration:</label>
                        <select id="duration-select" value={selectedDuration} onChange={handleDurationChange} className="text-sm rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500" disabled={isTestActive}>
                            <option value="60">1 Minute</option><option value="120">2 Minutes</option><option value="180">3 Minutes</option><option value="300">5 Minutes</option><option value="600">10 Minutes</option><option value="900">15 Minutes</option><option value="1200">20 Minutes</option><option value="1800">30 Minutes</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => changeParagraph(currentParagraphIndex - 1)} disabled={currentParagraphIndex === 0 || isTestActive} className="p-1.5 rounded-md hover:bg-green-100 disabled:opacity-50" title="Previous Exercise"><ChevronLeft className="w-5 h-5" /></button>
                        <select value={currentParagraphIndex} onChange={(e) => changeParagraph(parseInt(e.target.value, 10))} className="text-sm px-2 py-1 border rounded-md bg-white w-48" aria-label="Select exercise" disabled={isTestActive}>
                            {paragraphs.map((p, i) => <option key={p.test_number} value={i}>{p.title}</option>)}
                        </select>
                        <button onClick={() => changeParagraph(currentParagraphIndex + 1)} disabled={!paragraphs || currentParagraphIndex >= paragraphs.length - 1 || isTestActive} className="p-1.5 rounded-md hover:bg-green-100 disabled:opacity-50" title="Next Exercise"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>
                
                <div className="flex items-center gap-x-6">
                    <div className={`flex items-center space-x-4 ${!isTestActive && !finalResults ? 'invisible' : ''}`}>
                        <div className="flex items-center space-x-2">
                            <button onClick={togglePause} disabled={!isTestActive} className="text-sm font-semibold bg-white hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-300 flex items-center gap-2 disabled:opacity-50">
                                {isPaused ? <Play size={16}/> : <Pause size={16}/>} {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button onClick={finalizeExercise} disabled={!isTestActive} className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md border border-red-700 disabled:opacity-50">
                                Submit
                            </button>
                        </div>
                        <span className="text-lg font-mono font-bold text-green-700 w-16">{formatTime(timeRemaining)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setFontSize(s => Math.max(s - 2, 12))} className="p-1.5 rounded-md hover:bg-green-100 text-sm">A-</button>
                        <button onClick={() => setFontSize(s => Math.min(s + 2, 40))} className="p-1.5 rounded-md hover:bg-green-100 text-sm">A+</button>
                        <label className="inline-flex items-center text-sm ml-2 cursor-pointer">
                            <input id="typing-sound-checkbox" type="checkbox" checked={soundEnabled} onChange={toggleSound} className="mr-1.5 rounded text-green-600 focus:ring-green-500"/>
                            <span>Sound</span>
                        </label>
                    </div>
                </div>
            </div>

            <textarea 
              ref={typingInputRef}
              id="typing-input" 
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-48 mt-2 p-4 font-mono text-lg bg-white rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" 
              placeholder={isLoading ? "Loading..." : "Start typing to begin the test..."}
              disabled={isPaused || !!finalResults || isLoading}
            />
          </div>
        </div>
        <ResultPopup 
            isOpen={isResultOpen}
            results={finalResults}
            onClose={() => setIsResultOpen(false)}
            onRepeat={() => resetTestState(currentParagraphIndex)}
            onNext={() => changeParagraph(currentParagraphIndex + 1)}
        />
      </div>
    </main>
  );
};

export default TypingTestPage;

