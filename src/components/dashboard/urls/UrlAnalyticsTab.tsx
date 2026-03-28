"use client";

import { Link2, MousePointerClick, CheckCircle, BarChart2 } from "lucide-react";

interface Analytics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  expiredUrls: number;
  averageClicks: number;
}

interface Props { analytics: Analytics | null; }

const STATS = (a: Analytics) => [
  { label: 'Total URLs', value: a.totalUrls, icon: Link2, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Total Clicks', value: a.totalClicks, icon: MousePointerClick, bg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'Active URLs', value: a.activeUrls, icon: CheckCircle, bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { label: 'Avg Clicks', value: a.averageClicks, icon: BarChart2, bg: 'bg-orange-50', iconColor: 'text-orange-500' },
];

export default function UrlAnalyticsTab({ analytics }: Props) {
  if (!analytics) return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-12 flex items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS(analytics).map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 relative">
            <div className={`absolute top-4 right-4 w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon size={15} className={iconColor} />
            </div>
            <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
            <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)] mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-4">URL Status Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-[13px] text-[var(--color-text-secondary)]">Active URLs</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-[var(--color-muted)] rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: analytics.totalUrls > 0 ? `${(analytics.activeUrls / analytics.totalUrls) * 100}%` : '0%' }} />
              </div>
              <span className="text-[13px] font-medium text-[var(--color-text-primary)] w-6 text-right">{analytics.activeUrls}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="text-[13px] text-[var(--color-text-secondary)]">Expired URLs</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-[var(--color-muted)] rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: analytics.totalUrls > 0 ? `${(analytics.expiredUrls / analytics.totalUrls) * 100}%` : '0%' }} />
              </div>
              <span className="text-[13px] font-medium text-[var(--color-text-primary)] w-6 text-right">{analytics.expiredUrls}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
