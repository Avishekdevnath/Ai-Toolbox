'use client';

import SwotAnalysisTool from '@/components/tools/SwotAnalysisTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function SwotAnalysisPage() {
  return (
    <ToolPageLayout toolId="swot-analysis" toolName="SWOT Analysis">
      <SwotAnalysisTool />
    </ToolPageLayout>
  );
}
