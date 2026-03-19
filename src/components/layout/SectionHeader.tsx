import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  highlight?: string;
  subtitle?: string;
  alignment?: 'left' | 'center';
  className?: string;
}

export default function SectionHeader({ title, highlight, subtitle, alignment = 'center', className }: SectionHeaderProps) {
  const titleParts = highlight ? title.split(highlight) : [title];

  return (
    <div className={cn(alignment === 'center' ? 'text-center' : 'text-left', 'mb-12', className)}>
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
        {highlight ? (
          <>
            {titleParts[0]}
            <span className="text-[var(--color-primary)]">{highlight}</span>
            {titleParts[1] || ''}
          </>
        ) : title}
      </h2>
      {subtitle && (
        <p className="text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
