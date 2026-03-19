/** @jest-environment node */

import { NextRequest } from 'next/server';

const mockAnalyzeResumeTextWithOpenAI = jest.fn();

jest.mock('@/lib/openaiResumeService', () => ({
  __esModule: true,
  analyzeResumeTextWithOpenAI: (...args: unknown[]) => mockAnalyzeResumeTextWithOpenAI(...args),
}));

import { POST } from '../route';

const sampleAnalysis = {
  overallScore: 90,
  scoreBreakdown: {
    content: 23,
    structure: 22,
    keywords: 22,
    atsOptimization: 23,
  },
  strengths: ['Clear technical experience'],
  weaknesses: ['Needs more quantified results'],
  suggestions: [],
  sectionAnalysis: [],
  keywordAnalysis: {
    foundKeywords: ['React'],
    missingKeywords: ['Node.js'],
    suggestedKeywords: ['Node.js'],
    keywordDensity: {},
  },
  atsOptimization: {
    score: 88,
    issues: [],
    recommendations: [],
    formatCompliance: {
      isCompliant: true,
      issues: [],
    },
  },
  actionPlan: [],
  summary: 'Good foundation with some missing ATS signals.',
};

function createRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/resume', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses OpenAI for text-based resume analysis', async () => {
    mockAnalyzeResumeTextWithOpenAI.mockResolvedValue(sampleAnalysis);

    const response = await POST(createRequest({
      resumeText: 'Contact\nExperience\nBuilt frontend applications with React and TypeScript.',
      industry: 'technology',
      jobTitle: 'Frontend Engineer',
      experienceLevel: 'mid-level',
    }));

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.analysis).toEqual(sampleAnalysis);
    expect(mockAnalyzeResumeTextWithOpenAI).toHaveBeenCalledWith(
      expect.stringContaining('RESUME CONTENT:')
    );
  });
});
