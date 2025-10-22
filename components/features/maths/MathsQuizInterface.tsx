"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateMathsQuestion, MathsQuestion } from '@/lib/maths-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Send } from 'lucide-react';
import MathsResultsPage from '@/components/features/maths/MathsResultsPage';

const MathsQuizInterface = () => {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || '1-minute';
    const types = (searchParams.get('types') || 'add').split(',');
    const difficulty = searchParams.get('difficulty') || 'easy';

    const [questions, setQuestions] = useState<MathsQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<MathsQuestion>(generateMathsQuestion(types, difficulty));
    const [inputValue, setInputValue] = useState('');
    const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [timeLeft, setTimeLeft] = useState(mode === '1-minute' ? 60 : 0);
    const [timeTaken, setTimeTaken] = useState(0);
    const [score, setScore] = useState(0);
    const [questionKey, setQuestionKey] = useState(0);
    const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const getModeTitle = (mode: string) => {
        switch(mode) {
            case '1-minute': return '1-Minute Challenge';
            case 'bitter-end': return 'To the Bitter End';
            case 'speed-challenge': return 'Speed Challenge';
            default: return 'Maths Challenge';
        }
    };

    const startGame = () => {
        setGameStatus('playing');
        if (mode === '1-minute') {
            setTimeLeft(60);
        }
        setTimeTaken(0);
        timerRef.current = setInterval(() => {
            setTimeTaken(prev => prev + 1);
        }, 1000);
    };

    useEffect(() => {
        if (gameStatus === 'playing') {
            inputRef.current?.focus();
        }
    }, [currentQuestion, gameStatus]);

    // Moved finishGame definition before its use in the useEffect
    const finishGame = useCallback(() => {
        if (gameStatus === 'finished') return; // Prevent multiple calls
        setGameStatus('finished');
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    // FIX: Added gameStatus to dependency array as it's used inside
    }, [gameStatus]);

    // Timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined; // Define timer locally
        if (gameStatus === 'playing' && mode === '1-minute' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (gameStatus === 'playing' && mode === '1-minute' && timeLeft === 0) {
            finishGame();
        }
        return () => {
            if (timer) clearInterval(timer); // Clear interval on cleanup
        };
    // FIX: Added finishGame to dependency array
    }, [timeLeft, gameStatus, mode, finishGame]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '') return;

        const userAnswer = parseFloat(inputValue);
        const isCorrect = userAnswer === currentQuestion.answer;

        setAnswerStatus(isCorrect ? 'correct' : 'incorrect');

        const newQuestionRecord: MathsQuestion = {
            ...currentQuestion,
            userAnswer,
            isCorrect,
        };

        setQuestions(prev => [...prev, newQuestionRecord]);

        if (isCorrect) {
            const pointsPerDifficulty: { [key: string]: number } = {
                easy: 1,
                intermediate: 2,
                advanced: 3,
            };
            setScore(s => s + (pointsPerDifficulty[difficulty] || 1));
        } else if (mode === 'bitter-end') {
            setTimeout(finishGame, 500);
            return;
        }

        setTimeout(() => {
            if (mode === 'speed-challenge' && questions.length + 1 >= 20) {
                finishGame();
                return;
            }

            setInputValue('');
            setCurrentQuestion(generateMathsQuestion(types, difficulty));
            setQuestionKey(prev => prev + 1);
            setAnswerStatus('idle');
        }, 500); // Delay to show glow effect
    };

    const restartGame = () => {
        setQuestions([]);
        setCurrentQuestion(generateMathsQuestion(types, difficulty));
        setInputValue('');
        setGameStatus('ready');
        setTimeLeft(mode === '1-minute' ? 60 : 0);
        setScore(0);
        setQuestionKey(0);
        setAnswerStatus('idle');
        setTimeTaken(0);
    };

    if (gameStatus === 'finished') {
        return <MathsResultsPage questions={questions} score={score} onRestart={restartGame} settings={{mode, types, difficulty}} timeTaken={timeTaken} />;
    }

    const inputGlowClass = answerStatus === 'correct' ? 'correct-glow' : answerStatus === 'incorrect' ? 'incorrect-glow' : '';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
             <style jsx>{`
                @keyframes greenGlow {
                  from { box-shadow: 0 0 0px 4px rgba(22, 163, 74, 0.4); border-color: rgba(22, 163, 74, 0.8); }
                  to { box-shadow: 0 0 0px 4px rgba(22, 163, 74, 0); border-color: rgba(22, 163, 74, 0.5); }
                }
                @keyframes redGlow {
                  from { box-shadow: 0 0 0px 4px rgba(220, 38, 38, 0.4); border-color: rgba(220, 38, 38, 0.8); }
                  to { box-shadow: 0 0 0px 4px rgba(220, 38, 38, 0); border-color: rgba(220, 38, 38, 0.5); }
                }
                .correct-glow {
                    animation: greenGlow 0.8s ease-out;
                    border-color: #16a34a;
                }
                .incorrect-glow {
                    animation: redGlow 0.8s ease-out;
                    border-color: #dc2626;
                }
            `}</style>
            <div className="w-full max-w-lg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={questionKey}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-8 rounded-2xl shadow-xl w-full"
                    >
                         <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">{getModeTitle(mode)}</h2>
                         <p className="text-center text-gray-500 mb-6 capitalize">{difficulty} &middot; {types.join(', ')}</p>

                        {gameStatus === 'ready' ? (
                            <div className="text-center">
                                <p className="text-5xl font-bold text-gray-800 my-10">Get Ready...</p>
                                <button onClick={startGame} className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-indigo-700 transition text-xl">
                                    Start Game
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-600">Question {questions.length + 1}{mode === 'speed-challenge' ? '/20' : ''}</h3>
                                    {mode === '1-minute' ? (
                                        <div className="flex items-center space-x-2 text-red-500 font-bold">
                                            <Clock size={20} />
                                            <span>{timeLeft}s</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2 text-gray-500 font-bold">
                                            <Clock size={20} />
                                            <span>{timeTaken}s</span>
                                        </div>
                                    )}
                                    <div className="text-lg font-bold text-indigo-600">Score: {score}</div>
                                </div>

                                <p className="text-5xl md:text-6xl font-bold text-center text-gray-800 mb-8 select-none bg-gray-100 py-4 rounded-lg">{currentQuestion.question}</p>

                                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                                    <input
                                        ref={inputRef}
                                        type="number"
                                        step="any"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        className={`w-full p-4 text-3xl text-center border-2 bg-gray-50 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${inputGlowClass}`}
                                        placeholder="Your Answer..."
                                        autoFocus
                                    />
                                    <button type="submit" className="flex-shrink-0 bg-indigo-600 text-white rounded-lg p-4 hover:bg-indigo-700 transition h-[72px] w-[72px] flex items-center justify-center">
                                        <Send size={28} />
                                    </button>
                                </form>

                                <div className="flex justify-center mt-6">
                                    <button onClick={finishGame} className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition">
                                        End Game
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MathsQuizInterface;
