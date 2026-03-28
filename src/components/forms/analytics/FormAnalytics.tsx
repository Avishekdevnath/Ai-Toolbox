'use client';

import { useEffect, useState } from 'react';
import FieldAnalyticsCard from './FieldAnalyticsCard';
import AISummaryCard from './AISummaryCard';

interface AnalyticsField {
  id: string;
  type: string;
  label: string;
  options: string[];
}

interface AnalyticsData {
  totalResponses: number;
  avgDurationMs: number;
  formType: string;
  fields: AnalyticsField[];
  byField: Record<string, any>;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

export default function FormAnalytics({
  formId,
  initialSummary,
  initialGeneratedAt,
}: {
  formId: string;
  initialSummary?: string;
  initialGeneratedAt?: string;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/forms/${formId}/analytics`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load analytics');
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [formId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-100 rounded w-full" />
              <div className="h-5 bg-slate-100 rounded w-4/5" />
              <div className="h-5 bg-slate-100 rounded w-3/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
        <p className="text-[13px] text-red-700">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="text-[13px] text-red-600 underline hover:no-underline ml-4"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.totalResponses === 0) {
    return (
      <div className="space-y-4">
        <AISummaryCard
          formId={formId}
          initialSummary={initialSummary}
          initialGeneratedAt={initialGeneratedAt}
        />
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-[14px] font-semibold text-slate-700 mb-1">No responses yet</p>
          <p className="text-[13px] text-slate-400">Share your form to start collecting responses.</p>
        </div>
      </div>
    );
  }

  const avgDuration = formatDuration(data.avgDurationMs);

  return (
    <div className="space-y-4">
      <AISummaryCard
        formId={formId}
        initialSummary={initialSummary}
        initialGeneratedAt={initialGeneratedAt}
      />

      {/* Summary header */}
      <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-xl px-5 py-4">
        <div className="text-center">
          <p className="text-[28px] font-bold text-slate-800">{data.totalResponses}</p>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide">Responses</p>
        </div>
        {avgDuration && (
          <div className="text-center">
            <p className="text-[28px] font-bold text-slate-800">{avgDuration}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Avg time</p>
          </div>
        )}
      </div>

      {/* Per-field cards in form field order */}
      {data.fields.map(field => {
        const fieldData = data.byField[field.id];
        if (!fieldData) return null;
        return (
          <FieldAnalyticsCard
            key={field.id}
            field={field}
            data={fieldData}
            totalResponses={data.totalResponses}
          />
        );
      })}
    </div>
  );
}
