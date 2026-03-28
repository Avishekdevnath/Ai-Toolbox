'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  id?: string;
}

export default function ToggleSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
  label,
  description,
  id
}: ToggleSwitchProps) {
  const handleToggle = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex-1">
        {label && (
          <label 
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-[var(--color-text-primary)] cursor-pointer',
              disabled && 'text-[var(--color-text-muted)] cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
        {description && (
          <p className={cn(
            'text-sm text-[var(--color-text-muted)] mt-1',
            disabled && 'text-[var(--color-text-muted)]'
          )}>
            {description}
          </p>
        )}
      </div>
      
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked 
            ? 'bg-blue-600 dark:bg-blue-500' 
            : 'bg-[var(--color-muted)]',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer'
        )}
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
            disabled && 'opacity-50'
          )}
        />
      </button>
    </div>
  );
} 