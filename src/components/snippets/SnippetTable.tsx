"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

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
  // Safety check to ensure items is an array
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-lg font-medium mb-2">No snippets yet</div>
        <div className="text-sm">Create your first code snippet to get started</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {items.map((s) => (
          <div key={s.slug} className="border-b border-gray-200 p-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <Link href={`/s/${s.slug}`} className="text-blue-600 hover:text-blue-800 font-medium truncate block">
                  {s.title || '(untitled)'}
                </Link>
                <div className="text-xs text-gray-500 mt-1">
                  {s.language} • {new Date(s.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div className="flex items-center gap-1">
                  {s.isPublic ? (
                    <Eye size={14} className="text-green-600" title="Public" />
                  ) : (
                    <EyeOff size={14} className="text-gray-400" title="Private" />
                  )}
                </div>
                <Link href={`/s/${s.slug}/edit`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="p-1.5">
                    <Edit size={14} />
                  </Button>
                </Link>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="p-1.5"
                  onClick={() => onDelete(s.slug)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Language</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Updated</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Visibility</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((s) => (
              <tr key={s.slug} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link href={`/s/${s.slug}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {s.title || '(untitled)'}
                  </Link>
                </td>
                <td className="py-3 px-4 text-gray-700">{s.language}</td>
                <td className="py-3 px-4 text-gray-500">{new Date(s.updatedAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {s.isPublic ? (
                      <>
                        <Eye size={14} className="text-green-600" />
                        <span className="text-green-600 text-xs">Public</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} className="text-gray-400" />
                        <span className="text-gray-500 text-xs">Private</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/s/${s.slug}/edit`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Edit size={14} />
                        <span>Edit</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => onDelete(s.slug)}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
