import SectionContainer from '@/components/layout/SectionContainer';
import { Wrench, Users, Sparkles } from 'lucide-react';

const stats = [
  { icon: Wrench, label: '18+ Tools', description: 'AI & utility tools' },
  { icon: Users, label: 'Growing Community', description: 'Active users' },
  { icon: Sparkles, label: 'Free to Use', description: 'No credit card required' },
];

export default function TrustBar() {
  return (
    <SectionContainer padding="tight" size="md">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <stat.icon className="w-5 h-5 text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{stat.label}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
