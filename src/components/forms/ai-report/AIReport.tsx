'use client';

import { useState } from 'react';
import ReportSection from './ReportSection';
import ChatSection from './ChatSection';

interface AIReportData {
  executiveSummary: string;
  fieldInsights: any[];
  recommendations: string[];
  generatedAt: string;
}

interface AIReportProps {
  formId: string;
  cachedReport?: AIReportData;
}

export default function AIReport({ formId, cachedReport }: AIReportProps) {
  const [report, setReport] = useState<AIReportData | undefined>(cachedReport);

  return (
    <div className="space-y-6">
      <ReportSection
        formId={formId}
        initialReport={report}
        onReportGenerated={setReport}
      />
      <ChatSection
        formId={formId}
        cachedReport={report ? { executiveSummary: report.executiveSummary, recommendations: report.recommendations } : undefined}
      />
    </div>
  );
}
