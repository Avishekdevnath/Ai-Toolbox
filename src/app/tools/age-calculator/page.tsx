'use client';

import AgeCalculatorTool from '@/components/tools/AgeCalculatorTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function AgeCalculatorPage() {
  return (
    <ToolPageLayout toolId="age-calculator" toolName="Age Calculator">
      <AgeCalculatorTool />
    </ToolPageLayout>
  );
}
