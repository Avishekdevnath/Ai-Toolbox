'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';

interface Props {
  words: number;
  sentences: number;
  paragraphs: number;
  characters: number;
  charactersNoSpaces: number;
}

interface Row {
  label: string;
  value: string | number;
}

export default function WordCounterDetails({
  words,
  sentences,
  paragraphs,
  characters,
  charactersNoSpaces,
}: Props) {
  const avgWordsPerSentence =
    sentences > 0 ? (words / sentences).toFixed(1) : '—';
  const avgCharsPerWord =
    words > 0 ? (charactersNoSpaces / words).toFixed(1) : '—';
  const spaceCount = characters - charactersNoSpaces;

  const rows: Row[] = [
    { label: 'Avg. words / sentence', value: avgWordsPerSentence },
    { label: 'Avg. chars / word',     value: avgCharsPerWord     },
    { label: 'Space characters',      value: spaceCount > 0 ? spaceCount.toLocaleString() : '—' },
    { label: 'Paragraphs',            value: paragraphs > 0 ? paragraphs.toLocaleString() : '—' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
          <BarChart2 size={14} className="text-slate-500" />
        </div>
        <p className="text-[12px] font-semibold text-slate-700">Derived Metrics</p>
      </div>

      <div className="space-y-0 divide-y divide-slate-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2">
            <span className="text-[12px] text-slate-500">{row.label}</span>
            <span className="text-[12px] font-semibold tabular-nums text-slate-700">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
