'use client';

import { useEffect, useState } from 'react';
import { Activity, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatsGrid } from './overview/StatsGrid';
import { ActivityFeed } from './overview/ActivityFeed';
import { QuickActions } from './overview/QuickActions';

interface DashboardOverviewProps {
  userId: string;
}

interface UserStats {
  totalToolsUsed: number;
  totalUrlsShortened: number;
  totalAnalyses: number;
  lastActivityAt?: string;
  toolsUsed: string[];
  loginCount: number;
  sessionCount: number;
  providers: string[];
}

interface RecentActivity {
  id: string;
  action: string;
  tool?: string;
  timestamp: string;
  details?: string;
}

function SectionCard({ title, icon: Icon, children, action }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-text-secondary)]">
          <Icon className="w-4 h-4 text-[var(--color-text-muted)]" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function DashboardOverview({ userId }: DashboardOverviewProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await window.fetch('/api/user/stats');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats(data.data?.userStats ?? null);
      setActivity(data.data?.recentActivity ?? []);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    const t = setTimeout(fetch, 1500);
    return () => clearTimeout(t);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" text="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-[13px] text-red-500">{error}</p>
        <Button size="sm" variant="outline" onClick={fetch}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)] leading-tight">Overview</h1>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Welcome back — here's what's happening.</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetch} className="h-8 gap-1.5 text-[12px]">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats row */}
      <StatsGrid stats={stats} />

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Recent Activity" icon={Activity}>
          <ActivityFeed items={activity} />
        </SectionCard>

        <SectionCard title="Quick Actions" icon={Zap}>
          <QuickActions />
        </SectionCard>
      </div>

      {/* Tools used tags */}
      {stats?.toolsUsed && stats.toolsUsed.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
          <p className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">Your Tools</p>
          <div className="flex flex-wrap gap-2">
            {stats.toolsUsed.map((tool) => (
              <span key={tool} className="px-2.5 py-1 text-[12px] font-medium bg-[var(--color-muted)] text-[var(--color-text-secondary)] rounded-full border border-[var(--color-border)]">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
