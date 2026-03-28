'use client';

import React, { useState } from 'react';
import { Copy, Check, GitFork, WrapText, AlignLeft, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { downloadCodeAsImage } from '@/utils/codeImageUtils';
import type { ThemeTokens } from '@/lib/editorTheme';

interface ViewerClientProps {
  slug: string;
  code: string;
  wordWrap: boolean;
  onWordWrapToggle: () => void;
  tokens: ThemeTokens;
}

export default function ViewerClient({
  slug,
  code,
  wordWrap,
  onWordWrapToggle,
  tokens,
}: ViewerClientProps) {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const [copied, setCopied] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFork = async () => {
    if (isForking) return;
    setIsForking(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-user-id'] = userId;
      const res = await fetch(`/api/snippets/${slug}/fork`, { method: 'POST', headers });
      if (!res.ok) return;
      const { data } = await res.json();
      router.push(`/s/${data.slug}/edit`);
    } finally {
      setIsForking(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCodeAsImage('code-display', `snippet-${slug}`);
    } finally {
      setDownloading(false);
    }
  };

  const btnBase = `p-1.5 rounded-md transition-colors ${tokens.iconBtnBg} ${tokens.iconBtnHoverBg} ${tokens.iconBtnText} ${tokens.iconBtnHoverText}`;

  return (
    <div className="flex items-center gap-1">
      {/* Word wrap */}
      <button
        onClick={onWordWrapToggle}
        title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
        className={wordWrap ? 'p-1.5 rounded-md bg-blue-600 text-white' : btnBase}
      >
        {wordWrap ? <WrapText size={14} /> : <AlignLeft size={14} />}
      </button>

      {/* Copy */}
      <button onClick={handleCopy} title={copied ? 'Copied!' : 'Copy code'} className={btnBase}>
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>

      {/* Download as PNG */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        title="Download as PNG"
        className={`${btnBase} disabled:opacity-50`}
      >
        <ImageIcon size={14} className={downloading ? 'animate-pulse' : ''} />
      </button>

      {/* Fork */}
      <button
        onClick={handleFork}
        disabled={isForking}
        title="Fork this snippet"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/20 text-purple-400 text-xs font-medium transition-colors disabled:opacity-50"
      >
        <GitFork size={13} />
        <span className="hidden sm:inline">{isForking ? 'Forking…' : 'Fork'}</span>
      </button>
    </div>
  );
}
