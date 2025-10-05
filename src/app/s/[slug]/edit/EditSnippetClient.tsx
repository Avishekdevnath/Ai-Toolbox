'use client';

import useToolTracking from '@/hooks/useToolTracking';
import SnippetEditor, { SnippetEditorProps } from '@/components/snippets/SnippetEditor';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

interface EditSnippetClientProps {
  slug: string;
  isNew: boolean;
}

interface SnippetData {
  slug: string;
  title?: string;
  language: string;
  content: string;
  isPublic: boolean;
  ownerId?: string;
}

export default function EditSnippetClient({ slug, isNew }: EditSnippetClientProps) {
  useToolTracking('code-share', 'Code Share', 'view');
  const [initialData, setInitialData] = useState<SnippetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const res = await fetch(`/api/snippets/${slug}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          setError(true);
          return;
        }

        const result = await res.json();
        if (result.success && result.data) {
          setInitialData({
            slug: result.data.slug,
            title: result.data.title || '',
            language: result.data.language || 'javascript',
            content: result.data.content || '',
            isPublic: result.data.isPublic ?? true,
            ownerId: result.data.ownerId ? String(result.data.ownerId) : undefined,
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching snippet for edit:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (!isNew) {
      fetchSnippet();
    } else {
      setLoading(false);
    }
  }, [slug, isNew]);

  if (loading) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Unable to load snippet</h2>
          <p className="text-gray-400 mb-4">There was an error loading the snippet for editing.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <SnippetEditor 
      initialData={initialData || undefined}
      isNew={isNew}
    />
  );
}


