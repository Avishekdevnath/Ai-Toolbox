'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SnippetEditorHeader from './SnippetEditorHeader';
import EditorControls from './EditorControls';
import { useRouter } from 'next/navigation';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import dynamic from 'next/dynamic';
import { getShareBaseUrl } from '@/utils/url';
import {
  type EditorTheme,
  getStoredTheme,
  storeTheme,
  getTokens,
} from '@/lib/editorTheme';

const MonacoEditor = dynamic(() => import('./MonacoEditor'), { ssr: false });

export interface SnippetEditorProps {
  initialData?: {
    slug: string;
    title?: string;
    language: string;
    content: string;
    isPublic: boolean;
    ownerId?: string;
  };
  isNew?: boolean;
}

function SnippetEditorComponent({ initialData, isNew = false }: SnippetEditorProps) {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;
  const isOwner = !!(userId && initialData?.ownerId && initialData.ownerId === userId);
  const hasOwner = !!initialData?.ownerId;

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<EditorTheme>('dark'); // SSR-safe default
  useEffect(() => { setTheme(getStoredTheme()); }, []);    // hydrate from localStorage

  const handleThemeToggle = () => {
    const next: EditorTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storeTheme(next);
  };

  const tokens = getTokens(theme);

  // ── UI state (NOT content — that lives in Monaco) ──────────────────────────
  const [title, setTitle] = useState(initialData?.title || '');
  const [language, setLanguage] = useState(initialData?.language || 'javascript');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isForking, setIsForking] = useState(false);

  // Refs so callbacks always read current values without stale closures
  const editorRef = useRef<any>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef(title);
  const languageRef = useRef(language);
  const isPublicRef = useRef(isPublic);
  const isSavingRef = useRef(false);

  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { isPublicRef.current = isPublic; }, [isPublic]);

  useEffect(() => {
    if (initialData?.slug) {
      setShareUrl(`${getShareBaseUrl()}/s/${initialData.slug}`);
    }
  }, [initialData?.slug]);

  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMessage(''), 4000);
  }, []);

  // ── Real-time collaboration ───────────────────────────────────────────────
  const handleRemoteContentChange = useCallback((v: string) => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && model.getValue() !== v) editorRef.current.setValue(v);
    }
  }, []);
  const handleRemoteTitleChange = useCallback((v: string) => setTitle(v), []);
  const handleRemoteLanguageChange = useCallback((v: string) => setLanguage(v), []);
  const handleRemoteVisibilityChange = useCallback((v: boolean) => setIsPublic(v), []);

  const {
    isConnected,
    activeUsers,
    emitContentChange,
    emitTitleChange,
    emitLanguageChange,
    emitVisibilityChange,
  } = useRealtimeCollaboration({
    snippetId: initialData?.slug || '',
    onContentChange: handleRemoteContentChange,
    onTitleChange: handleRemoteTitleChange,
    onLanguageChange: handleRemoteLanguageChange,
    onVisibilityChange: handleRemoteVisibilityChange,
    onCursorChange: () => {},
  });

  // ── Save ─────────────────────────────────────────────────────────────────
  const save = useCallback(async (isAutoSave = false) => {
    if (isSavingRef.current || !initialData?.slug) return;
    isSavingRef.current = true;
    setIsSaving(true);
    const content = editorRef.current?.getValue() ?? '';
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch(`/api/snippets/${initialData.slug}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: titleRef.current.trim() || undefined,
          language: languageRef.current,
          content,
          isPublic: isPublicRef.current,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        if (!isAutoSave) showError(err.error || 'Failed to save snippet');
        return;
      }
      setLastSaved(new Date());
      fetch('/api/tools/code-share/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageType: 'generate', userId }),
      }).catch(() => {});
    } catch {
      if (!isAutoSave) showError('An error occurred while saving. Please try again.');
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [initialData?.slug, userId, showError]);

  // Debounce auto-save when title/language/visibility change
  useEffect(() => {
    if (!initialData?.slug) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(true), 2000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, language, isPublic, initialData?.slug]);

  // ── Monaco mount ─────────────────────────────────────────────────────────
  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;
    editor.focus();
    editor.onDidChangeModelContent(() => {
      const val = editor.getValue();
      if (initialData?.slug) emitContentChange(val, editor.getPosition()?.column ?? 0);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(true), 2000);
    });
  }, [initialData?.slug, emitContentChange, save]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorRef.current?.getValue() ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    fetch('/api/tools/code-share/track-usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usageType: 'share', userId }),
    }).catch(() => {});
  };

  const handleFork = async () => {
    if (!initialData?.slug || isForking) return;
    setIsForking(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch(`/api/snippets/${initialData.slug}/fork`, { method: 'POST', headers });
      if (!res.ok) { showError('Failed to fork snippet'); return; }
      const { data } = await res.json();
      router.push(`/s/${data.slug}/edit`);
    } catch {
      showError('Failed to fork snippet');
    } finally {
      setIsForking(false);
    }
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (initialData?.slug) emitTitleChange(v);
  };
  const handleLanguageChange = (v: string) => {
    setLanguage(v);
    if (initialData?.slug) emitLanguageChange(v);
  };
  const handleVisibilityChange = (v: boolean) => {
    setIsPublic(v);
    if (initialData?.slug) emitVisibilityChange(v);
  };

  const showFork = !!(initialData?.slug && hasOwner && !isOwner);

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-200 ${tokens.pageBg}`}>
      <SnippetEditorHeader
        isNew={isNew}
        shareUrl={shareUrl}
        isConnected={isConnected}
        activeUsers={activeUsers}
        lastSaved={lastSaved}
        isSaving={isSaving}
        copied={copied}
        theme={theme}
        tokens={tokens}
        onCopy={handleCopy}
        onShare={handleShare}
        onSave={() => save()}
        onCreateNew={() => window.open('/s/new', '_blank')}
        onThemeToggle={handleThemeToggle}
        onFork={handleFork}
        isForking={isForking}
        showFork={showFork}
        errorMessage={errorMessage}
      />

      <EditorControls
        title={title}
        language={language}
        isPublic={isPublic}
        isOwner={isOwner}
        hasOwner={hasOwner}
        tokens={tokens}
        onTitleChange={handleTitleChange}
        onLanguageChange={handleLanguageChange}
        onVisibilityChange={handleVisibilityChange}
      />

      <div className="flex-1 min-h-0" style={{ height: 0 }}>
        <MonacoEditor
          language={language}
          defaultValue={initialData?.content ?? ''}
          theme={theme}
          onMount={handleEditorMount}
          height="100%"
        />
      </div>
    </div>
  );
}

const SnippetEditor = dynamic(() => Promise.resolve(SnippetEditorComponent), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-[#1e1e1e] text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-600">Loading editor…</span>
      </div>
    </div>
  ),
});

export default SnippetEditor;
