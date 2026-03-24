"use client";

import { useEffect, useState } from 'react';
import { Flag, RefreshCw, Loader2 } from 'lucide-react';
import ReportTable from '@/components/snippets/ReportTable';

interface Report {
  id: string;
  snippetSlug: string;
  reason: string;
  reporterIp: string;
}

export default function SnippetModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const res = await fetch('/api/snippet-reports');
    if (res.ok) { const { data } = await res.json(); setReports(data); }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const hideReport = async (id: string) => {
    await fetch(`/api/snippet-reports/${id}`, { method: 'PATCH' });
    setReports(reports.filter(r => r.id !== id));
  };

  const deleteSnippet = async (slug: string) => {
    if (!confirm('Delete snippet permanently?')) return;
    await fetch(`/api/snippets/${slug}`, { method: 'DELETE' });
    setReports(reports.filter(r => r.snippetSlug !== slug));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Snippet Reports</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Review and moderate user-reported code snippets.</p>
        </div>
        <button onClick={fetchReports} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <Flag className="h-4 w-4 text-slate-400" />
          <h2 className="text-[13px] font-semibold text-slate-800">Reported Snippets</h2>
          {!loading && <span className="ml-auto text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{reports.length} reports</span>}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" /><p className="text-[13px] text-slate-400">Loading reports...</p></div>
          </div>
        ) : (
          <ReportTable reports={reports} onHide={hideReport} onDelete={deleteSnippet} />
        )}
      </div>
    </div>
  );
}
