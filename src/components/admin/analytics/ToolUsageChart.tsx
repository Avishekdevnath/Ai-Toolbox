'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

interface ToolData { slug: string; name: string; count: number }
interface TrendEntry { date: string; slug: string; count: number }

export default function ToolUsageChart() {
  const [tools, setTools] = useState<ToolData[]>([]);
  const [trend, setTrend] = useState<Array<Record<string, string | number>>>([]);

  useEffect(() => {
    fetch('/api/admin/analytics/tools')
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) return;
        setTools(j.data.topTools);

        // Build daily trend: pivot from [{date, slug, count}] to [{date, tool1: n, tool2: n}]
        const top5Slugs: string[] = j.data.topTools.slice(0, 5).map((t: ToolData) => t.slug);
        const byDate: Record<string, Record<string, number | string>> = {};
        for (const entry of j.data.dailyTrend as TrendEntry[]) {
          if (!top5Slugs.includes(entry.slug)) continue;
          if (!byDate[entry.date]) byDate[entry.date] = { date: entry.date };
          byDate[entry.date][entry.slug] = entry.count;
        }
        setTrend(Object.values(byDate).sort((a, b) => (a.date > b.date ? 1 : -1)));
      })
      .catch(() => {});
  }, []);

  const COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626'];

  return (
    <div className="space-y-6">
      {/* Top tools bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Top Tools — Last 30 Days</h3>
        {tools.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-[12px] text-slate-400">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tools} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 30-day trend line per top-5 tool */}
      {trend.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Usage Trend — Top 5 Tools</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {tools.slice(0, 5).map((t, i) => (
                <Line key={t.slug} type="monotone" dataKey={t.slug} name={t.name} stroke={COLORS[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
