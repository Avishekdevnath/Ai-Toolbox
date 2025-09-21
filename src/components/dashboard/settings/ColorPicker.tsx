'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorOption {
  value: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ColorPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: ColorOption[];
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export default function ColorPicker({
  value,
  onValueChange,
  options,
  label,
  description,
  disabled = false,
  className = ''
}: ColorPickerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onValueChange(option.value)}
              className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                option.bgColor,
                option.borderColor,
                isSelected 
                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' 
                  : 'hover:scale-105',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={`Select ${option.label} theme`}
            >
              {isSelected && (
                <Check className="w-5 h-5 text-white drop-shadow-sm" />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Selected: {options.find(opt => opt.value === value)?.label || 'None'}
      </div>
    </div>
  );
}

// Predefined theme options
export const themeOptions: ColorOption[] = [
  {
    value: 'light',
    label: 'Light',
    color: '#ffffff',
    bgColor: 'bg-white',
    borderColor: 'border-gray-300'
  },
  {
    value: 'dark',
    label: 'Dark',
    color: '#1f2937',
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-600'
  },
  {
    value: 'auto',
    label: 'Auto',
    color: '#6366f1',
    bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
    borderColor: 'border-blue-400'
  }
]; 