'use client';

import { useState, useEffect, useCallback } from 'react';
import WordCounterInput       from './word-counter/WordCounterInput';
import WordCounterStats       from './word-counter/WordCounterStats';
import WordCounterReadability from './word-counter/WordCounterReadability';
import WordCounterDetails     from './word-counter/WordCounterDetails';

// ─── Pure analysis logic ──────────────────────────────────────────────────────

function estimateSyllables(text: string, wordCount: number): number {
  if (wordCount === 0) return 0;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let total = 0;
  for (const raw of words) {
    const w = raw.replace(/[^a-z]/g, '');
    if (!w) continue;
    let s = w.match(/[aeiouy]+/g)?.length ?? 0;
    if (w.endsWith('e')) s--;
    total += Math.max(1, s);
  }
  return total / wordCount;
}

function getReadabilityLevel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Difficult';
}

interface Analysis {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  readabilityScore: number;
  readabilityLevel: string;
}

const EMPTY: Analysis = {
  words: 0, characters: 0, charactersNoSpaces: 0,
  sentences: 0, paragraphs: 0, readingTime: 0,
  readabilityScore: 0, readabilityLevel: '',
};

function analyze(input: string): Analysis {
  if (!input.trim()) return EMPTY;

  const characters         = input.length;
  const charactersNoSpaces = input.replace(/\s/g, '').length;
  const words              = input.trim().split(/\s+/).filter(Boolean).length;
  const sentences          = input.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs         = input.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readingTime        = Math.ceil(words / 200);

  const avgWordsPerSentence  = sentences > 0 ? words / sentences : 0;
  const avgSyllablesPerWord  = estimateSyllables(input, words);
  const readabilityScore     = Math.round(
    Math.max(0, Math.min(100,
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
    ))
  );

  return {
    words, characters, charactersNoSpaces,
    sentences, paragraphs, readingTime,
    readabilityScore,
    readabilityLevel: getReadabilityLevel(readabilityScore),
  };
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const [data, setData] = useState<Analysis>(EMPTY);

  const handleChange = useCallback((v: string) => setText(v), []);
  const handleClear  = useCallback(() => setText(''), []);

  useEffect(() => {
    setData(analyze(text));

    if (text.trim()) {
      fetch('/api/tools/word-counter/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageType: 'generate' }),
      }).catch(() => {});
    }
  }, [text]);

  const hasContent = data.words > 0;

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Word Counter</h1>
        <p className="text-[12px] text-slate-400 mt-0.5">
          Paste or type text to get instant word counts, readability score, and detailed stats.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left — input */}
        <WordCounterInput
          text={text}
          onChange={handleChange}
          onClear={handleClear}
        />

        {/* Right — stats stack */}
        <div className="flex flex-col gap-4">
          <WordCounterStats
            words={data.words}
            characters={data.characters}
            charactersNoSpaces={data.charactersNoSpaces}
            sentences={data.sentences}
            paragraphs={data.paragraphs}
            readingTime={data.readingTime}
          />

          <WordCounterReadability
            score={data.readabilityScore}
            level={data.readabilityLevel}
            hasContent={hasContent}
          />

          <WordCounterDetails
            words={data.words}
            sentences={data.sentences}
            paragraphs={data.paragraphs}
            characters={data.characters}
            charactersNoSpaces={data.charactersNoSpaces}
          />
        </div>
      </div>
    </div>
  );
}
