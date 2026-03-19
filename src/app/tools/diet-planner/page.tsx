'use client';

import DietPlannerTool from '@/components/tools/DietPlannerTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function DietPlannerPage() {
  return (
    <ToolPageLayout toolId="diet-planner" toolName="Diet Planner">
      <DietPlannerTool />
    </ToolPageLayout>
  );
}
