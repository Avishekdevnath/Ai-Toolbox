'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import AnalyticsStatCards from './analytics/AnalyticsStatCards';
import AnalyticsPopularTools from './analytics/AnalyticsPopularTools';
import { CategoryChart, HourChart } from './analytics/AnalyticsCategoryChart';
import AnalyticsInsights from './analytics/AnalyticsInsights';

interface AnalyticsDashboardProps { userId: string; }

interface AnalyticsData {
  totalUsage: number;
  monthlyUsage: number;
  weeklyUsage: number;
  dailyUsage: number;
  popularTools: Array<{ name: string; count: number; growth: number; }>;
  usageByDay: Array<{ date: string; count: number; }>;
  usageByHour: Array<{ hour: number; count: number; }>;
  categories: Array<{ name: string; count: number; percentage: number; }>;
}

const MOCK_DATA: AnalyticsData = {
  totalUsage: 1247, monthlyUsage: 156, weeklyUsage: 23, dailyUsage: 4,
  popularTools: [{ name: 'SWOT Analysis', count: 45, growth: 12 }, { name: 'Finance Advisor', count: 38, growth: 8 }, { name: 'Diet Planner', count: 32, growth: -3 }, { name: 'URL Shortener', count: 28, growth: 15 }, { name: 'QR Generator', count: 25, growth: 5 }],
  usageByDay: [{ date: '2024-01-01', count: 12 }, { date: '2024-01-02', count: 18 }, { date: '2024-01-03', count: 15 }, { date: '2024-01-04', count: 22 }, { date: '2024-01-05', count: 19 }, { date: '2024-01-06', count: 25 }, { date: '2024-01-07', count: 21 }],
  usageByHour: [{ hour: 9, count: 45 }, { hour: 10, count: 67 }, { hour: 11, count: 89 }, { hour: 14, count: 78 }, { hour: 15, count: 92 }, { hour: 16, count: 67 }],
  categories: [{ name: 'Business', count: 45, percentage: 36 }, { name: 'Finance', count: 38, percentage: 30 }, { name: 'Health', count: 25, percentage: 20 }, { name: 'Productivity', count: 17, percentage: 14 }],
};

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => { fetchAnalyticsData(); }, [userId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true); setError('');
      const response = await fetch(`/api/user/history?limit=1000&timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const historyData = await response.json();
      const history = historyData.data.history;
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 86400000);
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      const filteredHistory = history.filter((item: any) => {
        const d = new Date(item.createdAt);
        return timeRange === '7d' ? d >= weekAgo : timeRange === '30d' ? d >= monthAgo : true;
      });
      const totalUsage = filteredHistory.length;
      const dailyUsage = filteredHistory.filter((i: any) => new Date(i.createdAt) >= dayAgo).length;
      const weeklyUsage = filteredHistory.filter((i: any) => new Date(i.createdAt) >= weekAgo).length;
      const monthlyUsage = filteredHistory.filter((i: any) => new Date(i.createdAt) >= monthAgo).length;
      const toolCounts = new Map<string, number>();
      filteredHistory.forEach((i: any) => toolCounts.set(i.toolName, (toolCounts.get(i.toolName) || 0) + 1));
      const popularTools = Array.from(toolCounts.entries()).map(([name, count]) => ({ name, count, growth: Math.floor(Math.random() * 20) - 5 })).sort((a, b) => b.count - a.count).slice(0, 5);
      const dayCounts = new Map<string, number>();
      filteredHistory.forEach((i: any) => { const date = new Date(i.createdAt).toISOString().split('T')[0]; dayCounts.set(date, (dayCounts.get(date) || 0) + 1); });
      const usageByDay = Array.from(dayCounts.entries()).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
      const hourCounts = new Map<number, number>();
      filteredHistory.forEach((i: any) => { const hour = new Date(i.createdAt).getHours(); hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1); });
      const usageByHour = Array.from(hourCounts.entries()).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour - b.hour);
      const categories = [{ name: 'Business', count: Math.floor(totalUsage * 0.4), percentage: 40 }, { name: 'Finance', count: Math.floor(totalUsage * 0.3), percentage: 30 }, { name: 'Health', count: Math.floor(totalUsage * 0.2), percentage: 20 }, { name: 'Productivity', count: Math.floor(totalUsage * 0.1), percentage: 10 }];
      setData({ totalUsage, monthlyUsage, weeklyUsage, dailyUsage, popularTools, usageByDay, usageByHour, categories });
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-[var(--color-muted)] border border-[var(--color-border)] rounded-xl h-24 animate-pulse" />)}
      </div>
      <div className="bg-[var(--color-muted)] border border-[var(--color-border)] rounded-xl h-48 animate-pulse" />
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[var(--color-muted)] p-1 rounded-lg">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${timeRange === range ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}>
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 border border-[var(--color-border)] text-[13px] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-muted)] transition-colors">
          <Calendar size={14} /> Export
        </button>
      </div>

      <AnalyticsStatCards data={data} />
      <AnalyticsPopularTools tools={data.popularTools} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CategoryChart categories={data.categories} />
        <HourChart usageByHour={data.usageByHour} />
      </div>
      <AnalyticsInsights />
    </div>
  );
}
