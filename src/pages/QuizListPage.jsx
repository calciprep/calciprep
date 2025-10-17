import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { getQuizData } from '../services/dataService';
import { CheckCircle2 } from 'lucide-react';
import AdSenseBlock from '../components/common/AdSenseBlock';

const QuizListPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [category, setCategory] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || 'English Quizzes';
    setCategory(cat);

    const fetchQuizzes = async () => {
      const data = await getQuizData(cat);
      if (data) {
        setQuizzes(data);
      }
    };

    fetchQuizzes();
  }, [location.search]);

  const renderQuizCards = () => {
    const cards = [];
    const totalQuizzes = quizzes.length > 0 ? quizzes.length : 50; // Default to 50 if data is loading

    for (let i = 1; i <= totalQuizzes; i++) {
      // Ad placement logic from original site
      if ((i - 1) > 0 && (i - 1) % 18 === 0) {
        cards.push(
          <div key={`ad-${i}`} className="col-span-2 md:col-span-4 lg:col-span-6 rounded-xl shadow-lg">
            <AdSenseBlock
              adSlot="8726808223"
              adFormat="fluid"
              adLayoutKey="-ft+b+v-54+5s"
            />
          </div>
        );
      }

      const quizKey = `${category}-Quiz-${i}`;
      const isCompleted = localStorage.getItem(quizKey);

      cards.push(
        <Link
          key={i}
          to={`/quiz.html?category=${encodeURIComponent(category)}&quiz=${i}`}
          className={`quiz-card p-4 shadow-lg text-center flex flex-col justify-center aspect-square transition hover:transform hover:-translate-y-1 hover:shadow-xl hover:border-purple-500 ${isCompleted ? 'completed bg-green-50 border-green-500' : 'bg-white'}`}
        >
          <div className="flex-grow flex flex-col justify-center">
            <h2 className="text-xl font-bold mb-2">Quiz {i}</h2>
            <p className="text-gray-500 text-sm font-sans">30 Questions</p>
          </div>
          {isCompleted && (
            <div className="mt-2 flex items-center justify-center text-green-600 font-semibold text-xs font-sans">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span>Re-attempt</span>
            </div>
          )}
        </Link>
      );
    }
    return cards;
  };

  return (
    <div className="flex justify-center pt-28">
      <Helmet>
        <title>{`${category} Quizzes - SSC Vocabulary Practice | CalciPrep`}</title>
        <meta name="description" content={`Browse our list of English practice quizzes for ${category} to prepare for SSC and other competitive exams.`} />
      </Helmet>
      <aside className="hidden xl:block w-40 mx-4">
        <div className="sticky top-28">
          <AdSenseBlock adSlot="4929439151" className="min-h-[600px]" />
        </div>
      </aside>

      <main className="container mx-auto px-6 flex-grow max-w-7xl">
        <div className="text-center py-12 md:py-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{category}</h1>
          <p className="text-purple-100 mt-4 text-lg font-sans">Select a quiz to begin your practice.</p>
        </div>

        <div id="quiz-list-container" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto mt-12">
          {renderQuizCards()}
        </div>
      </main>

      <aside className="hidden xl:block w-40 mx-4">
        <div className="sticky top-28">
          <AdSenseBlock adSlot="4929439151" className="min-h-[600px]" />
        </div>
      </aside>
    </div>
  );
};

export default QuizListPage;
