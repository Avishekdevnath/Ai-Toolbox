'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

interface ThemeDropdownProps {
  className?: string;
}

export default function ThemeDropdown({ className }: ThemeDropdownProps) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (value: Theme) => {
    document.documentElement.classList.add('theme-transition');
    setTheme(value);
    setOpen(false);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  const ActiveIcon = !mounted ? Sun : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Toggle theme"
      >
        <ActiveIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg z-50 overflow-hidden">
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors ${
                theme === value
                  ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">{label}</span>
              {theme === value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
