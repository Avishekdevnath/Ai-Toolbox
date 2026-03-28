'use client';

import React from 'react';
import {
  Save, Copy, Share2, Users, Plus, GitFork,
  Check, Code2, Sun, Moon,
} from 'lucide-react';
import Link from 'next/link';
import type { EditorTheme, ThemeTokens } from '@/lib/editorTheme';

interface SnippetEditorHeaderProps {
  isNew: boolean;
  shareUrl?: string;
  isConnected: boolean;
  activeUsers: string[];
  lastSaved?: Date;
  isSaving: boolean;
  copied: boolean;
  theme: EditorTheme;
  tokens: ThemeTokens;
  onCopy: () => void;
  onShare: () => void;
  onSave: () => void;
  onCreateNew: () => void;
  onThemeToggle: () => void;
  onFork?: () => void;
  isForking?: boolean;
  showFork?: boolean;
  errorMessage?: string;
}

export default function SnippetEditorHeader({
  isNew,
  shareUrl,
  isConnected,
  activeUsers,
  lastSaved,
  isSaving,
  copied,
  theme,
  tokens,
  onCopy,
  onShare,
  onSave,
  onCreateNew,
  onThemeToggle,
  onFork,
  isForking,
  showFork,
  errorMessage,
}: SnippetEditorHeaderProps) {
  function formatSaved(d: Date) {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  }

  const isLight = theme === 'light';

  return (
    <div className={`border-b ${tokens.barBg} ${tokens.barBorder} transition-colors duration-200`}>
      {/* Error banner */}
      {errorMessage && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs px-4 py-1.5">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 gap-3">
        {/* Left: brand + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className={`flex items-center gap-1.5 flex-shrink-0 transition-colors ${tokens.textPrimary} ${isLight ? 'hover:text-gray-600' : 'hover:text-gray-300'}`}
          >
            <Code2 size={15} className="text-blue-500" />
            <span className={`text-sm font-semibold hidden sm:inline ${tokens.textMuted}`}>
              ShareCode
            </span>
          </Link>

          <div className={`h-4 w-px hidden sm:block ${isLight ? 'bg-gray-300' : 'bg-gray-700'}`} />

          <div className="flex items-center gap-2 flex-wrap">
            {isSaving && (
              <span className={`text-xs ${tokens.textMuted}`}>Saving…</span>
            )}
            {!isSaving && lastSaved && (
              <span className={`text-xs ${tokens.textMuted}`}>
                Saved {formatSaved(lastSaved)}
              </span>
            )}
            {isConnected && (
              <div className={`flex items-center gap-1 text-xs ${tokens.liveColor}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLight ? 'bg-green-500' : 'bg-green-400'}`} />
                <span className="hidden sm:inline">Live</span>
              </div>
            )}
            {isConnected && activeUsers.length > 0 && (
              <div className={`flex items-center gap-1 text-xs ${tokens.textMuted}`}>
                <Users size={11} />
                <span>{activeUsers.length + 1}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Fork (non-owner only) */}
          {showFork && onFork && (
            <button
              onClick={onFork}
              disabled={isForking}
              title="Fork this snippet"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/20 text-purple-400 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <GitFork size={13} />
              <span className="hidden sm:inline">{isForking ? 'Forking…' : 'Fork'}</span>
            </button>
          )}

          {/* Theme toggle */}
          <IconBtn
            onClick={onThemeToggle}
            title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
            tokens={tokens}
          >
            {isLight ? (
              <Moon size={14} className={tokens.textSecondary} />
            ) : (
              <Sun size={14} className={tokens.textSecondary} />
            )}
          </IconBtn>

          <IconBtn onClick={onCreateNew} title="New snippet" tokens={tokens}>
            <Plus size={14} />
          </IconBtn>

          <IconBtn onClick={onCopy} title={copied ? 'Copied!' : 'Copy code'} tokens={tokens}>
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </IconBtn>

          <IconBtn onClick={onShare} title="Copy share link" disabled={!shareUrl} tokens={tokens}>
            <Share2 size={14} />
          </IconBtn>

          {/* Save — primary CTA */}
          <button
            onClick={onSave}
            disabled={isSaving}
            title={isSaving ? 'Saving…' : 'Save'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={13} />
            <span className="hidden sm:inline">{isSaving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
  tokens,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  tokens: ThemeTokens;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${tokens.iconBtnBg} ${tokens.iconBtnHoverBg} ${tokens.iconBtnText} ${tokens.iconBtnHoverText}`}
    >
      {children}
    </button>
  );
}
