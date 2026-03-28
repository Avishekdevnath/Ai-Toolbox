'use client';

import React from 'react';
import { Globe, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LanguageSelect from './LanguageSelect';
import type { ThemeTokens } from '@/lib/editorTheme';

interface EditorControlsProps {
  title: string;
  language: string;
  isPublic: boolean;
  isOwner: boolean;
  hasOwner: boolean;
  tokens: ThemeTokens;
  onTitleChange: (v: string) => void;
  onLanguageChange: (v: string) => void;
  onVisibilityChange: (v: boolean) => void;
}

export default function EditorControls({
  title,
  language,
  isPublic,
  isOwner,
  hasOwner,
  tokens,
  onTitleChange,
  onLanguageChange,
  onVisibilityChange,
}: EditorControlsProps) {
  const canToggleVisibility = isOwner || !hasOwner;

  return (
    <div className={`flex-shrink-0 border-b ${tokens.barBg} ${tokens.barBorder} px-3 sm:px-4 py-2 transition-colors duration-200`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Input
          placeholder="Untitled snippet"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`text-sm flex-1 w-full sm:max-w-md h-8 focus:ring-0 border
            ${tokens.inputBg} ${tokens.inputBorder} ${tokens.inputText}
            ${tokens.inputPlaceholder} ${tokens.inputFocusBorder}`}
        />

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <LanguageSelect value={language} onChange={onLanguageChange} tokens={tokens} />

          <div
            className={`flex items-center rounded-md border overflow-hidden transition-colors duration-200 ${
              !canToggleVisibility ? 'opacity-50 pointer-events-none' : ''
            }`}
            style={{ borderColor: tokens.monacoTheme === 'vs-dark' ? '#555555' : '#c8c8c8' }}
            title={!canToggleVisibility ? 'Only the owner can change visibility' : undefined}
          >
            <button
              type="button"
              onClick={() => canToggleVisibility && onVisibilityChange(true)}
              className={`flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium transition-colors duration-150 ${
                isPublic
                  ? 'bg-blue-600 text-white'
                  : tokens.monacoTheme === 'vs-dark'
                    ? 'bg-[#3c3c3c] text-[#858585] hover:text-[#e0e0e0]'
                    : 'bg-white text-[#888888] hover:text-[#1e1e1e]'
              }`}
            >
              <Globe size={12} />
              <span className="hidden sm:inline">Public</span>
            </button>
            <button
              type="button"
              onClick={() => canToggleVisibility && onVisibilityChange(false)}
              className={`flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium transition-colors duration-150 ${
                !isPublic
                  ? 'bg-blue-600 text-white'
                  : tokens.monacoTheme === 'vs-dark'
                    ? 'bg-[#3c3c3c] text-[#858585] hover:text-[#e0e0e0]'
                    : 'bg-white text-[#888888] hover:text-[#1e1e1e]'
              }`}
            >
              <Lock size={12} />
              <span className="hidden sm:inline">Private</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
