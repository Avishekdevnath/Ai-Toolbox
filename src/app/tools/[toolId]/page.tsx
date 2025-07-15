'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import ToolSidebar from '@/components/ToolSidebar';

// Import individual tool components
import SwotAnalysisTool from '@/components/tools/SwotAnalysisTool';
import FinanceAdvisorTool from '@/components/tools/finance';
import DietPlannerTool from '@/components/tools/DietPlannerTool';
import QRGeneratorTool from '@/components/tools/QRGeneratorTool';
import PasswordGeneratorTool from '@/components/tools/PasswordGeneratorTool';
import TipCalculatorTool from '@/components/tools/TipCalculatorTool';
import WordCounterTool from '@/components/tools/WordCounterTool';
import UnitConverterTool from '@/components/tools/UnitConverterTool';
import AgeCalculatorTool from '@/components/tools/AgeCalculatorTool';
import URLShortenerTool from '@/components/tools/URLShortenerTool';
import ProductPriceTrackerTool from '@/components/tools/ProductPriceTrackerTool';
import QuoteGeneratorTool from '@/components/tools/QuoteGeneratorTool';
import ResumeReviewerTool from '@/components/resume/ResumeReviewerTool';
import MockInterviewerTool from '@/components/interview/MockInterviewerTool';
import JobInterviewerTool from '@/components/interview/JobInterviewerTool';

// Tool metadata
const toolsData = {
  'swot-analysis': {
    name: 'SWOT Analysis Tool',
    description: 'Generate comprehensive SWOT analysis based on your input',
    icon: '📊',
    component: SwotAnalysisTool
  },
  'finance-advisor': {
    name: 'Finance Advisor',
    description: 'Personal finance management and forecasting',
    icon: '💰',
    component: FinanceAdvisorTool
  },
  'diet-planner': {
    name: 'Diet Planner',
    description: 'AI-driven meal planning and nutrition recommendations',
    icon: '🥗',
    component: DietPlannerTool
  },
  'qr-generator': {
    name: 'QR Code Generator',
    description: 'Generate QR codes for any text or URL',
    icon: '📱',
    component: QRGeneratorTool
  },
  'password-generator': {
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    icon: '🔐',
    component: PasswordGeneratorTool
  },
  'tip-calculator': {
    name: 'Tip & Split Calculator',
    description: 'Calculate tips and split bills',
    icon: '🧮',
    component: TipCalculatorTool
  },
  'word-counter': {
    name: 'Word Counter',
    description: 'Count words with readability score',
    icon: '📊',
    component: WordCounterTool
  },
  'unit-converter': {
    name: 'Unit Converter',
    description: 'Convert between different units',
    icon: '⚖️',
    component: UnitConverterTool
  },
  'age-calculator': {
    name: 'Age Calculator',
    description: 'Calculate age and important dates',
    icon: '📅',
    component: AgeCalculatorTool
  },
  'url-shortener': {
    name: 'URL Shortener',
    description: 'Shorten URLs with custom aliases',
    icon: '🔗',
    component: URLShortenerTool
  },
  'price-tracker': {
    name: 'Product Price Tracker',
    description: 'Track product prices and history with AI',
    icon: '💲',
    component: ProductPriceTrackerTool
  },
  'quote-generator': {
    name: 'Quote Generator',
    description: 'Generate inspiring quotes with AI',
    icon: '💭',
    component: QuoteGeneratorTool
  },
  'resume-reviewer': {
    name: 'Resume Reviewer',
    description: 'AI-powered resume analysis and optimization',
    icon: '📄',
    component: ResumeReviewerTool
  },
  'mock-interviewer': {
    name: 'Mock Interviewer',
    description: 'AI-powered interview practice with real-time evaluation',
    icon: '🎤',
    component: MockInterviewerTool
  },
  'job-interviewer': {
    name: 'Job-Specific Interviewer',
    description: 'AI-powered interviews based on job postings',
    icon: '💼',
    component: JobInterviewerTool
  }
};

export default function ToolPage() {
  const params = useParams();
  const toolId = params.toolId as string;
  const tool = toolsData[toolId as keyof typeof toolsData];

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Tool Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The tool you're looking for doesn't exist.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  const ToolComponent = tool.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Flex container for sidebar and main content */}
      <div className="flex">
        {/* Sidebar Navigation (fixed, does not affect main content flow) */}
        <div className="hidden lg:block">
          <ToolSidebar />
        </div>
        {/* Main Content */}
        <main className="transition-all duration-300 pb-8 px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-6xl mx-auto mt-16">
          <ToolComponent />
        </main>
      </div>
      {/* Mobile Sidebar */}
      <ToolSidebar />
    </div>
  );
} 