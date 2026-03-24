import { Wrench, BarChart3, Clock, Star } from 'lucide-react';
import { StatCard } from './StatCard';

interface UserStats {
  totalToolsUsed: number;
  totalAnalyses: number;
  sessionCount: number;
  loginCount: number;
}

interface Props {
  stats: UserStats | null;
}

export function StatsGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Tools Used"
        value={stats?.totalToolsUsed ?? 0}
        subtext="Total tools accessed"
        icon={Wrench}
      />
      <StatCard
        label="Analyses"
        value={stats?.totalAnalyses ?? 0}
        subtext="Total analyses run"
        icon={BarChart3}
        href="/dashboard/swot-history"
        linkLabel="View SWOT History"
      />
      <StatCard
        label="Sessions"
        value={stats?.sessionCount ?? 0}
        subtext="Login sessions"
        icon={Clock}
      />
      <StatCard
        label="Logins"
        value={stats?.loginCount ?? 0}
        subtext="Total logins"
        icon={Star}
      />
    </div>
  );
}
