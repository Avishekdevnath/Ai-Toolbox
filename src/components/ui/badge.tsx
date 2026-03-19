import * as React from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-[var(--color-muted)] text-[var(--color-text-primary)]',
  primary: 'bg-[var(--color-primary)] text-white',
  secondary: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
  outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)]',
  destructive: 'bg-[var(--color-destructive)] text-white',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
