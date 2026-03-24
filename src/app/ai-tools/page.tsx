import { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import SectionContainer from '@/components/layout/SectionContainer';
import SectionHeader from '@/components/layout/SectionHeader';
import { ActiveToolsGrid } from './ActiveToolsGrid';

export default function AIToolsPage() {
  return (
    <PageLayout>
      <SectionContainer size="lg" padding="normal">
        <SectionHeader
          title="AI-Powered Tools"
          highlight="AI-Powered"
          subtitle="Explore our suite of intelligent tools designed to boost productivity, streamline decisions, and deliver real insights."
        />
        <Suspense fallback={<div className="text-center py-10 text-sm text-gray-400">Loading tools…</div>}>
          <ActiveToolsGrid />
        </Suspense>
      </SectionContainer>
    </PageLayout>
  );
}
