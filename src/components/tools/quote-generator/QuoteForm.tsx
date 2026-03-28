'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, ChevronDown, Minus, Plus } from 'lucide-react';

const TOPICS = ['Love','Success','Life','Friendship','Happiness','Science','Art','Nature','Wisdom','Courage','Birthday'];
const MOODS  = ['Motivational','Humorous','Thoughtful','Romantic','Philosophical','Reflective','Uplifting','Celebratory'];
const LANGUAGES = ['English','Hindi','Spanish','French','German','Bengali','Chinese','Japanese','Russian','Arabic'];
const AUTHOR_SUGGESTIONS = [
  'Rabindranath Tagore','Rumi','Albert Einstein','Marie Curie','Isaac Newton',
  'Stephen Hawking','Maya Angelou','William Shakespeare','Khalil Gibran',
  'Oscar Wilde','Lao Tzu','Mahatma Gandhi','Steve Jobs','Unknown',
];

interface Props {
  loading: boolean;
  onGenerate: (params: {
    topic: string; mood: string; author: string;
    birthDate: string; count: number; language: string;
  }) => void;
}

function PillGroup({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt.toLowerCase() ? '' : opt.toLowerCase())}
          className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all duration-150 cursor-pointer ${
            value === opt.toLowerCase()
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CountStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <Minus size={13} />
      </button>
      <span className="w-8 text-center text-[14px] font-bold tabular-nums text-slate-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(20, value + 1))}
        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

export default function QuoteForm({ loading, onGenerate }: Props) {
  const [topic,     setTopic]     = useState('');
  const [mood,      setMood]      = useState('');
  const [author,    setAuthor]    = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [count,     setCount]     = useState(5);
  const [language,  setLanguage]  = useState('English');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const authorRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setAuthor(v);
    if (v.length > 0) {
      setSuggestions(AUTHOR_SUGGESTIONS.filter(s => s.toLowerCase().includes(v.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const pickSuggestion = (s: string) => {
    setAuthor(s);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ topic, mood, author, birthDate, count, language });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">

      {/* Topic */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Topic</label>
        <PillGroup options={TOPICS} value={topic} onChange={setTopic} />
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Mood</label>
        <PillGroup options={MOODS} value={mood} onChange={setMood} />
      </div>

      {/* Author + Language row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Author with autocomplete */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Author Name</label>
          <div ref={authorRef} className="relative">
            <input
              type="text"
              value={author}
              onChange={handleAuthorChange}
              onFocus={() => author && setShowSuggestions(suggestions.length > 0)}
              placeholder="e.g. Einstein, Rumi, Shakespeare…"
              autoComplete="off"
              className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s}
                    onMouseDown={() => pickSuggestion(s)}
                    className="px-3 py-2 text-[13px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Language</label>
          <div className="relative">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full h-9 pl-3 pr-8 text-[13px] border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 appearance-none transition-all cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Count + Birthday row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Count stepper */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            Quotes — <span className="text-blue-600">{count}</span>
          </label>
          <CountStepper value={count} onChange={setCount} />
        </div>

        {/* Birthday (optional) */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            Birthday <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Generate button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-xl transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Generating…</>
        ) : (
          <><Sparkles size={15} /> Generate Quotes</>
        )}
      </button>
    </form>
  );
}
