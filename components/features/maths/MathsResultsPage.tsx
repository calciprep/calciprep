"use client";

import React from 'react';
import type { MathsQuestion } from '@/lib/maths-utils';
import { motion } from 'framer-motion';
import { Check, X, Repeat, } from 'lucide-react';
import Link from 'next/link';

interface MathsResultsPageProps {
    questions: MathsQuestion[];
    score: number;
    onRestart: () => void;
    settings: {
        mode: string;
        types: string[];
        difficulty: string;
    };
    timeTaken: number;
}

const MathsResultsPage: React.FC<MathsResultsPageProps> = ({ questions, score, onRestart, settings, timeTaken }) => {
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter(q => q.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    const getModeTitle = (mode: string) => {
        switch(mode) {
            case '1-minute': return '1-Minute Challenge Results';
            case 'bitter-end': return 'To the Bitter End Results';
            case 'speed-challenge': return 'Speed Challenge Results';
            default: return 'Results';
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-24 px-4">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{getModeTitle(settings.mode)}</h1>
                    <p className="text-gray-500 capitalize">{settings.difficulty} &middot; {settings.types.join(', ')}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Final Score</p>
                            <p className="text-5xl font-bold text-indigo-600">{score}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Accuracy</p>
                            <p className={`text-5xl font-bold ${accuracy >= 75 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {accuracy.toFixed(0)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Questions</p>
                            <p className="text-5xl font-bold text-gray-800">
                                {totalQuestions}
                            </p>
                        </div>
                         <div>
                            <p className="text-sm font-medium text-gray-500">Time Taken</p>
                            <p className="text-5xl font-bold text-gray-800">
                                {formatTime(timeTaken)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center space-x-4">
                        <button onClick={onRestart} className="flex items-center space-x-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition">
                            <Repeat size={20} />
                            <span>Play Again</span>
                        </button>
                         <Link href="/maths" className="flex items-center space-x-2 bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition">
                            <span>New Challenge</span>
                        </Link>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4 px-2">Review Your Answers</h2>
                    <div className="space-y-3">
                        {questions.map((q, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`p-4 rounded-lg flex items-center justify-between ${q.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
                            >
                                <div className="flex items-center">
                                    <div className={`mr-4 ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {q.isCorrect ? <Check /> : <X />}
                                    </div>
                                    <div>
                                        <p className="font-mono text-lg text-gray-800">{q.question} = {q.answer}</p>
                                        {!q.isCorrect && (
                                            <p className="text-sm text-red-700 font-semibold">Your answer: {q.userAnswer ?? 'Not answered'}</p>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-gray-500">Q{index + 1}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MathsResultsPage;

