import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export function Select({ value, defaultValue, onValueChange, children, className = '', disabled = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const triggerRef = useRef<HTMLDivElement>(null);

  // Update selectedValue when value prop changes
  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    if (disabled) return;
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return (React.cloneElement as any)(child, {
              onClick: () => !disabled && setIsOpen(!isOpen),
              disabled
            });
          }
          if (child.type === SelectContent && isOpen) {
            return (React.cloneElement as any)(child, { onSelect: handleSelect });
          }
        }
        return null;
      })}
    </div>
  );
}

export function SelectTrigger({ children, className = '', onClick, id, disabled }: SelectTriggerProps & { onClick?: () => void; disabled?: boolean }) {
  return (
    <div
      id={id}
      onClick={onClick}
      aria-disabled={disabled}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  );
}

export function SelectContent({ children, className = '', ...props }: SelectContentProps & { onSelect?: (value: string) => void }) {
  return (
    <div
      className={`absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg ${className}`}
    >
      <div className="py-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return (React.cloneElement as any)(child, {
              onSelect: (props as any).onSelect
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, className = '', ...props }: SelectItemProps & { onSelect?: (value: string) => void }) {
  return (
    <div
      onClick={() => (props as any).onSelect?.(value)}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectValue({ children, className = '', placeholder }: SelectValueProps) {
  return (
    <span className={`${className}`}>
      {children ?? placeholder}
    </span>
  );
}
