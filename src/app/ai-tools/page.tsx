'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';
import AiToolsHero from '@/components/ai-tools/AiToolsHero';
import AiToolsGrid from '@/components/ai-tools/AiToolsGrid';
import AiToolsCta from '@/components/ai-tools/AiToolsCta';
import { ToolCardSkeleton, HeroSkeleton } from '@/components/ui/skeleton';

export default function AIToolsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for tools
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1">
        {isLoading ? <HeroSkeleton /> : <AiToolsHero />}
        {isLoading ? (
          <section className="py-4 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ToolCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <AiToolsGrid />
        )}
        {!isLoading && <AiToolsCta />}
      </main>
      <NewFooter />
    </div>
  );
} 