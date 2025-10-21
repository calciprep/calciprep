import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

const badgeVariants = {
  default: 'bg-gray-900 text-white border-transparent',
  secondary: 'bg-gray-200 text-gray-900 border-transparent',
  destructive: 'bg-red-500 text-white border-transparent',
  outline: 'text-gray-900 border-gray-200',
};

const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default' }) => {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Badge;
