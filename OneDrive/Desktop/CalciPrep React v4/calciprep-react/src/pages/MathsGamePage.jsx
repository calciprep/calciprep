import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MathsGameInterface from '../features/maths/MathsGameInterface';

const MathsGamePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Read game settings from the URL and prepare them as props
  const settings = {
    mode: searchParams.get('mode') || '1-minute',
    types: searchParams.get('types')?.split(',') || ['add'],
    difficulty: searchParams.get('difficulty') || 'easy'
  };

  return (
    <div className="container mx-auto px-6 py-28">
       <div className="mb-4 max-w-2xl mx-auto">
             <Link to="/maths.html" className="text-sm text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Back to Challenge Selection
             </Link>
        </div>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <MathsGameInterface settings={settings} />
      </div>
    </div>
  );
};

export default MathsGamePage;

