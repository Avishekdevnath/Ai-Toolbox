'use client';

import React, { useState, useEffect } from 'react';
import ViewerHeader from './ViewerHeader';
import CodeBlock from './CodeBlock';
import {
  type EditorTheme,
  getStoredTheme,
  storeTheme,
  getTokens,
} from '@/lib/editorTheme';

interface ViewerShellProps {
  slug: string;
  title?: string;
  language: string;
  viewCount: number;
  content: string;
}

export default function ViewerShell({
  slug,
  title,
  language,
  viewCount,
  content,
}: ViewerShellProps) {
  const [wordWrap, setWordWrap] = useState(false);
  const [theme, setTheme] = useState<EditorTheme>('dark');
  useEffect(() => { setTheme(getStoredTheme()); }, []);

  const handleThemeToggle = () => {
    const next: EditorTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storeTheme(next);
  };

  const tokens = getTokens(theme);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${tokens.pageBg}`}>
      <ViewerHeader
        slug={slug}
        title={title}
        language={language}
        viewCount={viewCount}
        code={content}
        wordWrap={wordWrap}
        onWordWrapToggle={() => setWordWrap((w) => !w)}
        theme={theme}
        tokens={tokens}
        onThemeToggle={handleThemeToggle}
      />

      <div className={`flex-1 overflow-auto ${tokens.codeBg} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto">
          <div id="code-display">
            <CodeBlock
              code={content}
              language={language}
              className="text-xs sm:text-sm leading-relaxed"
              wordWrap={wordWrap}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
