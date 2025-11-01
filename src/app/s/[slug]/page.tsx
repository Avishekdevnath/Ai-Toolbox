'use client';

import CodeBlock from '@/components/snippets/CodeBlock';
import SnippetHeader from '@/components/snippets/SnippetHeader';
import { notFound } from 'next/navigation';
import React, { useEffect, useState, use } from 'react';
import dynamic from 'next/dynamic';

// Client-side only components to prevent hydration issues
const SnippetActions = dynamic(() => import('@/components/snippets/SnippetActions'), {
  ssr: false,
  loading: () => (
    <div className="flex gap-1 sm:gap-1.5">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-md animate-pulse"></div>
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-md animate-pulse"></div>
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-md animate-pulse"></div>
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-800 rounded-md animate-pulse"></div>
    </div>
  )
});

interface SnippetResponse {
  data: {
    title?: string;
    language: string;
    content: string;
    slug: string;
    isPublic: boolean;
    ownerId?: string;
    createdAt: string;
    viewCount: number;
  };
}

export default function PublicSnippetPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<SnippetResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/snippets/${resolvedParams.slug}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const result: SnippetResponse = await res.json();
        setData(result.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [resolvedParams.slug]);


  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base md:text-lg">Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-10">
        <SnippetHeader />
      </div>

      {/* Compact Header - Icon Only */}
      <div className="sticky top-12 z-10 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Title only */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h1 className="text-xs sm:text-sm font-medium text-white truncate">
                {data.title || 'Untitled'}
              </h1>
            </div>
            
            {/* Right: Compact icons & actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* View count - icon only on mobile */}
              <div className="flex items-center gap-1 text-gray-400">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-xs hidden sm:inline">{data.viewCount}</span>
              </div>
              
              <SnippetActions 
                slug={data.slug} 
                code={data.content}
                wordWrap={wordWrap}
                onWordWrapToggle={() => setWordWrap(!wordWrap)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Code Display - No decorations */}
      <div className="flex-1 overflow-auto bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div id="code-display" className="overflow-hidden">
            {/* Code Content - Clean & Minimal */}
            <div 
              className={wordWrap ? 'overflow-hidden' : 'overflow-x-auto'}
              style={{
                wordBreak: 'normal', // Don't break words aggressively
                overflowWrap: wordWrap ? 'anywhere' : 'normal', // Only break when absolutely necessary
                hyphens: wordWrap ? 'auto' : 'manual', // Add hyphens for better readability
                display: 'flex', // Use flexbox for better alignment
                alignItems: 'flex-start', // Align items to top
              }}
            >
              <CodeBlock 
                code={data.content} 
                language={data.language}
                className="text-xs sm:text-sm leading-relaxed"
                wordWrap={wordWrap}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
