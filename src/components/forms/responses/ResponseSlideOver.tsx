"use client";
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ResponseField {
  label: string;
  answer: string | string[];
}

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  respondentName?: string;
  respondentEmail?: string;
  submittedAt: string;
  fields: ResponseField[];
  isQuiz?: boolean;
  quizScore?: number;
  quizMaxScore?: number;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
}

function SlideOverContent({
  onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore,
}: Omit<SlideOverProps, 'open'>) {
  const pct = isQuiz && quizMaxScore ? Math.round(((quizScore ?? 0) / quizMaxScore) * 100) : 0;

  return (
    <>
      <div className="flex items-start justify-between p-4 border-b border-slate-100 shrink-0">
        <div>
          <p className="font-semibold text-slate-800">{respondentName || 'Anonymous'}</p>
          {respondentEmail && <p className="text-[12px] text-slate-400">{respondentEmail}</p>}
          <p className="text-[12px] text-slate-400 mt-0.5">{formatDate(submittedAt)}</p>
          {isQuiz && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[13px] font-medium text-slate-700">{quizScore}/{quizMaxScore} · {pct}%</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${pct >= 50 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {pct >= 50 ? 'Pass' : 'Fail'}
              </span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {fields.map((f, i) => (
          <div key={i} className={`px-3 py-3 rounded-lg ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
            <p className="text-[13px] text-slate-700">
              {Array.isArray(f.answer) ? f.answer.join(', ') : f.answer || '—'}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ResponseSlideOver({
  open, onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore,
}: SlideOverProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const contentProps = { onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Desktop: slide from right */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[400px] bg-white shadow-xl flex-col hidden md:flex"
          >
            <SlideOverContent {...contentProps} />
          </motion.div>

          {/* Mobile: slide from bottom */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col md:hidden"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <SlideOverContent {...contentProps} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
