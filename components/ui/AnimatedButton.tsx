import React from 'react';
import './AnimatedButton.css';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'dark' | 'light';
  'data-bg'?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  type = 'button',
  disabled = false,
  color = 'primary',
  'data-bg': dataBg
}) => {
  const colorClasses = {
    primary: 'btn-primary', // Will be the "Sign Up" style (Blue -> Red)
    secondary: 'btn-secondary', // Will be the "Sign In" style (Transparent -> Blue)
    dark: 'btn-dark',
    light: 'btn-light'
  };

  const style = dataBg ? { '--bg': dataBg } as React.CSSProperties : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`animated-btn ${colorClasses[color]} ${className}`}
      style={style}
    >
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default AnimatedButton;

