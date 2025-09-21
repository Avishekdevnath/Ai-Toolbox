"use client";
import ReportTable from '@/components/snippets/ReportTable';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
    const res = await fetch('/api/snippet-reports'); // placeholder route
    if (res.ok) {
      const { data } = await res.json();
      setReports(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const hideReport = async (id: string) => {
    await fetch(`/api/snippet-reports/${id}`, { method: 'PATCH' });
    setReports(reports.filter((r) => r.id !== id));
  };

  const deleteSnippet = async (slug: string) => {
    if (!confirm('Delete snippet permanently?')) return;
    await fetch(`/api/snippets/${slug}`, { method: 'DELETE' });
    setReports(reports.filter((r) => r.snippetSlug !== slug));
  };

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Snippet Reports</h1>
      {loading ? <div>Loading...</div> : <ReportTable reports={reports} onHide={hideReport} onDelete={deleteSnippet} />}
      <Button variant="outline" onClick={fetchReports}>Refresh</Button>
    </div>
  );
}
