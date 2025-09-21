"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

interface SnippetItem {
  slug: string;
  title?: string;
  language: string;
  updatedAt: string;
  isPublic: boolean;
}

interface SnippetTableProps {
  items: SnippetItem[];
  onDelete: (slug: string) => void;
}

export default function SnippetTable({ items, onDelete }: SnippetTableProps) {
  if (items.length === 0) return <div>No snippets yet.</div>;
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Title</th>
          <th className="text-left py-2">Language</th>
          <th className="text-left py-2">Updated</th>
          <th className="text-left py-2">Visibility</th>
          <th className="text-left py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((s) => (
          <tr key={s.slug} className="border-b hover:bg-gray-50">
            <td className="py-2">
              <Link href={`/s/${s.slug}`} className="text-blue-600 underline">
                {s.title || '(untitled)'}
              </Link>
            </td>
            <td className="py-2">{s.language}</td>
            <td className="py-2">{new Date(s.updatedAt).toLocaleString()}</td>
            <td className="py-2">{s.isPublic ? 'Public' : 'Private'}</td>
            <td className="py-2 flex gap-2">
              <Link href={`/dashboard/snippets/${s.slug}/edit`}><Button size="sm">Edit</Button></Link>
              <Button variant="destructive" size="sm" onClick={() => onDelete(s.slug)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
