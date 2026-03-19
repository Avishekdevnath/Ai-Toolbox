'use client';

import JobInterviewerTool from '@/components/tools/interview/JobInterviewerTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function JobInterviewerPage() {
  return (
    <ToolPageLayout toolId="job-interviewer" toolName="Job Interviewer">
      <JobInterviewerTool />
    </ToolPageLayout>
  );
}
