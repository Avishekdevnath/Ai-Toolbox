'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface SettingsLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function SettingsLayout({ children, className = '' }: SettingsLayoutProps) {
  return (
    <div className={`min-h-screen bg-[var(--color-background)] ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Settings
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Manage your account preferences and application settings
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation - Will be implemented next */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Navigation placeholder - will be replaced with SettingsNavigation */}
                <Card className="p-4">
                  <div className="text-center text-[var(--color-text-muted)]">
                    Navigation coming soon...
                  </div>
                </Card>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 