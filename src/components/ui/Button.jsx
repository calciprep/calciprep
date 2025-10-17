import React from 'react';

const Button = ({ children, onClick, className = '', type = 'button' }) => {
  const baseStyle =
    'px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Example of differentiating styles. We can add more like 'secondary', 'danger' etc. later.
  const primaryStyle = 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${primaryStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
