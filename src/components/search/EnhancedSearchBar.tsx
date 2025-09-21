'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  features: string[];
  status?: string;
}

interface EnhancedSearchBarProps {
  tools: Tool[];
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

interface FilterOptions {
  category: string;
  status: string;
  searchQuery: string;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  tools,
  onSearch,
  onFilter,
  onClear,
  placeholder = "Search AI tools...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    status: '',
    searchQuery: ''
  });

  // Get unique categories and statuses from tools
  const categories = Array.from(new Set(tools.map(tool => tool.category))).sort();
  const statuses = Array.from(new Set(tools.map(tool => tool.status).filter(Boolean))).sort();

  const handleSearch = () => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onSearch(query);
    onFilter(newFilters);
  };

  const handleClear = () => {
    setQuery('');
    const clearedFilters = { category: '', status: '', searchQuery: '' };
    setFilters(clearedFilters);
    onClear();
    onFilter(clearedFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = filters.category || filters.status || query;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
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
          className="block w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {filters.category && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full">
                {filters.category}
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-xs rounded-full">
                {filters.status}
              </span>
            )}
            <button
              onClick={handleClear}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !filters.status
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Tools
              </button>
              <button
                onClick={() => handleStatusChange('Coming Soon')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.status === 'Coming Soon'
                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Coming Soon
              </button>
              <button
                onClick={() => handleStatusChange('')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !filters.status && filters.category === ''
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Available Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;
