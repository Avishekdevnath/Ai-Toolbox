'use client';

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showSeparator?: boolean;
}

export default function SettingsSection({
  title,
  description,
  children,
  className = '',
  showSeparator = true
}: SettingsSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
      
      {showSeparator && (
        <Separator className="my-6" />
      )}
    </div>
  );
} 