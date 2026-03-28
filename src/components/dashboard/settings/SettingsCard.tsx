'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export default function SettingsCard({ 
  title, 
  description, 
  children, 
  className = '',
  icon,
  actions
}: SettingsCardProps) {
  return (
    <Card className={cn('border border-[var(--color-border)]', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-blue-600 dark:text-blue-400">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-[var(--color-text-secondary)] mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
} 