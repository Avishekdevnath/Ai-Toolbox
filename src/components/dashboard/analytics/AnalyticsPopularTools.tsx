"use client";

import { ArrowUpRight, ArrowDownRight, Target } from "lucide-react";

interface Tool { name: string; count: number; growth: number; }
interface Props { tools: Tool[]; }

export default function AnalyticsPopularTools({ tools }: Props) {
  const max = Math.max(...tools.map(t => t.count), 1);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target size={15} className="text-[var(--color-text-muted)]" />
        <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Popular Tools</h3>
      </div>
      <div className="space-y-3">
        {tools.map((tool, i) => (
          <div key={tool.name} className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-semibold text-blue-600">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">{tool.name}</span>
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  {tool.growth > 0
                    ? <ArrowUpRight size={12} className="text-green-600" />
                    : <ArrowDownRight size={12} className="text-red-500" />}
                  <span className={`text-[11px] font-medium ${tool.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tool.growth > 0 ? '+' : ''}{tool.growth}%
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)] ml-2">{tool.count} uses</span>
                </div>
              </div>
              <div className="w-full bg-[var(--color-muted)] rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(tool.count / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
