import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
  selectedValue?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
}

interface SelectValueProps {
  children?: React.ReactNode;
  className?: string;
  selectedValue?: string;
}

export function Select({ value, onValueChange, children, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const triggerRef = useRef<HTMLDivElement>(null);

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
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as any, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue
            });
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child as any, {
              onSelect: handleSelect
            });
          }
        }
        return null;
      })}
    </div>
  );
}

export function SelectTrigger({ children, className = '', isOpen, selectedValue, onClick, ...props }: SelectTriggerProps) {
  return (
    <div
      {...props}
      onClick={onClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectValue) {
          return React.cloneElement(child as any, { selectedValue });
        }
        return child;
      })}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  );
}

export function SelectContent({ children, className = '', onSelect, ...props }: SelectContentProps) {
  return (
    <div
      {...props}
      className={`absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg ${className}`}
    >
      <div className="py-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as any, {
              onSelect
            });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, className = '', onSelect, ...props }: SelectItemProps) {
  return (
    <div
      {...props}
      onClick={() => onSelect?.(value)}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectValue({ children, className = '', selectedValue }: SelectValueProps) {
  return (
    <span className={`${className}`}>
      {selectedValue || children || 'Select an option'}
    </span>
  );
} 