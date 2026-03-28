'use client';

import { useState, useCallback } from 'react';
import type { Quote } from '@/schemas/quoteSchema';
import QuoteForm    from './quote-generator/QuoteForm';
import QuoteResults from './quote-generator/QuoteResults';

interface GenerateParams {
  topic: string;
  mood: string;
  author: string;
  birthDate: string;
  count: number;
  language: string;
}

export default function QuoteGeneratorTool() {
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [quotes,       setQuotes]       = useState<Quote[]>([]);
  const [famousPeople, setFamousPeople] = useState<string[]>([]);
  const [copiedIdx,    setCopiedIdx]    = useState<number | null>(null);
  const [page,         setPage]         = useState(1);
  const [lastAuthor,   setLastAuthor]   = useState('');
  const [skeletonCount, setSkeletonCount] = useState(5);

  const handleGenerate = useCallback(async (params: GenerateParams) => {
    setLoading(true);
    setError('');
    setQuotes([]);
    setFamousPeople([]);
    setCopiedIdx(null);
    setPage(1);
    setLastAuthor(params.author);
    setSkeletonCount(params.count);

    try {
      const res  = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      setQuotes(data.quotes       ?? []);
      setFamousPeople(data.famousPeople ?? []);
      fetch('/api/tools/quote-generator/track-usage', { method: 'POST' }).catch(() => {});
    } catch {
      setError('Failed to generate quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopy = useCallback((quote: string, author: string, idx: number) => {
    navigator.clipboard.writeText(`"${quote}" — ${author}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }, []);

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Quote Generator</h1>
        <p className="text-[12px] text-slate-400 mt-0.5">
          Generate beautiful, AI-powered quotes by topic, mood, author style, or language.
        </p>
      </div>

      {/* Form */}
      <QuoteForm loading={loading} onGenerate={handleGenerate} />

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <QuoteResults
        quotes={quotes}
        famousPeople={famousPeople}
        authorFallback={lastAuthor}
        loading={loading}
        skeletonCount={skeletonCount}
        copiedIdx={copiedIdx}
        page={page}
        onCopy={handleCopy}
        onPageChange={setPage}
      />
    </div>
  );
}
