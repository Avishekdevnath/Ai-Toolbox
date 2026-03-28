'use client';

import Link from 'next/link';
import React from 'react';
import { ExternalLink, Pencil, Trash2, Eye, EyeOff, Code2 } from 'lucide-react';
import { getLangColor } from '@/lib/snippetLanguages';

interface SnippetItem {
  slug: string;
  title?: string;
  language: string;
  updatedAt: string;
  isPublic: boolean;
  content?: string;
}

interface SnippetTableProps {
  items: SnippetItem[];
  onDelete: (slug: string) => void;
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SnippetTable({ items, onDelete }: SnippetTableProps) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Code2 size={32} className="mb-3 text-gray-700" />
        <div className="text-sm font-medium text-gray-400 mb-1">No snippets yet</div>
        <div className="text-xs text-gray-600">Create your first snippet to get started</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((s) => {
        const preview = (s.content || '')
          .split('\n')
          .slice(0, 3)
          .join('\n');
        const langColor = getLangColor(s.language);

        return (
          <div
            key={s.slug}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors group"
          >
            {/* Card header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md flex-shrink-0 ${langColor}`}>
                  {s.language}
                </span>
                <Link
                  href={`/s/${s.slug}`}
                  className="text-sm font-medium text-gray-200 hover:text-white truncate transition-colors"
                >
                  {s.title || <span className="text-gray-500 italic font-normal">Untitled</span>}
                </Link>
              </div>
              <div className="flex-shrink-0 ml-2">
                {s.isPublic ? (
                  <Eye size={13} className="text-green-500" title="Public" />
                ) : (
                  <EyeOff size={13} className="text-gray-600" title="Private" />
                )}
              </div>
            </div>

            {/* Code preview */}
            <div className="px-3.5 py-3 bg-gray-950/60 min-h-[56px]">
              {preview ? (
                <pre className="text-[11px] font-mono text-gray-500 leading-relaxed overflow-hidden line-clamp-3 whitespace-pre">
                  {preview}
                </pre>
              ) : (
                <span className="text-[11px] text-gray-700 italic">Empty snippet</span>
              )}
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-800/60">
              <span className="text-[11px] text-gray-600">{timeAgo(s.updatedAt)}</span>

              <div className="flex items-center gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/s/${s.slug}`}
                  title="View"
                  className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink size={13} />
                </Link>
                <Link
                  href={`/s/${s.slug}/edit`}
                  title="Edit"
                  className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <Pencil size={13} />
                </Link>
                <button
                  onClick={() => onDelete(s.slug)}
                  title="Delete"
                  className="p-1.5 rounded-md hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
