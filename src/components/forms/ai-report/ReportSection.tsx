'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';

interface FieldInsight {
  fieldId: string;
  label: string;
  insight: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
}

interface AIReportData {
  executiveSummary: string;
  fieldInsights: FieldInsight[];
  recommendations: string[];
  generatedAt: string;
}

interface ReportSectionProps {
  formId: string;
  initialReport?: AIReportData;
  onReportGenerated?: (report: AIReportData) => void;
}

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'bg-green-50 text-green-700 border-green-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  negative: 'bg-red-50 text-red-700 border-red-200',
};

export default function ReportSection({ formId, initialReport, onReportGenerated }: ReportSectionProps) {
  const [report, setReport] = useState<AIReportData | undefined>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/forms/${formId}/ai-report/generate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to generate report');
      setReport(json.report);
      onReportGenerated?.(json.report);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <Sparkles size={24} className="text-blue-400 mx-auto mb-3" />
        <p className="text-[14px] font-semibold text-slate-700 mb-1">AI Report</p>
        <p className="text-[13px] text-slate-400 mb-4 max-w-sm mx-auto">
          Generate an in-depth analysis of your form responses — executive summary, per-question insights, and actionable recommendations.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles size={13} />
          {loading ? 'Generating Report…' : 'Generate AI Report'}
        </button>
        {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500" />
          <p className="text-[13px] font-semibold text-slate-700">AI Report</p>
          {report.generatedAt && (
            <span className="text-[11px] text-slate-300">
              Generated {new Date(report.generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Regenerating…' : 'Regenerate'}
        </button>
      </div>

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      {/* Executive Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Executive Summary</p>
        <p className="text-[13px] text-slate-700 leading-relaxed">{report.executiveSummary}</p>
      </div>

      {/* Field Insights */}
      {report.fieldInsights.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Field Insights</p>
          <div className="space-y-4">
            {report.fieldInsights.map((fi, i) => (
              <div key={fi.fieldId || i} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-slate-600 mb-0.5">{fi.label}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{fi.insight}</p>
                </div>
                {fi.sentiment && SENTIMENT_STYLES[fi.sentiment] && (
                  <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full border font-medium ${SENTIMENT_STYLES[fi.sentiment]}`}>
                    {fi.sentiment}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={13} className="text-blue-500" />
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">Recommendations</p>
          </div>
          <ol className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-blue-800">
                <span className="shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
