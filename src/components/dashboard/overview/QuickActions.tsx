import Link from 'next/link';
import { BarChart3, TrendingUp, Target, QrCode, Link2, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  { label: 'SWOT Analysis', href: '/tools/swot-analysis', icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
  { label: 'Finance Advisor', href: '/tools/finance-advisor', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Diet Planner', href: '/tools/diet-planner', icon: Target, color: 'text-orange-600 bg-orange-50' },
  { label: 'QR Generator', href: '/dashboard/qr-generator', icon: QrCode, color: 'text-purple-600 bg-purple-50' },
  { label: 'Short URL', href: '/dashboard/urls', icon: Link2, color: 'text-pink-600 bg-pink-50' },
  { label: 'Code Share', href: '/dashboard/snippets', icon: Code2, color: 'text-[var(--color-text-secondary)] bg-[var(--color-muted)]' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(({ label, href, icon: Icon, color }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border)] hover:shadow-sm transition-all group"
        >
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[13px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] truncate">{label}</span>
        </Link>
      ))}
    </div>
  );
}
