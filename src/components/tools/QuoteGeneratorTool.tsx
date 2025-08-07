'use client';

import { useState } from 'react';
import { Quote } from '@/lib/quoteUtils';
import { 
  Sparkles, 
  Copy, 
  Download, 
  Share2, 
  Heart, 
  Calendar, 
  Globe, 
  User, 
  BookOpen, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Quote as QuoteIcon
} from 'lucide-react';

const AUTHOR_SUGGESTIONS = [
  'Rabindranath Tagore', 'Rumi', 'Albert Einstein', 'Marie Curie', 'Isaac Newton',
  'Stephen Hawking', 'Maya Angelou', 'William Shakespeare', 'Khalil Gibran',
  'Oscar Wilde', 'Lao Tzu', 'Mahatma Gandhi', 'Steve Jobs', 'Jim Morrison',
  'Plautus', 'Unknown'
];

const TOPICS = [
  'Love', 'Success', 'Life', 'Friendship', 'Happiness', 'Science', 'Art',
  'Nature', 'Wisdom', 'Courage', 'Birthday', 'Motivation', 'Leadership'
];

const MOODS = [
  'Motivational', 'Humorous', 'Thoughtful', 'Romantic', 'Philosophical',
  'Reflective', 'Uplifting', 'Celebratory', 'Inspirational'
];

const LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Bengali', 'Chinese',
  'Japanese', 'Russian', 'Arabic'
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
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
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
    setPage(1);

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          mood,
          author,
          birthDate,
          count,
          language
        })
      });

      const data = await response.json();

      if (response.ok) {
        setQuotes(data.quotes || []);
        setFamousPeople(data.famousPeople || []);
        setMessage(data.message || '');
        
        // Track usage
        fetch('/api/tools/quote-generator/track-usage', { method: 'POST' }).catch(err => {
          console.error('Usage tracking failed:', err);
        });
      } else {
        setError(data.error || 'Failed to generate quotes');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (quote: string, author: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(`"${quote}" — ${author}`);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async (idx: number) => {
    const quote = quotes[idx];
    if (!quote) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quote text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    const words = quote.quote.split(' ');
    let line = '';
    let y = 150;
    
    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > canvas.width - 100) {
        ctx.fillText(line, canvas.width / 2, y);
        line = word + ' ';
        y += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Author
    ctx.font = 'italic 24px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`— ${quote.author}`, canvas.width / 2, y + 60);

    // Download
    const link = document.createElement('a');
    link.download = `quote-${idx + 1}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async (quote: string, author: string) => {
    const text = `"${quote}" — ${author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Quote from AI Toolbox',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to copy
      await handleCopy(quote, author, -1);
    }
  };

  const toggleFavorite = (idx: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(idx)) {
      newFavorites.delete(idx);
    } else {
      newFavorites.add(idx);
    }
    setFavorites(newFavorites);
  };

  const isFormValid = topic || mood || author || birthDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quote Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover inspiring quotes from famous authors, or create original quotes tailored to your mood and interests
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Generate Quotes
              </h2>

              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Topic
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a topic</option>
                    {TOPICS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a mood</option>
                    {MOODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Author (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={author}
                      onChange={handleAuthorChange}
                      placeholder="Enter author name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {authorSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                        {authorSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAuthorSuggestionClick(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Birth Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Count */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Quotes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1</span>
                    <span className="font-medium">{count}</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!isFormValid || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Quotes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {message && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                <span className="text-blue-700 dark:text-blue-300">{message}</span>
              </div>
            )}

            {/* Famous People */}
            {famousPeople.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-500" />
                  Famous People Born on This Day
                </h3>
                <div className="flex flex-wrap gap-2">
                  {famousPeople.map((person, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quotes */}
            {quotes.length > 0 && (
              <div className="space-y-6">
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="flex items-center px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}

                {/* Quote Cards */}
                <div className="grid gap-6">
                  {paginatedQuotes.map((quote, idx) => {
                    const globalIdx = (page - 1) * pageSize + idx;
                    return (
                      <div
                        key={globalIdx}
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <QuoteIcon className="w-8 h-8 text-blue-500 flex-shrink-0 mr-4 mt-1" />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleFavorite(globalIdx)}
                              className={`p-2 rounded-lg transition-colors ${
                                favorites.has(globalIdx)
                                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${favorites.has(globalIdx) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleCopy(quote.quote, quote.author, globalIdx)}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              {copiedIdx === globalIdx ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <Copy className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDownload(globalIdx)}
                              className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleShare(quote.quote, quote.author)}
                              className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <blockquote className="text-lg text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                          "{quote.quote}"
                        </blockquote>

                        <footer className="text-right">
                          <cite className="text-sm font-medium text-gray-600 dark:text-gray-400 not-italic">
                            — {quote.author}
                          </cite>
                        </footer>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && quotes.length === 0 && (
              <div className="text-center py-12">
                <QuoteIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No quotes generated yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Fill in the form and click "Generate Quotes" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 