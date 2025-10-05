import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
      {children}
    </div>
  );
}

export function ToolCardSkeleton() {
  return (
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col h-80 border border-gray-200/50 dark:border-gray-700/50">
      {/* Icon skeleton */}
      <div className="text-5xl mb-4 flex justify-center">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
      
      {/* Title skeleton */}
      <div className="mb-3 text-center">
        <Skeleton className="h-6 w-3/4 mx-auto rounded" />
      </div>
      
      {/* Description skeleton */}
      <div className="mb-4 flex-grow">
        <Skeleton className="h-4 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      
      {/* Features skeleton */}
      <div className="flex flex-wrap gap-2 justify-center mt-auto">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          {/* Title skeleton */}
          <Skeleton className="h-16 w-96 mx-auto mb-6 rounded" />
          {/* Description skeleton */}
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-6 w-full mb-2 rounded" />
            <Skeleton className="h-6 w-4/5 mx-auto rounded" />
          </div>
        </div>
        
        {/* Search bar skeleton */}
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
