'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import QuoteCard from './QuoteCard';
import type { Quote } from '@/schemas/quoteSchema';

const PAGE_SIZE = 5;

// Skeleton card for loading state
function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="h-4 bg-slate-100 rounded-md w-4/5" style={{ animationDelay: `${index * 80 + 20}ms` }} />
      <div className="h-4 bg-slate-100 rounded-md w-full" style={{ animationDelay: `${index * 80 + 40}ms` }} />
      <div className="h-4 bg-slate-100 rounded-md w-3/5" style={{ animationDelay: `${index * 80 + 60}ms` }} />
      <div className="flex items-center gap-2 pt-2">
        <div className="h-px flex-1 bg-slate-100" />
        <div className="h-3 w-24 bg-slate-100 rounded-md" />
      </div>
    </div>
  );
}

interface Props {
  quotes: Quote[];
  famousPeople: string[];
  authorFallback: string;
  loading: boolean;
  skeletonCount: number;
  copiedIdx: number | null;
  page: number;
  onCopy: (quote: string, author: string, idx: number) => void;
  onPageChange: (p: number) => void;
}

export default function QuoteResults({
  quotes,
  famousPeople,
  authorFallback,
  loading,
  skeletonCount,
  copiedIdx,
  page,
  onCopy,
  onPageChange,
}: Props) {
  const totalPages   = Math.ceil(quotes.length / PAGE_SIZE);
  const paginated    = quotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const globalOffset = (page - 1) * PAGE_SIZE;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (quotes.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Famous people banner */}
      {famousPeople.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <Users size={13} className="text-amber-600" />
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Born this day</span>
          </div>
          {famousPeople.map((person, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 bg-white border border-amber-200 text-amber-800 text-[11px] font-medium rounded-full"
            >
              {person}
            </span>
          ))}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-slate-500">
          <span className="font-semibold text-slate-700">{quotes.length}</span> quotes generated
        </p>
        {totalPages > 1 && (
          <p className="text-[12px] text-slate-400">
            Page <span className="font-semibold text-slate-600">{page}</span> / {totalPages}
          </p>
        )}
      </div>

      {/* Quote cards */}
      <div className="space-y-3">
        {paginated.map((q, i) => {
          const globalIdx = globalOffset + i;
          return (
            <QuoteCard
              key={globalIdx}
              quote={q}
              authorFallback={authorFallback}
              index={globalIdx}
              copied={copiedIdx === globalIdx}
              onCopy={() => onCopy(q.quote, q.author || authorFallback || 'Unknown', globalIdx)}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft size={13} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`w-8 h-8 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer ${
                  i + 1 === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="h-8 px-3 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
