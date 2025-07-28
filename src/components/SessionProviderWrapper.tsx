'use client';

import { useAuth } from '@clerk/nextjs';

interface SessionProviderWrapperProps {
  children: React.ReactNode;
}

export function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  const { isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 