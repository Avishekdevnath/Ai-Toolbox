'use client';

import React from 'react';
import Link from 'next/link';
import { Code2, Eye, Pencil, Sun, Moon } from 'lucide-react';
import { getLangColor } from '@/lib/snippetLanguages';
import ViewerClient from './ViewerClient';
import type { EditorTheme, ThemeTokens } from '@/lib/editorTheme';

interface ViewerHeaderProps {
  slug: string;
  title?: string;
  language: string;
  viewCount: number;
  code: string;
  wordWrap: boolean;
  onWordWrapToggle: () => void;
  theme: EditorTheme;
  tokens: ThemeTokens;
  onThemeToggle: () => void;
}

export default function ViewerHeader({
  slug,
  title,
  language,
  viewCount,
  code,
  wordWrap,
  onWordWrapToggle,
  theme,
  tokens,
  onThemeToggle,
}: ViewerHeaderProps) {
  const langColor = getLangColor(language);
  const isLight = theme === 'light';

  return (
    <div
      className={`sticky top-0 z-10 border-b transition-colors duration-200
        ${tokens.barBg} ${tokens.barBorder}`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: brand → title → language badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            className={`flex items-center gap-1.5 flex-shrink-0 transition-colors ${tokens.textPrimary} ${isLight ? 'hover:text-gray-600' : 'hover:text-gray-300'}`}
          >
            <Code2 size={15} className="text-blue-500" />
            <span className={`text-xs font-semibold hidden sm:inline ${tokens.textMuted}`}>
              ShareCode
            </span>
          </Link>

          <div className={`h-3.5 w-px hidden sm:block ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`} />

          <h1 className={`text-sm font-medium truncate ${tokens.textPrimary}`}>
            {title || <span className={`italic font-normal ${tokens.textMuted}`}>Untitled</span>}
          </h1>

          <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md flex-shrink-0 ${langColor}`}>
            {language}
          </span>
        </div>

        {/* Right: view count + theme + actions + edit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`flex items-center gap-1 text-xs mr-1 ${tokens.textMuted}`}>
            <Eye size={12} />
            <span>{viewCount}</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
            className={`p-1.5 rounded-md transition-colors
              ${tokens.iconBtnBg} ${tokens.iconBtnHoverBg} ${tokens.iconBtnText} ${tokens.iconBtnHoverText}`}
          >
            {isLight ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          <ViewerClient
            slug={slug}
            code={code}
            wordWrap={wordWrap}
            onWordWrapToggle={onWordWrapToggle}
            tokens={tokens}
          />

          <Link
            href={`/s/${slug}/edit`}
            title="Open in editor"
            className={`p-1.5 rounded-md transition-colors
              ${tokens.iconBtnBg} ${tokens.iconBtnHoverBg} ${tokens.iconBtnText} ${tokens.iconBtnHoverText}`}
          >
            <Pencil size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
