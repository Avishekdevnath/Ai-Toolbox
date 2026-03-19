'use client';

import FinanceAdvisorTool from '@/components/tools/finance';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function FinanceAdvisorPage() {
  return (
    <ToolPageLayout toolId="finance-advisor" toolName="Finance Advisor" maxWidth="2xl">
      <FinanceAdvisorTool />
    </ToolPageLayout>
  );
}
