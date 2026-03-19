'use client';

import ResumeReviewerTool from '@/components/resume/ResumeReviewerTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function ResumeReviewerPage() {
  return (
    <ToolPageLayout toolId="resume-reviewer" toolName="Resume Reviewer" maxWidth="2xl">
      <ResumeReviewerTool />
    </ToolPageLayout>
  );
}
