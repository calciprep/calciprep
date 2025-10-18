import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookMarked, GitCompare, Replace, Quote, FileQuestion, ArrowRight } from 'lucide-react';
import AdSenseBlock from '../components/common/AdSenseBlock';

const EnglishPage = () => {
  return (
    <main className="container mx-auto px-6 pt-28 pb-12">
      <Helmet>
        <title>English Practice for SSC - Vocabulary & Grammar | CalciPrep</title>
        <meta name="description" content="Enhance your English vocabulary and grammar for competitive exams. Practice with quizzes on synonyms, antonyms, idioms, and more, based on the Blackbook." />
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
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }
      `}</style>
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
        
        <Link to="/quiz-list.html?category=Synonyms" className="category-card bg-purple-100">
          <div className="p-8 text-center flex flex-col flex-grow">
            <div className="flex-shrink-0">
                <div className="bg-white/60 text-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <BookMarked size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Synonyms</h2>
                <p className="text-gray-600 font-sans text-sm">Find words with similar meanings.</p>
            </div>
            <div className="mt-4 flex-grow flex justify-center items-end">
                {/* Illustration can go here */}
            </div>
          </div>
          <div className="p-5 bg-white flex justify-between items-center mt-auto">
            <span className="font-semibold text-gray-800">Explore</span>
            <ArrowRight className="text-gray-400" />
          </div>
        </Link>

        <Link to="/quiz-list.html?category=Antonyms" className="category-card bg-amber-100">
          <div className="p-8 text-center flex flex-col flex-grow">
            <div className="flex-shrink-0">
                <div className="bg-white/60 text-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <GitCompare size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Antonyms</h2>
                <p className="text-gray-600 font-sans text-sm">Find words with opposite meanings.</p>
            </div>
          </div>
          <div className="p-5 bg-white flex justify-between items-center mt-auto">
            <span className="font-semibold text-gray-800">Explore</span>
            <ArrowRight className="text-gray-400" />
          </div>
        </Link>

        <Link to="/quiz-list.html?category=One Word Substitution" className="category-card bg-rose-100">
          <div className="p-8 text-center flex flex-col flex-grow">
              <div className="flex-shrink-0">
                  <div className="bg-white/60 text-rose-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                      <Replace size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">One Word Substitution</h2>
                  <p className="text-gray-600 font-sans text-sm">Replace a phrase with a single word.</p>
              </div>
          </div>
          <div className="p-5 bg-white flex justify-between items-center mt-auto">
            <span className="font-semibold text-gray-800">Explore</span>
            <ArrowRight className="text-gray-400" />
          </div>
        </Link>

        <Link to="/quiz-list.html?category=Idioms and Phrases" className="category-card bg-sky-100">
          <div className="p-8 text-center flex flex-col flex-grow">
              <div className="flex-shrink-0">
                  <div className="bg-white/60 text-sky-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                      <Quote size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">Idioms & Phrases</h2>
                  <p className="text-gray-600 font-sans text-sm">Understand common idioms.</p>
              </div>
          </div>
          <div className="p-5 bg-white flex justify-between items-center mt-auto">
            <span className="font-semibold text-gray-800">Explore</span>
            <ArrowRight className="text-gray-400" />
          </div>
        </Link>

        <Link to="/quiz-list.html?category=SSC PYQs" className="category-card bg-green-100">
          <div className="p-8 text-center flex flex-col flex-grow">
              <div className="flex-shrink-0">
                  <div className="bg-white/60 text-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                      <FileQuestion size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">SSC PYQs</h2>
                  <p className="text-gray-600 font-sans text-sm">Practice previous year questions.</p>
              </div>
          </div>
          <div className="p-5 bg-white flex justify-between items-center mt-auto">
            <span className="font-semibold text-gray-800">Explore</span>
            <ArrowRight className="text-gray-400" />
          </div>
        </Link>

        <div className="category-card bg-gray-50 flex items-center justify-center p-4 rounded-3xl">
           <AdSenseBlock
              adSlot="8028804221"
              adFormat="fluid"
              adLayoutKey="-eb-4+3g-70+1q"
            />
        </div>

      </div>
    </main>
  );
};

export default EnglishPage;

