import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, GitCompare, Replace, Quote, FileQuestion } from 'lucide-react';
import AdSenseBlock from '../components/common/AdSenseBlock';

const EnglishPage = () => {
  return (
    <main className="container mx-auto px-6 pt-28 pb-12">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-sky-600 p-8 md:p-12">
        <div className="grid md:grid-cols-2 items-center gap-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white">English Practice Arena</h1>
            <p className="text-blue-100 mt-4 text-lg font-sans">Strengthen your vocabulary and grammar. Choose a category to begin.</p>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <img src="/media/english-card-illustration.svg" alt="English Mastery Illustration" className="h-56 w-auto" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mt-12">
        
        <Link to="/quiz-list.html?category=Synonyms" className="category-card p-8 bg-purple-50 transition hover:transform hover:-translate-y-2 hover:shadow-xl">
          <BookMarked className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Synonyms Practice</h2>
            <p className="text-gray-600 font-sans">Find words with similar meanings.</p>
          </div>
        </Link>

        <Link to="/quiz-list.html?category=Antonyms" className="category-card p-8 bg-amber-50 transition hover:transform hover:-translate-y-2 hover:shadow-xl">
          <GitCompare className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Antonyms Practice</h2>
            <p className="text-gray-600 font-sans">Find words with opposite meanings.</p>
          </div>
        </Link>

        <div className="category-card bg-gray-50 flex items-center justify-center p-4">
           <AdSenseBlock
              adSlot="8028804221"
              adFormat="fluid"
              adLayoutKey="-eb-4+3g-70+1q"
            />
        </div>

        <Link to="/quiz-list.html?category=One Word Substitution" className="category-card p-8 bg-rose-50 transition hover:transform hover:-translate-y-2 hover:shadow-xl">
          <Replace className="w-16 h-16 mx-auto mb-4 text-rose-500" />
          <div>
            <h2 className="text-2xl font-bold mb-2">One Word Substitution</h2>
            <p className="text-gray-600 font-sans">Replace a phrase with a single word.</p>
          </div>
        </Link>

        <Link to="/quiz-list.html?category=Idioms and Phrases" className="category-card p-8 bg-sky-50 transition hover:transform hover:-translate-y-2 hover:shadow-xl">
          <Quote className="w-16 h-16 mx-auto mb-4 text-sky-500" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Idioms & Phrases</h2>
            <p className="text-gray-600 font-sans">Understand the meaning of common idioms.</p>
          </div>
        </Link>

        <Link to="/quiz-list.html?category=SSC PYQs" className="category-card p-8 bg-green-50 transition hover:transform hover:-translate-y-2 hover:shadow-xl">
          <FileQuestion className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold mb-2">SSC PYQ's Practice</h2>
            <p className="text-gray-600 font-sans">Practice with previous year questions.</p>
          </div>
        </Link>

      </div>
    </main>
  );
};

export default EnglishPage;
