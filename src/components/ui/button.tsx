import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variantStyles = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  default: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]', // alias for backward compat
  secondary: 'bg-[var(--color-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]',
  outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-muted)]',
  ghost: 'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-muted)]',
  destructive: 'bg-[var(--color-destructive)] text-white hover:opacity-90',
  link: 'bg-transparent text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 py-2 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, asChild = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const sharedProps = {
      className: cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      ),
      ...props,
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps}>
          {children}
        </Slot>
      );
    }

    return (
      <button ref={ref} disabled={disabled || loading} {...sharedProps}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
