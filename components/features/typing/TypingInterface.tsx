"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TypingResult from './TypingResult';
import { calculateTypingResult } from '@/lib/typing-utils';
import useTypingSound from '@/hooks/useTypingSound';
import { TypingMode, TypingResult as TypingResultType } from '@/lib/typing-types';
import { Timer, ChevronDown, CheckCircle, RefreshCw } from 'lucide-react';
import './TypingInterface.css';

// Define exercise lengths for practice words
const PRACTICE_WORD_COUNTS = [50, 100, 150, 200];


// Define a more specific type for the exercises prop based on the mode
type ExerciseData =
  | Record<string, string[]> // For learn-keys and practice-words
  | string[] // For type-paragraphs
  | { title?: string; passage?: string }[] // For take-tests
  | null;

interface TypingInterfaceProps {
  exercises: ExerciseData;
  mode: TypingMode;
}

const TIMER_OPTIONS = [1, 3, 5, 10, 15, 30, 60]; // In minutes

const TypingInterface: React.FC<TypingInterfaceProps> = ({ exercises, mode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  // NEW state for practice words count
  const [selectedWordCount, setSelectedWordCount] = useState<number>(PRACTICE_WORD_COUNTS[1]); // Default to 100 words
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'finished'>('waiting');
  const [time, setTime] = useState(60); // Time state in seconds
  const [selectedTime, setSelectedTime] = useState(60); // Selected duration in seconds

  const [result, setResult] = useState<TypingResultType | null>(null);

  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playTypingSound = useTypingSound();
  const wordContainerRef = useRef<HTMLDivElement>(null);
  const latestUserInputRef = useRef(userInput);

   useEffect(() => {
    latestUserInputRef.current = userInput;
  }, [userInput]);

  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  const finishTest = useCallback(() => {
    if (gameState === 'finished' || (gameState === 'waiting' && latestUserInputRef.current === '')) return;

    stopTimer();
    setGameState('finished');

    const endTime = Date.now();
    let timeTakenInSeconds: number;

    if (time === 0 && gameState === 'running') {
        timeTakenInSeconds = selectedTime;
    } else if (startTimeRef.current) {
        timeTakenInSeconds = Math.max(0.1, (endTime - startTimeRef.current) / 1000);
    } else {
        timeTakenInSeconds = 0.1;
    }

    const finalUserInput = latestUserInputRef.current;
    const calculatedResult = text ? calculateTypingResult(text, finalUserInput, timeTakenInSeconds) : null;
    setResult(calculatedResult);

  }, [gameState, selectedTime, time, text, stopTimer]);


  const resetState = useCallback((newSelectedTime?: number) => {
    stopTimer();
    const timeToSet = newSelectedTime ?? selectedTime;
    setGameState('waiting');
    setUserInput('');
    latestUserInputRef.current = '';
    setTime(timeToSet);
    setResult(null);
    startTimeRef.current = null;
    if (wordContainerRef.current) {
      wordContainerRef.current.scrollTop = 0;
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [selectedTime, stopTimer]);

   const generateAndSetText = useCallback((category: string, indexOrWordCount: number) => {
    if (!exercises || typeof exercises !== 'object') {
        setText('');
        resetState(selectedTime);
        return;
    }

    let newText = '';
    if (mode === 'learn-keys' && typeof exercises === 'object' && !Array.isArray(exercises) && exercises !== null) {
      const categoryExercises = exercises[category] as string[] | undefined;
      newText = categoryExercises?.[indexOrWordCount] || ''; // indexOrWordCount is the exercise index here
    } else if (mode === 'practice-words' && typeof exercises === 'object' && !Array.isArray(exercises) && exercises !== null) {
      const words = exercises[category] as string[] | undefined;
      const count = indexOrWordCount; // indexOrWordCount is the word count here
      if (words && words.length > 0) {
        newText = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
      } else {
        newText = '';
      }
    } else if (mode === 'type-paragraphs' && Array.isArray(exercises) && typeof exercises[0] === 'string') {
        newText = (exercises as string[])[indexOrWordCount] || ''; // indexOrWordCount is the exercise index here
    } else if (mode === 'take-tests' && Array.isArray(exercises) && typeof exercises[0] === 'object') {
        newText = (exercises as { passage?: string }[])[indexOrWordCount]?.passage || ''; // indexOrWordCount is the exercise index here
    }

    setText(newText);
    resetState(selectedTime);
}, [mode, exercises, resetState, selectedTime]);


  // Initialize categories and exercises, and focus input
  useEffect(() => {
    if (!exercises || typeof exercises !== 'object') return;

    let initialCategory = '';
    let initialIndexOrWordCount = 0; // Default index

    if ((mode === 'learn-keys' || mode === 'practice-words') && !Array.isArray(exercises) && exercises !== null) {
      initialCategory = Object.keys(exercises)[0] || '';
      if (initialCategory) {
        setSelectedCategory(initialCategory);
        if (mode === 'practice-words') {
             initialIndexOrWordCount = selectedWordCount; // Use selected word count for initial generation
        }
      }
    } else if ((mode === 'type-paragraphs' || mode === 'take-tests') && Array.isArray(exercises)) {
        initialIndexOrWordCount = 0; // Use index 0 for paragraphs/tests
    }


    generateAndSetText(initialCategory, initialIndexOrWordCount);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, exercises]); // Rerun only if mode/exercises change fundamentally


  const startTimer = useCallback(() => {
    if (gameState === 'waiting' && text && text.length > 0) {
      setGameState('running');
      startTimeRef.current = Date.now();
      timerInterval.current = setInterval(() => {
        setTime(prevTime => {
          const nextTime = prevTime - 1;
          if (nextTime <= 0) {
            stopTimer();
            // Use a slight delay for finishTest to allow state update if needed, though ref should handle it
            setTimeout(finishTest, 0);
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    }
  }, [gameState, text, stopTimer, finishTest]);


    useEffect(() => {
        return () => stopTimer();
    }, [stopTimer]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState === 'finished' || (text && e.target.value.length > text.length)) return;

    const newValue = e.target.value;
    setUserInput(newValue);

    if (gameState === 'waiting' && newValue.length === 1 && text && text.length > 0) {
        startTimer();
    }

    if (newValue.length > userInput.length || newValue.length > 0) {
        playTypingSound();
    }

     if (text && newValue.length === text.length && gameState === 'running') {
        setTimeout(finishTest, 0);
    }
  };

  const chars = useMemo(() => text ? text.split('').map((char, index) => {
    let state = 'pending';
    if (index < userInput.length) {
      state = char === userInput[index] ? 'correct' : 'incorrect';
    }
    return { char, state };
  }) : [], [text, userInput]);

  const currentCharlIndex = userInput.length;

  useEffect(() => {
    const cursor = document.getElementById('cursor');
    const wordContainer = wordContainerRef.current;
    if (!cursor || !wordContainer || !text) return;

    let targetSpan: HTMLElement | null = null;

    if (currentCharlIndex >= text.length) {
      targetSpan = document.getElementById(`char-${text.length - 1}`);
       if (targetSpan) {
            const charRect = targetSpan.getBoundingClientRect();
            const containerRect = wordContainer.getBoundingClientRect();
            cursor.style.left = `${charRect.right - containerRect.left + wordContainer.scrollLeft}px`;
            cursor.style.top = `${charRect.top - containerRect.top + wordContainer.scrollTop}px`;
       } else if (text.length === 0) {
            cursor.style.left = `0px`;
            cursor.style.top = `0px`;
       }
    } else {
      targetSpan = document.getElementById(`char-${currentCharlIndex}`);
      if (targetSpan) {
          const charRect = targetSpan.getBoundingClientRect();
          const containerRect = wordContainer.getBoundingClientRect();
          cursor.style.left = `${charRect.left - containerRect.left + wordContainer.scrollLeft}px`;
          cursor.style.top = `${charRect.top - containerRect.top + wordContainer.scrollTop}px`;
      }
    }

    if (targetSpan && (gameState === 'running' || gameState === 'waiting')) {
        const spanRect = targetSpan.getBoundingClientRect();
        const containerRect = wordContainer.getBoundingClientRect();

       const isVisible =
         spanRect.top >= containerRect.top &&
         spanRect.bottom <= containerRect.bottom;

        if (!isVisible) {
            targetSpan.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    } else if (currentCharlIndex === 0) {
        wordContainer.scrollTop = 0;
    }

  }, [currentCharlIndex, text, gameState]);


  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedExerciseIndex(0); // Reset index for learn-keys/paragraphs/tests
    const countOrIndex = mode === 'practice-words' ? selectedWordCount : 0; // Use word count or index 0
    generateAndSetText(newCategory, countOrIndex);
  };

  // Handler specifically for exercise index (learn-keys, paragraphs, tests)
  const handleExerciseIndexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    setSelectedExerciseIndex(newIndex);
    generateAndSetText(selectedCategory, newIndex); // Use selected category and new index
  };

  // Handler specifically for word count (practice-words)
  const handleWordCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCount = parseInt(e.target.value, 10);
      setSelectedWordCount(newCount);
      generateAndSetText(selectedCategory, newCount); // Use selected category and new count
  };


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRestartFromResults = () => {
     // Use the appropriate value based on the mode for regeneration
    const countOrIndex = mode === 'practice-words' ? selectedWordCount : selectedExerciseIndex;
    generateAndSetText(selectedCategory, countOrIndex);
  };

  if (gameState === 'finished' && result) {
    return <TypingResult result={result} onRestart={handleRestartFromResults} />;
  }
   if (gameState === 'finished' && !result) {
       return <div className="typing-result-wrapper"><p>Calculating results...</p></div>;
   }

  const canRenderCategorySelect = (mode === 'learn-keys' || mode === 'practice-words') && exercises && typeof exercises === 'object' && !Array.isArray(exercises) && exercises !== null;

  return (
    <div className="typing-interface-container" onClick={() => inputRef.current?.focus()}>
      <div className="options-bar">
        {/* Category Dropdown (Learn Keys & Practice Words) */}
        { canRenderCategorySelect && (
          <div className="select-wrapper">
             <select value={selectedCategory} onChange={handleCategoryChange} disabled={gameState === 'running'}>
              {Object.keys(exercises).map(cat => <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>)}
            </select>
            <ChevronDown size={16} />
          </div>
        )}

        {/* Exercise Index Dropdown (Learn Keys, Paragraphs, Tests) */}
        {(mode === 'learn-keys' || mode === 'type-paragraphs' || mode === 'take-tests') && exercises && (
          <div className="select-wrapper">
            <select value={selectedExerciseIndex} onChange={handleExerciseIndexChange} disabled={gameState === 'running'}>
              {mode === 'learn-keys' && canRenderCategorySelect
                ? (exercises[selectedCategory] as string[] | undefined)?.map((_, i: number) => <option key={i} value={i}>Exercise {i + 1}</option>)
                : (mode === 'type-paragraphs' || mode === 'take-tests') && Array.isArray(exercises) && exercises.map((item: string | { title?: string; passage?: string }, i: number) => (
                    <option key={i} value={i}>
                      {mode === 'take-tests' && typeof item === 'object' ? item.title || `Test ${i + 1}` : `Paragraph ${i + 1}`}
                    </option>
                  ))
              }
            </select>
            <ChevronDown size={16} />
          </div>
        )}

         {/* Word Count Dropdown (Practice Words ONLY) */}
         {mode === 'practice-words' && exercises && (
            <div className="select-wrapper">
                <select value={selectedWordCount} onChange={handleWordCountChange} disabled={gameState === 'running'}>
                {PRACTICE_WORD_COUNTS.map((count) => <option key={count} value={count}>{count} Words</option>)}
                </select>
                <ChevronDown size={16} />
            </div>
        )}


        {/* Timer Options */}
        <div className="timer-options">
            <Timer size={16} className="timer-icon" />
            {TIMER_OPTIONS.map(t => (
                <button
                    key={t}
                    className={selectedTime / 60 === t ? 'active' : ''}
                    onClick={() => {
                        const newTimeSeconds = t * 60;
                        setSelectedTime(newTimeSeconds);
                        setTime(newTimeSeconds);
                        resetState(newTimeSeconds);
                    }}
                    disabled={gameState === 'running'}
                >
                    {t}
                </button>
            ))}
        </div>

        {/* Timer Display */}
        { (gameState === 'running' || gameState === 'finished') && (
            <div className='options-bar-timer-display'>
              {formatTime(time)}
            </div>
        )}
      </div>

      {/* Typing Area */}
      <div className="typing-area">
        <div className={`word-container`} ref={wordContainerRef}>
           {text && <div id="cursor" className={`cursor ${gameState === 'running' || gameState === 'waiting' ? 'blinking' : ''}`}></div>}
           {chars.map(({ char, state }, index) => (
            <span key={index} id={`char-${index}`} className={`char ${state} ${index === currentCharlIndex ? 'current' : ''}`}>
               {char}
            </span>
          ))}
           {text && <span id={`char-${text.length}`} className="char pending">&#8203;</span>}
        </div>
        <input ref={inputRef} type="text" value={userInput} onChange={handleInputChange} autoFocus onBlur={(e) => {if(gameState !== 'finished') e.target.focus()}} className="hidden-input"/>
      </div>

      {/* Bottom Bar */}
       <div className="bottom-bar">
        <button className="restart-btn" onClick={handleRestartFromResults} title="Restart Test / New Words">
            <RefreshCw size={16} />
        </button>
        {gameState === 'running' && (
            <button className="submit-btn" onClick={finishTest} title="Finish Test">
                <CheckCircle size={16} />
                <span>Submit</span>
            </button>
        )}
       </div>
    </div>
  );
};

export default TypingInterface;

