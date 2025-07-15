'use client';

import { useState } from 'react';
import { Search, TrendingUp, Link, Sparkles } from 'lucide-react';

interface PriceSearchFormProps {
  onSearch: (input: string) => void;
  loading: boolean;
  error: string;
}

const SEARCH_EXAMPLES = [
  'iPhone 15 Pro Max',
  'Samsung Galaxy S24 Ultra',
  'MacBook Pro 14-inch',
  'Sony WH-1000XM5',
  'Nintendo Switch OLED',
  'https://amazon.com/dp/B0CM5J8X9P'
];

const POPULAR_SEARCHES = [
  'iPhone 15', 'MacBook Air', 'AirPods Pro', 'iPad Pro',
  'Samsung TV', 'PlayStation 5', 'Xbox Series X', 'Nike Shoes'
];

export default function PriceSearchForm({ onSearch, loading, error }: PriceSearchFormProps) {
  const [input, setInput] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSearch(input.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    onSearch(example);
  };

  const handlePopularClick = (search: string) => {
    setInput(search);
    onSearch(search);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Smart Price Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Track prices across 20+ retailers and find the best deals
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus-within:border-blue-500 transition-colors">
            <div className="pl-4 pr-3">
              {input.startsWith('http') ? (
                <Link className="w-5 h-5 text-gray-400" />
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter product name or paste a product URL..."
              className="flex-1 bg-transparent py-4 px-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="mr-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Track Prices
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </form>

      {/* Search Examples */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Try these examples:
          </h3>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {showExamples ? 'Show less' : 'Show more'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(showExamples ? SEARCH_EXAMPLES : SEARCH_EXAMPLES.slice(0, 3)).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={loading}
              className="p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              {example.startsWith('http') ? (
                <div className="flex items-center gap-2">
                  <Link className="w-3 h-3" />
                  <span className="truncate">Product URL</span>
                </div>
              ) : (
                example
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Searches */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Popular searches:
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((search, index) => (
            <button
              key={index}
              onClick={() => handlePopularClick(search)}
              disabled={loading}
              className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">20+ Sources</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare prices across major retailers
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Powered</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Smart product detection and pricing
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Direct Links</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Go directly to product pages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 