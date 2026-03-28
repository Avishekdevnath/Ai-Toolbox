'use client';

import React, { useRef } from 'react';
import { X, ClipboardPaste, FileText } from 'lucide-react';

const SAMPLES = [
  {
    label: 'Simple',
    text: 'This is a simple text. It has short sentences. It is easy to read. Most people will understand it quickly.',
  },
  {
    label: 'Complex',
    text: 'Notwithstanding the considerable complexity inherent in contemporary technological implementations, the fundamental principles underlying computational methodologies remain accessible to individuals possessing requisite educational backgrounds and intellectual capabilities.',
  },
  {
    label: 'Lorem',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

interface Props {
  text: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

export default function WordCounterInput({ text, onChange, onClear }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      onChange(text + clip);
      textareaRef.current?.focus();
    } catch {
      textareaRef.current?.focus();
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Textarea card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-150">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-1.5">
            <FileText size={13} className="text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Input</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePaste}
              title="Paste from clipboard"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors duration-100 cursor-pointer"
            >
              <ClipboardPaste size={11} />
              Paste
            </button>
            {text && (
              <button
                onClick={onClear}
                title="Clear text"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-100 cursor-pointer"
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste your text here to analyze word count, readability, and more…"
          className="w-full resize-none px-4 py-3.5 text-[13px] leading-relaxed text-slate-700 placeholder:text-slate-300 bg-white outline-none"
          style={{ minHeight: '260px', height: '100%' }}
          spellCheck={false}
        />

        {/* Footer counter */}
        <div className="flex items-center justify-end gap-3 px-3 py-2 border-t border-slate-100 bg-slate-50">
          <span className="text-[11px] tabular-nums text-slate-400">
            <span className="font-medium text-slate-600">{wordCount.toLocaleString()}</span> words
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] tabular-nums text-slate-400">
            <span className="font-medium text-slate-600">{charCount.toLocaleString()}</span> chars
          </span>
        </div>
      </div>

      {/* Sample text pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-400 font-medium">Try:</span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => onChange(s.text)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 text-slate-500 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
