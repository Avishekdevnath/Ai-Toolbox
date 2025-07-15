'use client';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

const aiTools = [
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis Tool',
    description: 'Generate comprehensive SWOT analysis based on your input',
    icon: '📊',
    category: 'Business',
    href: '/tools/swot-analysis',
    features: ['AI-powered analysis', 'Comprehensive reports', 'Export options']
  },
  {
    id: 'finance-advisor',
    name: 'Finance Tools',
    description: 'Comprehensive financial planning and analysis',
    icon: '💰',
    category: 'Finance',
    href: '/tools/finance-advisor',
    features: ['8 modules', 'AI insights', 'Retirement planning']
  },
  {
    id: 'diet-planner',
    name: 'Diet Planner',
    description: 'AI-driven meal planning and nutrition recommendations',
    icon: '🥗',
    category: 'Health',
    href: '/tools/diet-planner',
    features: ['AI meal plans', 'Nutrition analysis', 'Dietary restrictions']
  },
  {
    id: 'price-tracker',
    name: 'Product Price Tracker',
    description: 'Track prices of products across websites',
    icon: '🛍️',
    category: 'Shopping',
    href: '/tools/price-tracker',
    features: ['AI pricing', 'Price history', 'Alerts']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Comprehensive age analysis with life milestones',
    icon: '📅',
    category: 'Health',
    href: '/tools/age-calculator',
    features: ['Life milestones', 'Health recommendations', 'AI insights']
  },
  {
    id: 'quote-generator',
    name: 'Quote Generator',
    description: 'Generate AI-powered quotes and inspiration',
    icon: '💭',
    category: 'Entertainment',
    href: '/tools/quote-generator',
    features: ['Topic-based', 'Mood selection', 'AI generation']
  },
  {
    id: 'resume-reviewer',
    name: 'Resume Reviewer',
    description: 'AI-powered resume analysis and optimization',
    icon: '📄',
    category: 'Career',
    href: '/tools/resume-reviewer',
    features: ['ATS optimization', 'Industry analysis', 'Actionable feedback']
  },
  {
    id: 'mock-interviewer',
    name: 'Mock Interviewer',
    description: 'Role-based interview practice with real market data and evaluation',
    icon: '🎤',
    category: 'Career',
    href: '/tools/mock-interviewer',
    features: ['Role-based questions', 'Real market data', 'Experience level matching']
  },
  {
    id: 'job-interviewer',
    name: 'Job-Specific Interviewer',
    description: 'Targeted interviews based on job postings and requirements',
    icon: '💼',
    category: 'Career',
    href: '/tools/job-interviewer',
    features: ['Job posting analysis', 'Role-based questions', 'Job fit scoring']
  }
];

export default function AIToolsPage() {
  const [search, setSearch] = useState('');
  const filteredAiTools = aiTools.filter(tool => tool.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12">
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
    </div>
  );
} 