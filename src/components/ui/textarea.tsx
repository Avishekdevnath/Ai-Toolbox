import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, required, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
            {label}
            {required && <span className="text-[var(--color-destructive)] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          required={required}
          rows={rows}
          className={cn(
            'w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm',
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
Textarea.displayName = 'Textarea';

export { Textarea };
