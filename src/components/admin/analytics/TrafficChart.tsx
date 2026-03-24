'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DayData { date: string; views: number }
interface PageData { path: string; views: number }

export default function TrafficChart() {
  const [daily, setDaily] = useState<DayData[]>([]);
  const [topPages, setTopPages] = useState<PageData[]>([]);

  useEffect(() => {
    fetch('/api/admin/analytics/traffic')
      .then((r) => r.json())
      .then((j) => { if (j.success) { setDaily(j.data.dailyViews); setTopPages(j.data.topPages); } })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Page Views — Last 30 Days</h3>
        {daily.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-[12px] text-slate-400">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip labelFormatter={(v) => `Date: ${v}`} />
              <Line type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-[13px] font-semibold text-slate-800 mb-4">Top Pages</h3>
        {topPages.length === 0 ? (
          <div className="text-[12px] text-slate-400">No data yet</div>
        ) : (
          <div className="space-y-2">
            {topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-[12px]">
                <span className="text-slate-700 truncate max-w-[70%]">{p.path}</span>
                <span className="font-medium text-slate-800 ml-2">{p.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
