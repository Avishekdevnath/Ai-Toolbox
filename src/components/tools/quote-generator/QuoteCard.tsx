'use client';

import React, { useRef } from 'react';
import { Copy, Check, Download, Quote as QuoteIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { Quote } from '@/schemas/quoteSchema';

// Gradient accent per index — cycles through a curated palette
const ACCENTS = [
  { border: 'border-blue-400',   icon: 'text-blue-200',  gradient: 'from-blue-50 to-white'   },
  { border: 'border-violet-400', icon: 'text-violet-200',gradient: 'from-violet-50 to-white'  },
  { border: 'border-emerald-400',icon: 'text-emerald-200',gradient: 'from-emerald-50 to-white'},
  { border: 'border-rose-400',   icon: 'text-rose-200',  gradient: 'from-rose-50 to-white'    },
  { border: 'border-amber-400',  icon: 'text-amber-200', gradient: 'from-amber-50 to-white'   },
];

interface Props {
  quote: Quote;
  authorFallback: string;
  index: number;
  copied: boolean;
  onCopy: () => void;
}

export default function QuoteCard({ quote, authorFallback, index, copied, onCopy }: Props) {
  const accent = ACCENTS[index % ACCENTS.length];
  const contentRef = useRef<HTMLDivElement>(null);
  const displayAuthor = quote.author || authorFallback || 'Unknown';

  const handleDownload = async () => {
    if (!contentRef.current) return;
    const dataUrl = await toPng(contentRef.current, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.download = `quote-${index + 1}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      className={`group relative bg-gradient-to-br ${accent.gradient} border border-slate-200 border-l-4 ${accent.border} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Downloadable area */}
      <div ref={contentRef} className={`bg-gradient-to-br ${accent.gradient} px-6 pt-6 pb-4`}>
        {/* Decorative quote mark */}
        <QuoteIcon
          size={48}
          className={`absolute top-3 right-4 ${accent.icon} rotate-180`}
          strokeWidth={1.5}
        />

        {/* Quote text */}
        <blockquote className="relative z-10 text-[15px] leading-relaxed text-slate-800 font-medium italic pr-10">
          &ldquo;{quote.quote}&rdquo;
        </blockquote>

        {/* Author */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[12px] font-semibold text-slate-600 shrink-0">
            {displayAuthor}
          </span>
        </div>
      </div>

      {/* Action bar — fades in on hover */}
      <div className="flex items-center justify-end gap-1.5 px-4 py-2.5 border-t border-slate-100 bg-white/60 backdrop-blur-sm">
        {/* Copy */}
        <button
          onClick={onCopy}
          title={copied ? 'Copied!' : 'Copy quote'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer ${
            copied
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          title="Download as image"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 cursor-pointer"
        >
          <Download size={12} />
          Save
        </button>
      </div>
    </div>
  );
}
