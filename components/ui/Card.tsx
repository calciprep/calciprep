import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-zinc-950 border border-transparent dark:border-zinc-800 text-slate-900 dark:text-zinc-100 rounded-xl shadow-md p-6 transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
