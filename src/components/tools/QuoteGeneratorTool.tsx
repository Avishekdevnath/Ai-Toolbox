import { useState } from 'react';
import html2canvas from 'html2canvas';
import { Quote } from '@/lib/quoteUtils';

const AUTHOR_SUGGESTIONS = [
  'Rabindranath Tagore',
  'Rumi',
  'Albert Einstein',
  'Marie Curie',
  'Isaac Newton',
  'Stephen Hawking',
  'Scientists',
  'Maya Angelou',
  'William Shakespeare',
  'Khalil Gibran',
  'Oscar Wilde',
  'Lao Tzu',
  'Mahatma Gandhi',
  'Steve Jobs',
  'Jim Morrison',
  'Plautus',
  'Unknown',
];
const TOPICS = [
  'Love',
  'Success',
  'Life',
  'Friendship',
  'Happiness',
  'Science',
  'Art',
  'Nature',
  'Wisdom',
  'Courage',
  'Birthday',
];
const MOODS = [
  'Motivational',
  'Humorous',
  'Thoughtful',
  'Romantic',
  'Philosophical',
  'Reflective',
  'Uplifting',
  'Celebratory',
];
const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Bengali',
  'Chinese',
  'Japanese',
  'Russian',
  'Arabic',
];

export default function QuoteGeneratorTool() {
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('');
  const [author, setAuthor] = useState('');
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [birthDate, setBirthDate] = useState('');
  const [count, setCount] = useState(5);
  const [language, setLanguage] = useState('English');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [famousPeople, setFamousPeople] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Author suggestions logic
  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAuthor(value);
    if (value.length > 0) {
      setAuthorSuggestions(
        AUTHOR_SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setAuthorSuggestions([]);
    }
  };
  const handleAuthorSuggestionClick = (suggestion: string) => {
    setAuthor(suggestion);
    setAuthorSuggestions([]);
  };

  const totalPages = Math.ceil(quotes.length / pageSize);
  const paginatedQuotes = quotes.slice((page - 1) * pageSize, page * pageSize);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setQuotes([]);
    setFamousPeople([]);
    setCopiedIdx(null);
    setPage(1); // Reset to first page on new generation
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mood, author, birthDate, count, language })
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      if (data.message) setMessage(data.message);
      setQuotes(data.quotes || []);
      setFamousPeople(data.famousPeople || []);
      fetch('/api/tools/quote-generator/track-usage', { method: 'POST' });
    } catch (e) {
      setError('Failed to generate quotes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (quote: string, author: string, idx: number) => {
    navigator.clipboard.writeText(`"${quote}" — ${author}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleDownload = async (idx: number) => {
    const content = document.getElementById(`quote-content-${idx}`);
    if (!content) return;
    const canvas = await html2canvas(content, { backgroundColor: null });
    const link = document.createElement('a');
    link.download = 'quote.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <section className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 font-sans">
            AI Quote Generator
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto font-sans">
            Instantly generate beautiful, authentic, and shareable quotes for any topic, mood, or language. Download or copy your favorites!
          </p>
        </div>
        {/* Controls Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mb-10">
          <form
            onSubmit={e => { e.preventDefault(); handleGenerate(); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-sans">Topic</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans text-base"
              >
                <option value="">Select topic</option>
                {TOPICS.map(t => <option key={t} value={t.toLowerCase()}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-sans">Mood</label>
              <select
                value={mood}
                onChange={e => setMood(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans text-base"
              >
                <option value="">Select mood</option>
                {MOODS.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-sans">Author Style</label>
              <input
                type="text"
                value={author}
                onChange={handleAuthorChange}
                placeholder="e.g. Rabindranath Tagore, Scientists, My Dad"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans text-base"
                autoComplete="off"
              />
              {authorSuggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded shadow mt-1 max-h-40 overflow-y-auto">
                  {authorSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                      onClick={() => handleAuthorSuggestionClick(s)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-sans">Birthday (optional)</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-sans">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans text-base"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col items-center mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-sans">Number of Quotes: {count}</label>
              <input
                type="range"
                min={5}
                max={20}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-2/3"
              />
            </div>
            <div className="md:col-span-2 text-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Generating...' : 'Generate Quotes'}
              </button>
              {error && <div className="text-red-500 mt-2 text-sm font-medium font-sans">{error}</div>}
              {message && <div className="text-green-600 mt-2 text-sm font-medium font-sans">{message}</div>}
            </div>
          </form>
        </div>
        {/* Results */}
        {quotes.length > 0 && (
          <div className="mt-10 flex flex-col gap-6 items-center">
            {paginatedQuotes.map((q, idx) => (
              <div
                key={idx + (page - 1) * pageSize}
                id={`quote-card-${idx + (page - 1) * pageSize}`}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md p-8 relative"
              >
                {/* Downloadable content only */}
                <div id={`quote-content-${idx + (page - 1) * pageSize}`} className="w-full bg-white dark:bg-gray-800 rounded-2xl p-0 relative min-h-[120px] flex flex-col items-center justify-center">
                  {/* Watermark quote mark */}
                  <span className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl text-gray-200 dark:text-gray-700 font-serif z-0 pointer-events-none opacity-70">
                    &ldquo;
                  </span>
                  <blockquote
                    className="text-2xl md:text-3xl italic font-normal leading-snug text-gray-800 dark:text-gray-200"
                  >
                    {q.quote}
                  </blockquote>
                  <div
                    className="font-bold text-lg tracking-wide text-gray-700 dark:text-gray-300"
                  >
                    — {q.author || author || 'Unknown'}
                  </div>
                </div>
                {/* Buttons (not included in download) */}
                <div className="flex gap-3 mt-6 z-10">
                  <button
                    onClick={() => handleCopy(q.quote, q.author || author || 'Unknown', idx + (page - 1) * pageSize)}
                    className="px-4 py-2 rounded-lg shadow-sm text-sm font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                  >
                    {copiedIdx === idx + (page - 1) * pageSize ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => handleDownload(idx + (page - 1) * pageSize)}
                    className="px-4 py-2 rounded-lg shadow-sm text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-2 rounded-lg border ${i + 1 === page ? 'border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        {famousPeople.length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-6 text-center max-w-md mx-auto mt-10">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2 font-sans">Famous people born on this day:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {famousPeople.map((person, idx) => (
                <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-sans">
                  {person}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-10 text-gray-600 dark:text-gray-400 text-sm text-center font-sans">
          {topic && <span>Topic: <span className="font-semibold">{topic}</span> </span>}
          {mood && <span>Mood: <span className="font-semibold">{mood}</span> </span>}
          {author && <span>Author: <span className="font-semibold">{author}</span> </span>}
          {language && <span>Language: <span className="font-semibold">{language}</span> </span>}
          {birthDate && <span>Birthday: <span className="font-semibold">{birthDate}</span></span>}
        </div>
      </div>
    </section>
  );
} 