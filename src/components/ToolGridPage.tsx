import React, { useState, useMemo } from 'react';
import Navbar from './Navbar';
import NewFooter from './NewFooter';
import ToolCard from './ToolCard';
import EnhancedSearchBar from './search/EnhancedSearchBar';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  features: string[];
  colorClass?: string;
  status?: string;
}

interface FilterOptions {
  category: string;
  status: string;
  searchQuery: string;
}


interface ToolGridPageProps {
  title: string;
  description: string;
  tools: Tool[];
  userId?: string;
  showSearch?: boolean;
}

const ToolGridPage: React.FC<ToolGridPageProps> = ({ 
  title, 
  description, 
  tools, 
  userId,
  showSearch = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    status: '',
    searchQuery: ''
  });

  // Filter tools based on search query and filters
  const filteredTools = useMemo(() => {
    let filtered = [...tools]; // Start with all tools

    // Apply search query filter only if there's a search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        tool.features.some(feature => feature.toLowerCase().includes(query))
      );
    }

    // Apply category filter only if a category is selected
    if (filters.category && filters.category.trim()) {
      filtered = filtered.filter(tool => tool.category === filters.category);
    }

    // Apply status filter only if a status is selected
    if (filters.status && filters.status.trim()) {
      filtered = filtered.filter(tool => tool.status === filters.status);
    }

    return filtered;
  }, [tools, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ category: '', status: '', searchQuery: '' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {description}
            </p>
          </div>

          {/* Enhanced Search Bar */}
          {showSearch && (
            <div className="mb-8">
              <EnhancedSearchBar
                tools={tools}
                onSearch={handleSearch}
                onFilter={handleFilter}
                onClear={handleClearSearch}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="max-w-4xl mx-auto"
              />
            </div>
          )}

          {/* Search Results Summary */}
          {(searchQuery || filters.category || filters.status) && (
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {filteredTools.length}
                </span> tools
                {searchQuery && ` matching "${searchQuery}"`}
                {filters.category && ` in ${filters.category}`}
                {filters.status && ` with status ${filters.status}`}
              </p>
            </div>
          )}

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                name={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
                features={tool.features}
                colorClass={tool.colorClass}
                userId={userId}
                status={tool.status}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Tools Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {searchQuery 
                  ? `No tools match your search "${searchQuery}". Try adjusting your search terms.`
                  : 'No tools available in this category.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <NewFooter />
    </div>
  );
};

export default ToolGridPage; 