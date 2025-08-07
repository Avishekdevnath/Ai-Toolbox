import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  className?: string;
  onClick?: () => void;
}

export function Badge({ children, variant = 'default', className = '', onClick }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 bg-white text-gray-700',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`;
  
  return (
    <span className={classes} onClick={onClick}>
      {children}
    </span>
  );
} 