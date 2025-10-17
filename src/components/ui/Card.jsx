import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  const baseStyle = 'bg-white rounded-2xl shadow-md border border-gray-100 transition-all duration-300';
  
  // Add hover effects if it's clickable
  const clickableStyle = onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyle} ${clickableStyle} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
