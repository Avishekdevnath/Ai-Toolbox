'use client';

import UnitConverterTool from '@/components/tools/UnitConverterTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function UnitConverterPage() {
  return (
    <ToolPageLayout toolId="unit-converter" toolName="Unit Converter">
      <UnitConverterTool />
    </ToolPageLayout>
  );
}
