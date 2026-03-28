import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  subtext?: string;
  icon: ComponentType<{ className?: string }>;
  trend?: 'up' | 'neutral';
  href?: string;
  linkLabel?: string;
}

export function StatCard({ label, value, subtext, icon: Icon, href, linkLabel }: Props) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--color-text-primary)] leading-none tabular-nums">{value}</p>
        {subtext && <p className="text-[12px] text-[var(--color-text-muted)] mt-1">{subtext}</p>}
      </div>
      {href && linkLabel && (
        <a href={href} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium mt-auto">
          {linkLabel} →
        </a>
      )}
    </div>
  );
}
