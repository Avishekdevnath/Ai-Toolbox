'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface AISummaryCardProps {
  formId: string;
  initialSummary?: string;
  initialGeneratedAt?: string;
}

export default function AISummaryCard({ formId, initialSummary, initialGeneratedAt }: AISummaryCardProps) {
  const [summary, setSummary] = useState(initialSummary ?? '');
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/forms/${formId}/analytics/ai-summary`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to generate summary');
      setSummary(json.summary);
      setGeneratedAt(new Date().toISOString());
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500" />
          <p className="text-[13px] font-semibold text-slate-700">AI Summary</p>
        </div>
        {summary && (
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Generating…' : 'Regenerate'}
          </button>
        )}
      </div>

      {summary ? (
        <>
          <p className="text-[13px] text-slate-600 leading-relaxed">{summary}</p>
          {generatedAt && (
            <p className="text-[11px] text-slate-300 mt-2">
              Generated {new Date(generatedAt).toLocaleDateString()}
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-[13px] text-slate-400">
            Generate a natural language summary of your form&apos;s response patterns.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[12px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Sparkles size={11} />
            {loading ? 'Generating…' : 'Generate AI Summary'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[12px] text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
