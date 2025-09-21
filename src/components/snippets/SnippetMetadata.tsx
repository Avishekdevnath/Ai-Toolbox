import { formatDistanceToNow } from 'date-fns';
import React from 'react';

export interface SnippetMetadataProps {
  title?: string;
  language: string;
  author?: string;
  createdAt: string | Date;
  viewCount: number;
}

export default function SnippetMetadata({ title, language, author, createdAt, viewCount }: SnippetMetadataProps) {
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
      <div>
        <span className="font-medium">Language:</span> {language}
      </div>
      <div>
        <span className="font-medium">Author:</span> {author || 'Anonymous'}
      </div>
      <div>
        <span className="font-medium">Created:</span> {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
      </div>
      <div>
        <span className="font-medium">Views:</span> {viewCount}
      </div>
    </div>
  );
}
