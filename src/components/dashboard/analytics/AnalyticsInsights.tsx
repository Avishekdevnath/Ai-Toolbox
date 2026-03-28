"use client";

import { Zap } from "lucide-react";

const insights = [
  { title: 'Peak Usage Time', body: 'Your most active hours are between 2–4 PM, with 92 interactions during that time.', bg: 'bg-blue-50', titleColor: 'text-blue-800', bodyColor: 'text-blue-700' },
  { title: 'Growth Trend', body: 'Tool usage has increased by 12% this month compared to last month.', bg: 'bg-green-50', titleColor: 'text-green-800', bodyColor: 'text-green-700' },
  { title: 'Favorite Category', body: 'Business tools are your most used category, accounting for 36% of all usage.', bg: 'bg-violet-50', titleColor: 'text-violet-800', bodyColor: 'text-violet-700' },
  { title: 'Consistency', body: 'You use tools an average of 4 times per day, showing consistent engagement.', bg: 'bg-orange-50', titleColor: 'text-orange-800', bodyColor: 'text-orange-700' },
];

export default function AnalyticsInsights() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={15} className="text-[var(--color-text-muted)]" />
        <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Key Insights</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map(({ title, body, bg, titleColor, bodyColor }) => (
          <div key={title} className={`${bg} rounded-xl p-4`}>
            <h4 className={`text-[13px] font-semibold ${titleColor} mb-1`}>{title}</h4>
            <p className={`text-[12px] ${bodyColor}`}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
