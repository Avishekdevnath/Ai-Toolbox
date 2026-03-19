import { cn } from '@/lib/utils';

const sizeMap = { sm: 'max-w-3xl', md: 'max-w-5xl', lg: 'max-w-7xl' };
const paddingMap = { tight: 'py-12', normal: 'py-16', loose: 'py-24' };

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  padding?: 'tight' | 'normal' | 'loose';
  as?: 'section' | 'div';
}

export default function SectionContainer({
  children, className, size = 'lg', padding = 'normal', as: Tag = 'section'
}: SectionContainerProps) {
  return (
    <Tag className={cn(sizeMap[size], paddingMap[padding], 'mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </Tag>
  );
}
