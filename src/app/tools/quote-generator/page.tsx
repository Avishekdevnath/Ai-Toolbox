'use client';

import QuoteGeneratorTool from '@/components/tools/QuoteGeneratorTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function QuoteGeneratorPage() {
  return (
    <ToolPageLayout toolId="quote-generator" toolName="Quote Generator">
      <QuoteGeneratorTool />
    </ToolPageLayout>
  );
}
