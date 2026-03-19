'use client';

import TipCalculatorTool from '@/components/tools/TipCalculatorTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function TipCalculatorPage() {
  return (
    <ToolPageLayout toolId="tip-calculator" toolName="Tip Calculator">
      <TipCalculatorTool />
    </ToolPageLayout>
  );
}
