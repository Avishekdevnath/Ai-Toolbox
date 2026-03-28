"use client";

import SnippetTable from '@/components/snippets/SnippetTable';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Plus, Code2 } from 'lucide-react';
import { TopProgressBar, SkeletonTable } from '@/components/ui/Loader';

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
        const res = await fetch(`/api/snippets?owner=me`, { headers: { 'x-user-id': userId || '' } });
        if (res.ok) {
          const { data } = await res.json();
          setItems(Array.isArray(data?.items) ? data.items : []);
        } else {
          setItems([]);
        }
      } catch (error) {
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">My Snippets</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Manage and share your code snippets</p>
        </div>
        <Link href="/s/new" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={15} />
          <span className="hidden sm:inline">Create Snippet</span>
        </Link>
      </div>

      {loading ? (
        <>
          <TopProgressBar show={true} />
          <SkeletonTable rows={6} />
        </>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Code2 size={20} className="text-blue-600" />
          </div>
          <h3 className="text-[13px] font-semibold text-slate-800 mb-1">No snippets yet</h3>
          <p className="text-[12px] text-slate-400 mb-5">Create your first code snippet to get started</p>
          <Link href="/s/new" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Create Snippet
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <SnippetTable items={items} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
