'use client';

import PageLayout from '@/components/layout/PageLayout';
import useToolTracking from '@/hooks/useToolTracking';

interface ToolPageLayoutProps {
  children: React.ReactNode;
  toolId: string;
  toolName: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidthMap = { md: 'max-w-3xl', lg: 'max-w-4xl', xl: 'max-w-5xl', '2xl': 'max-w-6xl' };

export default function ToolPageLayout({ children, toolId, toolName, maxWidth = 'lg' }: ToolPageLayoutProps) {
  useToolTracking(toolId, toolName, 'view');

  return (
    <PageLayout>
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className={`w-full ${maxWidthMap[maxWidth]} bg-[var(--color-surface)] rounded-xl shadow-sm border border-[var(--color-border)] p-6 md:p-10`}>
          {children}
        </div>
      </div>
    </PageLayout>
  );
}
