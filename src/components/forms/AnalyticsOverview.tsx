'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AnalyticsOverview({ formId }: { formId: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setError('');
      const res = await fetch(`/api/forms/${formId}/analytics`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed');
      setData(payload.data);
    } catch (e: any) { setError(e.message || 'Failed'); }
  };

  const fetchInsights = async () => {
    try {
      setError('');
      const res = await fetch(`/api/forms/${formId}/ai-insights`, { method: 'POST' });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(payload.error || 'Failed');
      setInsights(payload.data.summary || '');
    } catch (e: any) { setError(e.message || 'Failed'); }
  };

  useEffect(() => { fetchAnalytics(); }, [formId]);

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {!data ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="text-sm space-y-2">
              <div>Total responses: {data.total}</div>
              <div>By day (last 30d): {data.byDay?.length}</div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Generate AI summary over recent responses.</div>
            <Button variant="outline" size="sm" onClick={fetchInsights}>Generate</Button>
          </div>
          <div className="text-sm whitespace-pre-wrap">{insights || 'No insights yet.'}</div>
        </CardContent>
      </Card>
    </div>
  );
}


