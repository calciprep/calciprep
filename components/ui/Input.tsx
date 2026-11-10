"use client";

import React from 'react';

// Extend standard input attributes for better type safety and autocompletion
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseStyle =
    'w-full p-3 border border-gray-300 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-colors';
  const disabledStyle = 'bg-gray-100 dark:bg-zinc-900 text-slate-500 dark:text-slate-500 cursor-not-allowed';

  return (
    <input
      disabled={disabled}
      className={`${baseStyle} ${disabled ? disabledStyle : ''} ${className}`}
      {...props}
    />
  );
};

export default Input;
