import { Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: string;
  tool?: string;
  timestamp: string;
}

interface Props {
  items: ActivityItem[];
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Activity className="w-5 h-5 text-slate-300" />
      </div>
      <p className="text-[13px] text-slate-400">No recent activity</p>
    </div>
  );
}

export function ActivityFeed({ items }: Props) {
  if (!items.length) return <EmptyState />;

  return (
    <ul className="divide-y divide-slate-100">
      {items.slice(0, 6).map((item, i) => (
        <li key={item.id || i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-700 truncate">{item.action}</p>
            {item.tool && (
              <p className="text-[11px] text-slate-400 truncate">{item.tool}</p>
            )}
          </div>
          <time className="text-[11px] text-slate-400 flex-shrink-0 tabular-nums">{item.timestamp}</time>
        </li>
      ))}
    </ul>
  );
}
