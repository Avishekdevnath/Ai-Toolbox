'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ToolUsage {
  _id?: string;
  toolSlug: string;
  toolName: string;
  action: string;
  success: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function UserToolHistory({ userId }: { userId: string }) {
  const [items, setItems] = useState<ToolUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toolFilter, setToolFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolFilter]);

  const fetchItems = async (reset = false) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (toolFilter.trim()) params.set('toolSlug', toolFilter.trim());
      params.set('limit', '20');
      params.set('offset', String(reset ? 0 : offset));

      const res = await fetch(`/api/tools/usage/user?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load usage');

      const newItems = (data.data || []).map((d: any) => ({
        _id: String(d._id || ''),
        toolSlug: d.toolSlug,
        toolName: d.toolName,
        action: d.action,
        success: !!d.success,
        createdAt: d.createdAt,
        metadata: d.metadata,
      }));

      setItems(reset ? newItems : [...items, ...newItems]);
      setHasMore(newItems.length === 20);
      setOffset(reset ? 20 : offset + 20);
    } catch (e: any) {
      setError(e.message || 'Failed to load usage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter by tool slug (e.g., swot-analysis)"
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
        />
        <Button variant="outline" onClick={() => fetchItems(true)} disabled={loading}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tool Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-500">No usage yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item._id}-${item.createdAt}`} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.toolSlug}</Badge>
                    <div>
                      <div className="text-sm font-medium">{item.toolName}</div>
                      <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()} • {item.action}</div>
                    </div>
                  </div>
                  <Badge className={item.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {item.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
              {hasMore && (
                <div className="flex justify-center">
                  <Button onClick={() => fetchItems(false)} disabled={loading}>Load more</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
