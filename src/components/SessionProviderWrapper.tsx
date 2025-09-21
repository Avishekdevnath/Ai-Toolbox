'use client';

import React from 'react';
import { useAuth } from '@/components/AuthProvider';

interface SessionProviderWrapperProps {
  children: React.ReactNode;
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
} 