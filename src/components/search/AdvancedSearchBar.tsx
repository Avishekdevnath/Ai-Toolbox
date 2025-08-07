'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, TrendingUp, Clock, Star } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  features: string[];
}

interface SearchSuggestion {
  type: 'tool' | 'category' | 'feature';
  text: string;
  icon?: string;
}

interface AdvancedSearchBarProps {
  tools: Tool[];
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export interface SearchFilters {
  categories: string[];
  features: string[];
  sortBy: 'name' | 'popularity' | 'recent' | 'rating';
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  tools,
  onSearch,
  onClear,
  placeholder = "Search tools, categories, or features...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    features: [],
    sortBy: 'name'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    'AI', 'Finance', 'Career', 'Health', 'Productivity'
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get unique categories and features from tools
  const categories = [...new Set(tools.map(tool => tool.category))];
  const allFeatures = tools.flatMap(tool => tool.features);
  const features = [...new Set(allFeatures)];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const newSuggestions: SearchSuggestion[] = [];

    // Tool name suggestions
    tools
      .filter(tool => 
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .forEach(tool => {
        newSuggestions.push({
          type: 'tool',
          text: tool.name,
          icon: tool.icon
        });
      });

    // Category suggestions
    categories
      .filter(category => 
        category.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 2)
      .forEach(category => {
        newSuggestions.push({
          type: 'category',
          text: category
        });
      });

    // Feature suggestions
    features
      .filter(feature => 
        feature.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 2)
      .forEach(feature => {
        newSuggestions.push({
          type: 'feature',
          text: feature
        });
      });

    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  }, [query, tools, categories, features]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));

      onSearch(searchQuery, filters);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters };
    
    if (filterType === 'categories' || filterType === 'features') {
      const currentValues = newFilters[filterType] as string[];
      const index = currentValues.indexOf(value);
      
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(value);
      }
      
      newFilters[filterType] = currentValues;
    } else {
      newFilters[filterType] = value;
    }
    
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query, newFilters);
    }
  };

  const clearFilters = () => {
    const newFilters = {
      categories: [],
      features: [],
      sortBy: 'name' as const
    };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query, newFilters);
    }
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.features.length > 0 || filters.sortBy !== 'name';

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                onClear();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 p-2 rounded-md transition-colors ${
              hasActiveFilters 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Categories */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categories</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleFilterChange('categories', category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {features.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.features.includes(feature)}
                      onChange={() => handleFilterChange('features', feature)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sort By</h4>
              <div className="space-y-2">
                {[
                  { value: 'name', label: 'Name', icon: 'A-Z' },
                  { value: 'popularity', label: 'Popularity', icon: '🔥' },
                  { value: 'recent', label: 'Recently Used', icon: '🕒' },
                  { value: 'rating', label: 'Rating', icon: '⭐' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={() => handleFilterChange('sortBy', option.value)}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.icon} {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center"
                >
                  <span className="mr-2">{suggestion.icon || '🔍'}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {suggestion.text}
                  </span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {suggestion.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick({ type: 'tool', text: search })}
                  className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Popular Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick({ type: 'category', text: search })}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar; 