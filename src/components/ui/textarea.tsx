import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export function Textarea({ 
  className = '',
  rows = 4,
  ...props 
}: TextareaProps) {
  const baseClasses = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';
  
  const classes = `${baseClasses} ${className}`;
  
  return (
    <textarea
      className={classes}
      rows={rows}
      {...props}
    />
  );
} 