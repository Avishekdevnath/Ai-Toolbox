'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

interface VisitorData { total: number; anonymous: number; loggedIn: number; newThisWeek: number; newThisMonth: number }
interface ActiveData { dau: number; wau: number; mau: number }

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-[22px] font-bold text-[var(--color-text-primary)]">{value}</p>
      <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">{label}</p>
    </div>
  );
}

export default function AnalyticsOverview() {
  const [visitors, setVisitors] = useState<VisitorData | null>(null);
  const [active, setActive] = useState<ActiveData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics/visitors').then((r) => r.json()),
      fetch('/api/admin/analytics/active-users').then((r) => r.json()),
    ]).then(([v, a]) => {
      if (v.success) setVisitors(v.data);
      if (a.success) setActive(a.data);
    }).catch(() => {});
  }, []);

  const fmt = (n: number | undefined) => n != null ? n.toLocaleString() : '—';

  return (
    <div className="space-y-4">
      <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)]">Visitors</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard icon={Users} label="Total unique visitors" value={fmt(visitors?.total)} color="bg-blue-600" />
        <MetricCard icon={UserCheck} label="Logged-in visitors" value={fmt(visitors?.loggedIn)} color="bg-green-600" />
        <MetricCard icon={UserX} label="Anonymous visitors" value={fmt(visitors?.anonymous)} color="bg-slate-500" />
        <MetricCard icon={TrendingUp} label="New this month" value={fmt(visitors?.newThisMonth)} color="bg-purple-600" />
      </div>

      <h2 className="text-[14px] font-semibold text-[var(--color-text-secondary)] mt-6">Active Users</h2>
      <div className="grid grid-cols-3 gap-4">
        <MetricCard icon={Users} label="Daily active (DAU)" value={fmt(active?.dau)} color="bg-blue-600" />
        <MetricCard icon={Users} label="Weekly active (WAU)" value={fmt(active?.wau)} color="bg-indigo-600" />
        <MetricCard icon={Users} label="Monthly active (MAU)" value={fmt(active?.mau)} color="bg-violet-600" />
      </div>
    </div>
  );
}
