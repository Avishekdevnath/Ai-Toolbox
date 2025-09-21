'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  features: string[];
}

interface SimpleSearchBarProps {
  tools: Tool[];
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

const SimpleSearchBar: React.FC<SimpleSearchBarProps> = ({
  tools,
  onSearch,
  onClear,
  placeholder = "Search tools...",
  className = ""
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            className="ml-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleSearchBar; 