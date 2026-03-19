'use client';

import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { getToolIcon } from '@/lib/icon-map';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  name: string;
  description: string;
  icon: string;
  href: string;
  category: string;
  features: string[];
  rating: number;
  status?: string;
}

export default function ToolCard({ name, description, icon, href, category, features, rating, status }: ToolCardProps) {
  const Icon = getToolIcon(icon);
  const isComingSoon = status === 'Coming Soon';

  return (
    <Card variant="interactive" className={`p-6 flex flex-col ${isComingSoon ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-[var(--color-muted)]">
          <Icon className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{rating}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1.5">{name}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed flex-1">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <Badge variant="outline" size="sm">{category}</Badge>
        {isComingSoon && <Badge variant="secondary" size="sm">Coming Soon</Badge>}
      </div>

      <div className="text-xs text-[var(--color-text-secondary)] mb-4 space-y-1">
        {features.slice(0, 2).map((f, i) => (
          <div key={i}>- {f}</div>
        ))}
      </div>

      {isComingSoon ? (
        <span className="text-sm font-medium text-[var(--color-text-secondary)] cursor-default">Coming Soon</span>
      ) : (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline">
          Try Now
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </Card>
  );
}
