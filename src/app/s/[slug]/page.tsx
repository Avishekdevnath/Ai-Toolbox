'use client';

import CodeBlock from '@/components/snippets/CodeBlock';
import SnippetHeader from '@/components/snippets/SnippetHeader';
import { notFound } from 'next/navigation';
import React, { useEffect, useState, use } from 'react';
import dynamic from 'next/dynamic';

// Client-side only components to prevent hydration issues
const SnippetActions = dynamic(() => import('@/components/snippets/SnippetActions'), {
  ssr: false,
  loading: () => <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
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
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading snippet...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return notFound();
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-10">
        <SnippetHeader />
      </div>

      {/* Sticky Snippet Header */}
      <div className="sticky top-12 z-10 border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">&lt;/&gt;</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">
                  {data.title || 'Untitled Snippet'}
                </h1>
                <p className="text-gray-400 text-xs">
                  {data.language.toUpperCase()} • {data.ownerId ? 'User' : 'Anonymous'} • {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{data.viewCount} views</span>
              </div>
              <SnippetActions slug={data.slug} code={data.content} />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Code Display */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div id="code-display" className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
            {/* Language Header */}
            <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-400 font-mono language-label">
                {data.language.toUpperCase()}
              </div>
            </div>
            
            {/* Code Content */}
            <div className="p-0">
              <CodeBlock 
                code={data.content} 
                language={data.language}
                className="text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
