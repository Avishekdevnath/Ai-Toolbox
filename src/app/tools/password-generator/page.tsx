'use client';

import PasswordGeneratorTool from '@/components/tools/PasswordGeneratorTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function PasswordGeneratorPage() {
  return (
    <ToolPageLayout toolId="password-generator" toolName="Password Generator">
      <PasswordGeneratorTool />
    </ToolPageLayout>
  );
}
