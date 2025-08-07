'use client';

import React, { useState, useEffect } from 'react';
import { Search, Clock, Trash2 } from 'lucide-react';

interface SearchHistoryProps {
  onSearchSelect: (query: string) => void;
}

export default function SearchHistory({ onSearchSelect }: SearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const addToHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearchSelect = (query: string) => {
    onSearchSelect(query);
    addToHistory(query);
  };

  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Recent Searches
        </h3>
        <button
          onClick={clearHistory}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        {searchHistory.map((query, index) => (
          <button
            key={index}
            onClick={() => handleSearchSelect(query)}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            {query}
          </button>
        ))}
      </div>
    </div>
  );
} 