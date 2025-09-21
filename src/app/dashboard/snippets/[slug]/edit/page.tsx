"use client";
import MonacoEditor from '@/components/snippets/MonacoEditor';
import LanguageSelect from '@/components/snippets/LanguageSelect';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { formatCode } from '@/lib/formatCodeClient';

interface Snippet {
  title?: string;
  language: string;
  content: string;
  slug: string;
  isPublic: boolean;
  ownerId?: string;
}

export default function SnippetEditorPage({ params }: { params: { slug: string } }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const router = useRouter();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = snippet?.ownerId === userId;

  useEffect(() => {
    const fetchSnippet = async () => {
      const res = await fetch(`/api/snippets/${params.slug}`);
      if (res.ok) {
        const { data } = await res.json();
        setSnippet(data);
      } else {
        alert('Snippet not found');
        router.push('/dashboard/snippets');
      }
      setLoading(false);
    };
    fetchSnippet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!snippet) return;
    setSaving(true);
    const res = await fetch(`/api/snippets/${snippet.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: snippet.title,
        language: snippet.language,
        content: snippet.content,
        isPublic: snippet.isPublic,
      }),
    });
    if (!res.ok) alert('Save failed');
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!snippet) return;
    if (!confirm('Delete snippet?')) return;
    setDeleting(true);
    const res = await fetch(`/api/snippets/${snippet.slug}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard/snippets');
    else alert('Delete failed');
    setDeleting(false);
  };

  if (loading || !snippet) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold flex justify-between items-center">
        Edit Snippet
        {isOwner && (
          <Button onClick={handleSave} disabled={saving}>Save</Button>
        )}
      </h1>

      <div className="flex flex-wrap gap-4 items-center">
        <LanguageSelect
          value={snippet.language}
          onChange={(lang) => isOwner && setSnippet({ ...snippet, language: lang })}
        />
        <input
          type="text"
          value={snippet.title || ''}
          onChange={(e) => isOwner && setSnippet({ ...snippet, title: e.target.value })}
          placeholder="Title"
          className="flex-1 border rounded px-3 py-2 text-sm"
          disabled={!isOwner}
        />
        {isOwner && (
          <label className="flex items-center gap-2 text-sm">
            Public
            <Switch
              checked={snippet.isPublic}
              onCheckedChange={(v) => setSnippet({ ...snippet, isPublic: v })}
            />
          </label>
        )}
      </div>

      <MonacoEditor
        language={snippet.language}
        value={snippet.content}
        onChange={(code) => isOwner && setSnippet({ ...snippet, content: code })}
        height={600}
      />

      <div className="flex gap-3">
        {isOwner && (
          <Button variant="outline" onClick={async () => {
            const formatted = await formatCode(snippet.language, snippet.content);
            setSnippet({ ...snippet, content: formatted });
          }}>Format Code</Button>
        )}
        {isOwner && (
          <Button variant="outline" onClick={handleDelete} disabled={deleting} className="text-red-600 border-red-600 hover:bg-red-50">Delete</Button>
        )}
        {!isOwner && (
          <span className="text-sm text-gray-500">View only – you are not the owner</span>
        )}
      </div>
    </div>
  );
}
