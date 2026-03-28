"use client";
import { LucideIcon } from 'lucide-react';

interface StatChip {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

interface FormsStatChipsProps {
  stats: StatChip[];
}

export default function FormsStatChips({ stats }: FormsStatChipsProps) {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 flex-1"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)] leading-none">{stat.value}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
