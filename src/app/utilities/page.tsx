'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

const utilityTools = [
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Shorten URLs with custom aliases and analytics',
    icon: '🔗',
    category: 'Utility',
    href: '/tools/url-shortener',
    features: ['Custom aliases', 'Click tracking', 'QR codes']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for any text or URL',
    icon: '📱',
    category: 'Utility',
    href: '/tools/qr-generator',
    features: ['Custom styling', 'Multiple formats', 'Download options']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    icon: '🔐',
    category: 'Security',
    href: '/tools/password-generator',
    features: ['Multiple options', 'Strength meter', 'Copy to clipboard']
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills with AI suggestions',
    icon: '🧮',
    category: 'Finance',
    href: '/tools/tip-calculator',
    features: ['AI suggestions', 'Bill splitting', 'Tax calculations']
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words with detailed analysis',
    icon: '📊',
    category: 'Writing',
    href: '/tools/word-counter',
    features: ['Detailed analysis', 'Readability score', 'Character count']
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units with live currency',
    icon: '⚖️',
    category: 'Utility',
    href: '/tools/unit-converter',
    features: ['Live currency', 'Multiple units', 'Real-time rates']
  }
];

export default function UtilitiesPage() {
  const [search, setSearch] = useState('');
  const filteredUtilityTools = utilityTools.filter(tool => tool.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Utilities</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Discover our collection of practical utility tools to simplify your daily tasks and boost efficiency.</p>
        </div>
        <div className="max-w-xl mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a utility tool..."
            className="w-full px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUtilityTools.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No tools found.</div>
          ) : (
            filteredUtilityTools.map(tool => (
              <Link key={tool.id} href={tool.href} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow p-6 flex flex-col items-center group border border-gray-100 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">{tool.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{tool.description}</p>
                <div className="flex flex-wrap gap-2 justify-center mt-auto">
                  {tool.features.map((feature, idx) => (
                    <span key={idx} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm">{feature}</span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 