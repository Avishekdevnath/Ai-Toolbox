'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { languages } from '@/lib/snippetLanguages';
import { getLangColor } from '@/lib/snippetLanguages';
import type { ThemeTokens } from '@/lib/editorTheme';

interface LanguageSelectProps {
  value: string;
  onChange: (lang: string) => void;
  tokens?: ThemeTokens;
}

export default function LanguageSelect({ value, onChange, tokens }: LanguageSelectProps) {
  const isDark = !tokens || tokens.monacoTheme === 'vs-dark';

  const selectBg    = isDark ? '#3c3c3c' : '#ffffff';
  const selectBorder = isDark ? '#555555' : '#c8c8c8';
  const selectText  = isDark ? '#e0e0e0' : '#1e1e1e';

  return (
    <div className="relative flex items-center">
      {/* Language colour dot */}
      <div
        className={`absolute left-2.5 w-2 h-2 rounded-full flex-shrink-0 pointer-events-none z-10
          ${getLangColor(value).split(' ').find(c => c.startsWith('bg-')) ?? 'bg-gray-500'}`}
      />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: selectBg,
          color: selectText,
          borderColor: selectBorder,
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
        className="h-8 pl-6 pr-7 text-xs font-mono rounded-md border
          outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30
          transition-colors duration-150 cursor-pointer w-36"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang} style={{ background: selectBg, color: selectText }}>
            {lang}
          </option>
        ))}
      </select>

      {/* Custom chevron */}
      <ChevronDown
        size={12}
        className="absolute right-2 pointer-events-none"
        style={{ color: isDark ? '#858585' : '#888888' }}
      />
    </div>
  );
}
