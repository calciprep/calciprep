import React from 'react';

const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  const baseStyle =
    'w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 transition-colors';
  const disabledStyle = 'bg-gray-100 cursor-not-allowed';

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseStyle} ${disabled ? disabledStyle : ''} ${className}`}
    />
  );
};

export default Input;
