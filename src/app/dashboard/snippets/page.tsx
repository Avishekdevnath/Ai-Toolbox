"use client";
import SnippetTable from '@/components/snippets/SnippetTable';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface SnippetItem {
  slug: string;
  title?: string;
  language: string;
  updatedAt: string;
  isPublic: boolean;
}

export default function SnippetsDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const [items, setItems] = useState<SnippetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      const res = await fetch(`/api/snippets?ownerId=${userId}`);
      if (res.ok) {
        const { data } = await res.json();
        setItems(data);
      }
      setLoading(false);
    };
    if (userId) fetchList();
  }, [userId]);

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete snippet?')) return;
    const res = await fetch(`/api/snippets/${slug}`, { method: 'DELETE' });
    if (res.ok) setItems(items.filter((s) => s.slug !== slug));
    else alert('Delete failed');
  };

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Snippets</h1>
        <Link href="/s/new"><Button>Create Snippet</Button></Link>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <SnippetTable items={items} onDelete={handleDelete} />
      )}
    </div>
  );
}
