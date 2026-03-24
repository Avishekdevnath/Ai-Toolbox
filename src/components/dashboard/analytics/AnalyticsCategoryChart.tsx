"use client";

import { Users, Clock } from "lucide-react";

interface Category { name: string; count: number; percentage: number; }
interface HourData { hour: number; count: number; }

const COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-green-500', 'bg-orange-400'];

export function CategoryChart({ categories }: { categories: Category[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={15} className="text-slate-500" />
        <h3 className="text-[13px] font-semibold text-slate-800">Usage by Category</h3>
      </div>
      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div key={cat.name} className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLORS[i % COLORS.length]}`} />
            <span className="text-[13px] text-slate-700 w-24 truncate">{cat.name}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div className={`${COLORS[i % COLORS.length]} h-2 rounded-full`} style={{ width: `${cat.percentage}%` }} />
            </div>
            <span className="text-[12px] text-slate-500 w-8 text-right">{cat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HourChart({ usageByHour }: { usageByHour: HourData[] }) {
  const max = Math.max(...usageByHour.map(h => h.count), 1);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={15} className="text-slate-500" />
        <h3 className="text-[13px] font-semibold text-slate-800">Usage by Hour</h3>
      </div>
      <div className="space-y-2">
        {usageByHour.map((h) => (
          <div key={h.hour} className="flex items-center gap-3">
            <span className="text-[12px] text-slate-500 w-10">{h.hour}:00</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(h.count / max) * 100}%` }} />
            </div>
            <span className="text-[12px] text-slate-500 w-8 text-right">{h.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
