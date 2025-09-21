'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

interface Tool {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const tools: Tool[] = [
  // AI-Powered Tools
  { id: 'swot-analysis', name: 'SWOT Analysis', icon: '📊', category: 'AI' },
  { id: 'finance-advisor', name: 'Finance Advisor', icon: '💰', category: 'AI' },
  { id: 'diet-planner', name: 'Diet Planner', icon: '🥗', category: 'AI' },
  { id: 'price-tracker', name: 'Price Tracker', icon: '💲', category: 'AI' },
  { id: 'quote-generator', name: 'Quote Generator', icon: '💭', category: 'AI' },
  { id: 'product-price-tracker', name: 'Product Price Tracker', icon: '🛍️', category: 'AI' },
  { id: 'resume-reviewer', name: 'Resume Reviewer', icon: '📄', category: 'AI' },
  { id: 'mock-interviewer', name: 'Mock Interviewer', icon: '🎤', category: 'AI' },
  { id: 'job-interviewer', name: 'Job-Specific Interviewer', icon: '💼', category: 'AI' },
  
  // Utility Tools
  { id: 'password-generator', name: 'Password Generator', icon: '🔐', category: 'Utility' },
  { id: 'qr-generator', name: 'QR Generator', icon: '📱', category: 'Utility' },
  { id: 'tip-calculator', name: 'Tip Calculator', icon: '🧮', category: 'Utility' },
  { id: 'word-counter', name: 'Word Counter', icon: '📊', category: 'Utility' },
  { id: 'unit-converter', name: 'Unit Converter', icon: '⚖️', category: 'Utility' },
  { id: 'age-calculator', name: 'Age Calculator', icon: '📅', category: 'Utility' },
  { id: 'url-shortener', name: 'URL Shortener', icon: '🔗', category: 'Utility' },
];

const categories = [
  { name: 'AI Tools', icon: '🤖', key: 'AI' },
  { name: 'Utility Tools', icon: '🔧', key: 'Utility' },
];

export default function ToolSidebar() {
  const params = useParams();
  const currentToolId = params.toolId as string;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filtered tools by search
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group tools by category
  const grouped = categories.map(cat => ({
    ...cat,
    tools: filteredTools.filter(tool => tool.category === cat.key)
  }));

  // Sidebar content (shared for desktop and mobile)
  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Tool Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {grouped.map(cat => (
          <div key={cat.key}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center">
              <span className="mr-2">{cat.icon}</span>{cat.name}
            </h3>
            <div className="space-y-1">
              {cat.tools.length === 0 && (
                <div className="text-gray-400 text-xs italic">No tools found</div>
              )}
              {cat.tools.map(tool => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                    ${currentToolId === tool.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                  `}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="mr-3 text-lg">{tool.icon}</span>
                  <span className="truncate">{tool.name}</span>
                  {currentToolId === tool.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Collapse/Expand Button (desktop only) */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          Collapse Sidebar
        </button>
      </div>
    </div>
  );

  // Desktop sidebar (always rendered, toggle content)
  return (
    <>
      <div className="hidden lg:block sticky top-16 z-40 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700" style={{ width: isCollapsed ? '4rem' : '16rem' }}>
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 space-y-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mb-4"
              title="Expand sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {grouped.map(cat => cat.tools.slice(0, 3).map(tool => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-colors ${
                  currentToolId === tool.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={tool.name}
              >
                {tool.icon}
              </Link>
            )))}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tools..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Tool Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              {grouped.map(cat => (
                <div key={cat.key}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center">
                    <span className="mr-2">{cat.icon}</span>{cat.name}
                  </h3>
                  <div className="space-y-1">
                    {cat.tools.length === 0 && (
                      <div className="text-gray-400 text-xs italic">No tools found</div>
                    )}
                    {cat.tools.map(tool => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group
                          ${currentToolId === tool.id
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                        `}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="mr-3 text-lg">{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                        {currentToolId === tool.id && (
                          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Collapse/Expand Button (desktop only) */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsCollapsed(true)}
                className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Collapse Sidebar
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Mobile Hamburger Button and Drawer (unchanged) */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'block' : 'hidden'}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {sidebarContent}
      </aside>
    </>
  );
} 