import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, FileCheck, Keyboard } from 'lucide-react';

const TypingSelectionPage = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-28">
      <style>{`
        .mode-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-radius: 1.5rem;
            border: 1px solid #F3F4F6;
        }
        .mode-card:not(.disabled):hover {
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
        <Link to="/learn-typing.html" className="mode-card p-8 text-center bg-purple-50">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-purple-500" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-2">Learn Typing</h2>
          <p className="text-gray-600 font-sans">Start with basics and build your skills.</p>
        </Link>
        
        <Link to="/typing.html" className="mode-card p-8 text-center bg-blue-50">
          <FileCheck className="w-16 h-16 mx-auto mb-4 text-blue-500" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-2">Take Tests</h2>
          <p className="text-gray-600 font-sans">Practice with exam-like tests.</p>
        </Link>

        <div className="mode-card disabled p-8 text-center opacity-60 cursor-not-allowed bg-gray-100">
          <Keyboard className="w-16 h-16 mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-2">SSC Interface Typing</h2>
          <p className="text-gray-600 font-sans">Practice in an SSC-like interface. <br/> (Coming Soon)</p>
        </div>
      </div>
    </main>
  );
};

export default TypingSelectionPage;

