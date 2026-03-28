'use client';

import React from 'react';
import { Type, Hash, AlignLeft, Rows3, BookOpen, Clock } from 'lucide-react';

interface Stat {
  icon: React.ElementType;
  value: number | string;
  label: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

interface Props {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
}

export default function WordCounterStats({
  words,
  characters,
  charactersNoSpaces,
  sentences,
  paragraphs,
  readingTime,
}: Props) {
  const stats: Stat[] = [
    {
      icon: Type,
      value: words,
      label: 'Words',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
    },
    {
      icon: Hash,
      value: characters,
      label: 'Characters',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
    },
    {
      icon: AlignLeft,
      value: sentences,
      label: 'Sentences',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      valueColor: 'text-violet-600',
    },
    {
      icon: Rows3,
      value: paragraphs,
      label: 'Paragraphs',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      valueColor: 'text-orange-500',
    },
    {
      icon: BookOpen,
      value: charactersNoSpaces,
      label: 'Chars (no spaces)',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-600',
    },
    {
      icon: Clock,
      value: readingTime < 1 ? '<1' : readingTime,
      label: 'Min read',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      valueColor: 'text-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-xl px-3.5 py-3 flex items-center gap-3 hover:border-slate-300 transition-colors duration-150"
          >
            <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center shrink-0`}>
              <Icon size={14} className={stat.iconColor} />
            </div>
            <div className="min-w-0">
              <p className={`text-lg font-bold leading-none tabular-nums ${stat.valueColor}`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
