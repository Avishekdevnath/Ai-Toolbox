'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import useToolTracking from '@/hooks/useToolTracking';

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
    icon: 'BarChart3',
    component: SwotAnalysisTool
  },
  'finance-advisor': {
    name: 'Finance Advisor',
    description: 'Personal finance management and forecasting',
    icon: 'Wallet',
    component: FinanceAdvisorTool
  },
  'diet-planner': {
    name: 'Diet Planner',
    description: 'AI-driven meal planning and nutrition recommendations',
    icon: 'Apple',
    component: DietPlannerTool
  },
  'qr-generator': {
    name: 'QR Code Generator',
    description: 'Generate QR codes for any text or URL',
    icon: 'QrCode',
    component: QRGeneratorTool
  },
  'password-generator': {
    name: 'Password Generator',
    description: 'Generate secure random passwords',
    icon: 'KeyRound',
    component: PasswordGeneratorTool
  },
  'tip-calculator': {
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills with AI suggestions',
    icon: 'Calculator',
    component: TipCalculatorTool
  },
  'word-counter': {
    name: 'Word Counter',
    description: 'Count words with detailed analysis',
    icon: 'BarChart3',
    component: WordCounterTool
  },
  'unit-converter': {
    name: 'Unit Converter',
    description: 'Convert between different units with live currency',
    icon: 'Scale',
    component: UnitConverterTool
  },
  'age-calculator': {
    name: 'Age Calculator',
    description: 'Calculate age and important dates',
    icon: 'Calendar',
    component: AgeCalculatorTool
  },
  'url-shortener': {
    name: 'URL Shortener',
    description: 'Shorten URLs with custom aliases and analytics',
    icon: 'Link',
    component: URLShortenerTool
  },
  'price-tracker': {
    name: 'Product Price Tracker',
    description: 'Track product prices and history with AI',
    icon: 'ShoppingBag',
    component: ProductPriceTrackerTool
  },
  'quote-generator': {
    name: 'Quote Generator',
    description: 'Generate inspiring quotes with AI',
    icon: 'Quote',
    component: QuoteGeneratorTool
  },
  'resume-reviewer': {
    name: 'Resume Reviewer',
    description: 'AI-powered resume analysis and optimization',
    icon: 'FileSearch',
    component: ResumeReviewerTool
  },
  'mock-interviewer': {
    name: 'Mock Interviewer',
    description: 'AI-powered interview practice with real-time evaluation',
    icon: 'Mic',
    component: MockInterviewerTool
  },
  'job-interviewer': {
    name: 'Job-Specific Interviewer',
    description: 'AI-powered interviews based on job postings',
    icon: 'Briefcase',
    component: JobInterviewerTool
  }
};

export default function ToolPage() {
  const params = useParams();
  const toolId = params.toolId as string;
  const tool = toolsData[toolId as keyof typeof toolsData];

  // Fix hooks violation: always call hooks before any conditional return
  useToolTracking(toolId, tool?.name ?? '', 'view');

  if (!tool) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <Search
              className="mx-auto mb-4"
              size={64}
              color="var(--color-text-secondary)"
            />
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Tool Not Found
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              The tool you're looking for doesn't exist.
            </p>
            <Button asChild variant="primary">
              <Link href="/ai-tools">← Back to Tools</Link>
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const ToolComponent = tool.component;

  return (
    <PageLayout>
      <div className="py-12 px-4 flex justify-center" style={{ background: 'var(--color-background)' }}>
        <div
          className="w-full max-w-3xl rounded-xl p-6 md:p-10"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <ToolComponent />
        </div>
      </div>
    </PageLayout>
  );
}
