'use client';

import { useState } from 'react';

interface FeedbackFormProps {
  onClose: () => void;
  currentPath?: string;
}

type FeedbackType = 'bug' | 'feature';

export default function FeedbackForm({ onClose, currentPath }: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          url: currentPath || window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-800">Thanks for your feedback!</p>
        <p className="text-xs text-slate-500 mt-1">We'll review it soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Type toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-medium">
        <button
          type="button"
          onClick={() => setType('bug')}
          className={`flex-1 py-1.5 transition-colors ${
            type === 'bug'
              ? 'bg-red-50 text-red-600'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Bug Report
        </button>
        <button
          type="button"
          onClick={() => setType('feature')}
          className={`flex-1 py-1.5 transition-colors ${
            type === 'feature'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          Feature Request
        </button>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder={type === 'bug' ? 'What went wrong?' : 'What would you like?'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
        />
      </div>

      {/* Description */}
      <div>
        <textarea
          placeholder="Tell us more..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          required
          rows={3}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !description.trim()}
          className="text-sm px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}
