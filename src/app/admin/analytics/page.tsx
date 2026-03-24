import { Suspense } from 'react';
import AnalyticsOverview from '@/components/admin/analytics/AnalyticsOverview';
import TrafficChart from '@/components/admin/analytics/TrafficChart';
import ToolUsageChart from '@/components/admin/analytics/ToolUsageChart';

function Skeleton() {
  return <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />;
}

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-[20px] font-bold text-slate-800">Analytics</h1>
        <p className="text-[13px] text-slate-500 mt-1">Real-time platform metrics from the last 30 days.</p>
      </div>
      <Suspense fallback={<Skeleton />}>
        <AnalyticsOverview />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton />}>
          <TrafficChart />
        </Suspense>
        <Suspense fallback={<Skeleton />}>
          <ToolUsageChart />
        </Suspense>
      </div>
    </div>
  );
}
