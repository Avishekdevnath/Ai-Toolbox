"use client";
import SnippetTable from '@/components/snippets/SnippetTable';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

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
      try {
        const res = await fetch(`/api/snippets?owner=me`, {
          headers: {
            'x-user-id': userId || '',
          },
        });
        if (res.ok) {
          const { data } = await res.json();
          // Ensure data is an array
          setItems(Array.isArray(data?.items) ? data.items : []);
        } else {
          console.error('Failed to fetch snippets:', res.statusText);
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching snippets:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
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
    <div className="px-3 sm:px-4 py-6 sm:py-8 max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-semibold">My Snippets</h1>
        <Link href="/s/new" target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="flex items-center gap-2">
            <Plus size={16} />
            <span className="hidden sm:inline">Create Snippet</span>
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <SnippetTable items={items} onDelete={handleDelete} />
      )}
    </div>
  );
}
