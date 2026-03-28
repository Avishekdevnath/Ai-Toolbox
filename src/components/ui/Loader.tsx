'use client';

/**
 * Loader – reusable loading primitives for the whole dashboard.
 *
 * Exports:
 *   TopProgressBar   – sweeping blue line fixed at the very top of the viewport
 *   SkeletonStatChips – 4-chip stat row skeleton (matches FormsStatChips layout)
 *   SkeletonTable    – table card with header + N shimmer rows
 *   SkeletonCards    – responsive card grid shimmer
 *   SkeletonList     – stacked list-item shimmer
 *   Spinner          – centred spinner with optional label
 */

import React from 'react';

// ─── Shared shimmer bar ────────────────────────────────────────────────────────
function Bone({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`bg-[var(--color-muted)] animate-pulse rounded-md ${className ?? ''}`}
      style={style}
    />
  );
}

// ─── Top progress bar ──────────────────────────────────────────────────────────
export function TopProgressBar({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] overflow-hidden pointer-events-none">
      <div
        className="h-full bg-blue-500 rounded-full"
        style={{ animation: 'loader-progress 1.6s cubic-bezier(0.4,0,0.2,1) infinite' }}
      />
      <style>{`
        @keyframes loader-progress {
          0%   { width: 0%;  margin-left: 0%;   opacity: 1;   }
          60%  { width: 70%; margin-left: 10%;  opacity: 1;   }
          90%  { width: 20%; margin-left: 80%;  opacity: 0.6; }
          100% { width: 0%;  margin-left: 100%; opacity: 0;   }
        }
      `}</style>
    </div>
  );
}

// ─── Stat chips skeleton ───────────────────────────────────────────────────────
export function SkeletonStatChips({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 flex-1"
        >
          <Bone className="w-8 h-8 rounded-lg shrink-0" style={{ animationDelay: `${i * 80}ms` }} />
          <div className="flex-1 space-y-1.5">
            <Bone className="h-5 w-10" style={{ animationDelay: `${i * 80 + 40}ms` }} />
            <Bone className="h-3 w-16" style={{ animationDelay: `${i * 80 + 80}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Table skeleton ────────────────────────────────────────────────────────────
// Row widths cycle to look like real varied content
const TITLE_WIDTHS = ['45%', '65%', '55%', '70%', '50%', '60%'];
const DESC_WIDTHS  = ['30%', '42%', '54%', '38%', '48%', '35%'];

export function SkeletonTable({
  rows = 6,
  showHeader = true,
}: {
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      {showHeader && (
        <div className="border-b border-[var(--color-border-subtle)] px-4 py-3 flex items-center gap-4">
          <Bone className="w-6 h-3.5" />
          <Bone className="h-3.5 w-28 flex-1 max-w-[120px]" />
          <Bone className="hidden sm:block w-16 h-3.5 ml-auto" />
          <Bone className="hidden sm:block w-16 h-3.5" />
          <Bone className="hidden md:block w-20 h-3.5" />
          <Bone className="w-8 h-3.5" />
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-4 border-b border-[var(--color-border-subtle)] last:border-0 flex items-center gap-4"
        >
          <Bone className="w-5 h-4 shrink-0" style={{ animationDelay: `${i * 60}ms` }} />
          <div className="flex-1 min-w-0 space-y-1.5">
            <Bone
              className="h-3.5"
              style={{ width: TITLE_WIDTHS[i % TITLE_WIDTHS.length], animationDelay: `${i * 60 + 20}ms` }}
            />
            <Bone
              className="h-3"
              style={{ width: DESC_WIDTHS[i % DESC_WIDTHS.length], animationDelay: `${i * 60 + 40}ms` }}
            />
          </div>
          <Bone className="hidden sm:block w-16 h-5 rounded-full shrink-0" style={{ animationDelay: `${i * 60 + 30}ms` }} />
          <Bone className="hidden sm:block w-16 h-5 rounded-full shrink-0" style={{ animationDelay: `${i * 60 + 50}ms` }} />
          <Bone className="hidden md:block w-20 h-3.5 shrink-0"            style={{ animationDelay: `${i * 60 + 60}ms` }} />
          <Bone className="w-7 h-7 shrink-0"                               style={{ animationDelay: `${i * 60 + 70}ms` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Card grid skeleton ────────────────────────────────────────────────────────
export function SkeletonCards({
  count = 6,
  cols = 3,
}: {
  count?: number;
  cols?: 2 | 3 | 4;
}) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid ${colClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center gap-3">
            <Bone className="w-9 h-9 rounded-lg shrink-0" style={{ animationDelay: `${i * 60}ms` }} />
            <Bone className="h-4 flex-1 max-w-[60%]"      style={{ animationDelay: `${i * 60 + 30}ms` }} />
          </div>
          <Bone className="h-7 w-1/2"  style={{ animationDelay: `${i * 60 + 50}ms` }} />
          <Bone className="h-3 w-full" style={{ animationDelay: `${i * 60 + 70}ms` }} />
          <Bone className="h-3 w-3/4" style={{ animationDelay: `${i * 60 + 90}ms` }} />
        </div>
      ))}
    </div>
  );
}

// ─── List skeleton ─────────────────────────────────────────────────────────────
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <Bone className="w-8 h-8 rounded-lg shrink-0" style={{ animationDelay: `${i * 60}ms` }} />
          <div className="flex-1 space-y-1.5">
            <Bone
              className="h-3.5"
              style={{ width: TITLE_WIDTHS[i % TITLE_WIDTHS.length], animationDelay: `${i * 60 + 20}ms` }}
            />
            <Bone
              className="h-3"
              style={{ width: DESC_WIDTHS[i % DESC_WIDTHS.length], animationDelay: `${i * 60 + 40}ms` }}
            />
          </div>
          <Bone className="w-16 h-5 rounded-full shrink-0" style={{ animationDelay: `${i * 60 + 50}ms` }} />
        </div>
      ))}
    </div>
  );
}

// ─── Inline / centred spinner ──────────────────────────────────────────────────
export function Spinner({
  size = 'md',
  label,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}) {
  const dim = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' }[size];
  const border = { sm: 'border-[2px]', md: 'border-[3px]', lg: 'border-[3px]' }[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className ?? ''}`}>
      <div
        className={`${dim} ${border} rounded-full border-[var(--color-border)] border-t-blue-500 animate-spin`}
      />
      {label && <p className="text-[13px] text-[var(--color-text-muted)]">{label}</p>}
    </div>
  );
}
