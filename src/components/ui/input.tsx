import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, required, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            {label}
            {required && <span className="text-[var(--color-destructive)] ml-0.5">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          required={required}
          className={cn(
            'flex h-11 w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm',
            'border-[var(--color-border)] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-secondary)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--color-destructive)] focus-visible:ring-[var(--color-destructive)]',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">{helperText}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-[var(--color-destructive)]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
