"use client";

import { BarChart3, TrendingUp, Clock, Activity } from "lucide-react";

interface AnalyticsData {
  totalUsage: number;
  monthlyUsage: number;
  weeklyUsage: number;
  dailyUsage: number;
}

interface Props { data: AnalyticsData; }

export default function AnalyticsStatCards({ data }: Props) {
  const cards = [
    { label: 'Total Usage', value: data.totalUsage, sub: 'All time interactions', icon: BarChart3, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Monthly Usage', value: data.monthlyUsage, sub: '+12% from last month', icon: TrendingUp, bg: 'bg-green-50', color: 'text-green-600' },
    { label: 'Weekly Usage', value: data.weeklyUsage, sub: '+8% from last week', icon: Clock, bg: 'bg-violet-50', color: 'text-violet-600' },
    { label: 'Daily Average', value: data.dailyUsage, sub: 'Average daily interactions', icon: Activity, bg: 'bg-orange-50', color: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, bg, color }) => (
        <div key={label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 relative">
          <div className={`absolute top-4 right-4 w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
            <Icon size={15} className={color} />
          </div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)] mt-1">{value}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{sub}</p>
        </div>
      ))}
    </div>
  );
}
