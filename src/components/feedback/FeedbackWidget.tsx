'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import FeedbackForm from './FeedbackForm';

const DISMISSED_KEY = 'feedback_widget_dismissed';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === '1');
  }, []);

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
    setOpen(false);
    // Notify HeaderActions to show the inline button
    window.dispatchEvent(new Event('feedback-widget-dismissed'));
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popover panel */}
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">Share Feedback</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close feedback panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 py-3">
            <FeedbackForm onClose={() => setOpen(false)} currentPath={pathname} />
          </div>
        </div>
      )}

      {/* Trigger button + dismiss X (X only visible on hover) */}
      <div className="group flex items-center gap-1">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg transition-colors"
          aria-label="Open feedback"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Feedback
        </button>

        {/* Close / dismiss button — hidden until hover */}
        <button
          onClick={dismiss}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-900 text-white shadow-lg transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
          aria-label="Dismiss feedback button"
          title="Move to navigation bar"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
