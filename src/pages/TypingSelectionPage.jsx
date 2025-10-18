import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { GraduationCap, FileCheck, Keyboard, ArrowRight } from 'lucide-react';

const TypingSelectionPage = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28">
       <Helmet>
        <title>Select Typing Mode - CalciPrep</title>
        <meta name="description" content="Choose your typing practice mode. Learn typing, take tests, or practice number typing to prepare for government exams." />
      </Helmet>
      <style>{`
        .category-card {
          border: 1px solid #F3F4F6;
          border-radius: 1.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .category-card:not(.disabled):hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
      `}</style>
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-8 md:p-12">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Typing Test Arena</h1>
            <p className="text-amber-100 mt-4 text-lg font-sans">Select a mode to start your typing practice.</p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <img src="/media/typing-card-illustration.svg" alt="Typing Arena Illustration" className="h-56 w-auto" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
        <Link to="/learn-typing.html" className="category-card bg-purple-100">
            <div className="p-8 text-center flex flex-col flex-grow">
                <div className="bg-white/60 text-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <GraduationCap size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Learn Typing</h2>
                <p className="text-gray-600 font-sans text-sm">Start with basics and build your skills.</p>
            </div>
            <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-800">Explore</span>
                <ArrowRight className="text-gray-400" />
            </div>
        </Link>
        
        <Link to="/typing.html" className="category-card bg-blue-100">
            <div className="p-8 text-center flex flex-col flex-grow">
                <div className="bg-white/60 text-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <FileCheck size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Take Tests</h2>
                <p className="text-gray-600 font-sans text-sm">Practice with exam-like tests.</p>
            </div>
            <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-800">Explore</span>
                <ArrowRight className="text-gray-400" />
            </div>
        </Link>

        <div className="category-card disabled bg-gray-100 opacity-60 cursor-not-allowed">
           <div className="p-8 text-center flex flex-col flex-grow">
                <div className="bg-white/60 text-gray-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Keyboard size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">SSC Interface</h2>
                <p className="text-gray-600 font-sans text-sm">Practice in an SSC-like interface.</p>
            </div>
            <div className="p-5 bg-white flex justify-between items-center mt-auto">
                <span className="font-semibold text-gray-500">Coming Soon</span>
            </div>
        </div>
      </div>
    </main>
  );
};

export default TypingSelectionPage;
