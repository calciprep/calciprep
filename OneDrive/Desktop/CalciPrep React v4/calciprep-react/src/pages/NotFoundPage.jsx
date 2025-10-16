import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full pt-28 pb-12">
      <h1 className="text-6xl font-bold text-purple-600">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2 font-sans">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-sans">
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

