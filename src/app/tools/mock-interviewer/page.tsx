'use client';

import MockInterviewerTool from '@/components/tools/interview/MockInterviewerTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function MockInterviewerPage() {
  return (
    <ToolPageLayout toolId="mock-interviewer" toolName="Mock Interviewer">
      <MockInterviewerTool />
    </ToolPageLayout>
  );
}
