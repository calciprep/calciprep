"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TypingResult from './TypingResult';
import { calculateTypingResult } from '@/lib/typing-utils';
import useTypingSound from '@/hooks/useTypingSound';
import { TypingMode, TypingResult as TypingResultType } from '@/lib/typing-types';
import { Timer, Zap, ChevronDown, CheckCircle, RefreshCw } from 'lucide-react';
import './TypingInterface.css';

interface TypingInterfaceProps {
  exercises: any;
  mode: TypingMode;
}

const TIMER_OPTIONS = [1, 3, 5, 10, 15, 30, 60];

const TypingInterface: React.FC<TypingInterfaceProps> = ({ exercises, mode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [text, setText] = useState('');

  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'finished'>('waiting');
  const [time, setTime] = useState(60);
  const [selectedTime, setSelectedTime] = useState(60);
  
  const [result, setResult] = useState<TypingResultType | null>(null);

  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null); // For precise time measurement
  const inputRef = useRef<HTMLInputElement>(null);
  const playTypingSound = useTypingSound();
  const wordContainerRef = useRef<HTMLDivElement>(null);

  // Unified function to end the test and calculate results
  const finishTest = useCallback(() => {
    if (gameState === 'finished') return; // Prevent multiple submissions

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setGameState('finished');

    const endTime = Date.now();
    let timeTakenInSeconds = selectedTime - time; // Fallback calculation
    if (startTimeRef.current) {
        timeTakenInSeconds = (endTime - startTimeRef.current) / 1000;
    }

    const calculatedResult = calculateTypingResult(text, userInput, timeTakenInSeconds);
    setResult(calculatedResult);
  }, [gameState, selectedTime, time, text, userInput]);


  const resetState = useCallback(() => {
    setGameState('waiting');
    setUserInput('');
    setTime(selectedTime);
    setResult(null);
    startTimeRef.current = null;
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, [selectedTime]);

  const generateAndSetText = useCallback((category: string, index: number) => {
    if (!exercises) {
      setText('');
      return;
    }

    let newText = '';
    if (mode === 'learn-keys') {
      newText = exercises[category]?.[index] || '';
    } else if (mode === 'practice-words') {
      const words = exercises[category] || [];
      if (words.length > 0) {
        newText = Array.from({ length: 100 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
      }
    } else if (mode === 'type-paragraphs') {
      newText = exercises[index] || '';
    } else if (mode === 'take-tests') {
      newText = exercises[index]?.passage || '';
    }
    setText(newText);
    resetState();
  }, [mode, exercises, resetState]);

  // Initialize categories and exercises
  useEffect(() => {
    if (!exercises) return;

    if (mode === 'learn-keys' || mode === 'practice-words') {
      const firstCategory = Object.keys(exercises)[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory);
        generateAndSetText(firstCategory, 0);
      }
    } else if ((mode === 'type-paragraphs' || mode === 'take-tests') && exercises.length > 0) {
      generateAndSetText('', 0);
    }
  }, [mode, exercises, generateAndSetText]);
  
  const startTimer = useCallback(() => {
    if (gameState === 'waiting') {
      setGameState('running');
      startTimeRef.current = Date.now(); // Record precise start time
      timerInterval.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval.current!);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [gameState]);

  // Effect to end the game when the timer runs out
  useEffect(() => {
    if (gameState === 'running' && time === 0) {
        finishTest();
    }
  }, [gameState, time, finishTest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState === 'finished' || (text && e.target.value.length > text.length)) return;

    if (gameState === 'waiting' && e.target.value.length > 0) {
        startTimer();
    }
    playTypingSound();
    setUserInput(e.target.value);
  };
  
  // NEW: Effect to auto-submit when the paragraph is fully typed
  useEffect(() => {
    if (text && userInput.length === text.length) {
        finishTest();
    }
  }, [userInput, text, finishTest]);

  const chars = useMemo(() => text.split('').map((char, index) => {
    let state = 'pending';
    if (index < userInput.length) {
      state = char === userInput[index] ? 'correct' : 'incorrect';
    }
    return { char, state };
  }), [text, userInput]);
  
  const currentCharlIndex = userInput.length;

   useEffect(() => {
    const cursor = document.getElementById('cursor');
    const currentCharSpan = document.getElementById(`char-${currentCharlIndex}`);
    const wordContainer = wordContainerRef.current;

    if (cursor && currentCharSpan && wordContainer) {
      const charRect = currentCharSpan.getBoundingClientRect();
      const containerRect = wordContainer.getBoundingClientRect();
      
      cursor.style.left = `${charRect.left - containerRect.left}px`;
      cursor.style.top = `${charRect.top - containerRect.top + wordContainer.scrollTop}px`;

      // Auto-scroll logic
      if (charRect.bottom > containerRect.bottom - 20) {
        wordContainer.scrollTop += charRect.height + 10;
      } else if (charRect.top < containerRect.top + 20 && wordContainer.scrollTop > 0) {
         wordContainer.scrollTop -= charRect.height + 10;
      }
    } else if (cursor && currentCharlIndex === 0) {
        const firstCharSpan = document.getElementById(`char-0`);
        if(firstCharSpan && wordContainer) {
            const charRect = firstCharSpan.getBoundingClientRect();
            const containerRect = wordContainer.getBoundingClientRect();
            cursor.style.left = `${charRect.left - containerRect.left}px`;
            cursor.style.top = `${charRect.top - containerRect.top}px`;
        }
    }
  }, [currentCharlIndex, chars]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedExerciseIndex(0);
    generateAndSetText(newCategory, 0);
  };

  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    setSelectedExerciseIndex(newIndex);
    generateAndSetText(selectedCategory, newIndex);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if(result) {
    return <TypingResult result={result} onRestart={resetState} />;
  }

  return (
    <div className="typing-interface-container" onClick={() => inputRef.current?.focus()}>
      <div className="options-bar">
        { (mode === 'learn-keys' || mode === 'practice-words') && exercises && (
          <div className="select-wrapper">
             <select value={selectedCategory} onChange={handleCategoryChange}>
              {Object.keys(exercises).map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
        )}

        {exercises && <div className="select-wrapper">
           <select value={selectedExerciseIndex} onChange={handleExerciseChange}>
            {(mode === 'learn-keys' || mode === 'practice-words')
              ? exercises[selectedCategory]?.map((_:any, i:number) => <option key={i} value={i}>Exercise {i + 1}</option>)
              : (mode === 'take-tests' || mode === 'type-paragraphs') && exercises.map((item:any, i:number) => (
                  <option key={i} value={i}>
                    {mode === 'take-tests' ? item.title || `Test ${i + 1}` : `Paragraph ${i + 1}`}
                  </option>
                ))
            }
          </select>
          <ChevronDown size={16} />
        </div>}
        
        <div className="timer-options">
            <Timer size={16} className="timer-icon" />
            {TIMER_OPTIONS.map(t => (
                <button key={t} className={selectedTime / 60 === t ? 'active' : ''} onClick={() => { setSelectedTime(t * 60); setTime(t*60); resetState(); }}>
                    {t}
                </button>
            ))}
        </div>

        { gameState === 'running' && (
            <div className='options-bar-timer-display'>
              {formatTime(time)}
            </div>
        )}
      </div>

      <div className="typing-area">
        { gameState === 'waiting' && (
             <div className='overlay-text'>
              <Zap size={24} />
              <p>Start typing to begin the test</p>
            </div>
        )}
        <div className="word-container" ref={wordContainerRef}>
          <div id="cursor" className={`cursor ${gameState === 'running' ? 'blinking' : ''}`}></div>
          {chars.map(({ char, state }, index) => (
            <span key={index} id={`char-${index}`} className={`char ${state} ${index === currentCharlIndex ? 'current' : ''}`}>
              {char}
            </span>
          ))}
        </div>
        <input ref={inputRef} type="text" value={userInput} onChange={handleInputChange} autoFocus onBlur={(e) => e.target.focus()} className="hidden-input"/>
      </div>

       <div className="bottom-bar">
        <button className="restart-btn" onClick={resetState}>
            <RefreshCw size={16} />
        </button>
        {gameState === 'running' && (
            <button className="submit-btn" onClick={finishTest}>
                <CheckCircle size={16} />
                <span>Submit</span>
            </button>
        )}
       </div>
    </div>
  );
};

export default TypingInterface;

