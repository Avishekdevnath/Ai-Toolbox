import React, { useState } from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab: string;
  onTabChange: (value: string) => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child, {
              activeTab,
              onTabChange: setActiveTab
            });
          }
          if (child.type === TabsContent) {
            return React.cloneElement(child, {
              activeTab
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = '', activeTab, onTabChange, ...props }: TabsListProps & any) {
  return (
    <div
      {...props}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeTab: activeTab,
            onTabChange: onTabChange
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '', activeTab, onTabChange, ...props }: TabsTriggerProps & any) {
  const isActive = activeTab === value;
  
  return (
    <button
      {...props}
      onClick={() => onTabChange?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-gray-950 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '', activeTab, ...props }: TabsContentProps & any) {
  const isActive = activeTab === value;
  
  if (!isActive) return null;
  
  return (
    <div
      {...props}
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
} 