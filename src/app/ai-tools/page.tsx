'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { aiTools } from '@/data/tools';
import Header from "@/components/Header";
import NewFooter from "@/components/NewFooter";

const categories = ['All', ...Array.from(new Set(aiTools.map(tool => tool.category)))];

export default function AIToolsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredAiTools = aiTools.filter(tool => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">AI Tools</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Explore our suite of AI-powered tools to boost your productivity, creativity, and decision-making.</p>
          </div>
          <div className="max-w-xl mx-auto mb-8">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for an AI tool..."
              className="w-full px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900'}
                `}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAiTools.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No tools found.</div>
            ) : (
              filteredAiTools.map(tool => (
                <Link key={tool.id} href={tool.href} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow p-6 flex flex-col items-center group border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">{tool.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{tool.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-auto">
                    {tool.features.map((feature, idx) => (
                      <span key={idx} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{feature}</span>
                    ))}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <NewFooter />
    </div>
  );
} 