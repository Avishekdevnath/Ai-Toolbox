/** @jest-environment node */

import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

const mockStoreUploadedResumeFile = jest.fn();
const mockStoreAnalysisInDB = jest.fn();
const mockGetStoredAnalysis = jest.fn();
const mockAnalyzeResumeFileWithOpenAI = jest.fn();

jest.mock('@/lib/enhancedResumeUtils', () => ({
  __esModule: true,
  storeUploadedResumeFile: (...args: unknown[]) => mockStoreUploadedResumeFile(...args),
  storeAnalysisInDB: (...args: unknown[]) => mockStoreAnalysisInDB(...args),
  getStoredAnalysis: (...args: unknown[]) => mockGetStoredAnalysis(...args),
}));

jest.mock('@/lib/openaiResumeService', () => ({
  __esModule: true,
  analyzeResumeFileWithOpenAI: (...args: unknown[]) => mockAnalyzeResumeFileWithOpenAI(...args),
}));

import { POST } from '../route';

const sampleAnalysis = {
  overallScore: 84,
  scoreBreakdown: {
    content: 21,
    structure: 21,
    keywords: 21,
    atsOptimization: 21,
  },
  strengths: ['Readable structure'],
  weaknesses: ['Needs more role-specific keywords'],
  suggestions: [],
  sectionAnalysis: [],
  keywordAnalysis: {
    foundKeywords: ['React'],
    missingKeywords: ['Node.js'],
    suggestedKeywords: ['Node.js'],
    keywordDensity: {},
  },
  atsOptimization: {
    score: 82,
    issues: [],
    recommendations: [],
    formatCompliance: {
      isCompliant: true,
      issues: [],
    },
  },
  actionPlan: [],
  summary: 'Good starting point with room to improve alignment.',
};

function createFormRequest(formData: FormData) {
  return new NextRequest('http://localhost:3000/api/resume/enhanced', {
    method: 'POST',
    body: formData,
  });
}

describe('POST /api/resume/enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('analyzes uploaded resumes with OpenAI and stores the upload metadata', async () => {
    const resumeId = new ObjectId();
    const analysisId = new ObjectId();
    mockAnalyzeResumeFileWithOpenAI.mockResolvedValue(sampleAnalysis);
    mockStoreUploadedResumeFile.mockResolvedValue({
      resumeId,
      blobPathname: 'resumes/resume-123.pdf',
      blobUrl: 'https://blob.example/resumes/resume-123.pdf',
    });
    mockStoreAnalysisInDB.mockResolvedValue(analysisId);

    const formData = new FormData();
    const file = new File(['pdf-bytes'], 'resume.pdf', {
      type: 'application/pdf',
    });
    formData.set('file', file);
    formData.set('industry', 'technology');
    formData.set('jobTitle', 'Software Engineer');
    formData.set('experienceLevel', 'mid-level');

    const response = await POST(createFormRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.analysis).toEqual(sampleAnalysis);
    expect(mockAnalyzeResumeFileWithOpenAI).toHaveBeenCalledWith(
      file,
      expect.stringContaining('Analyze the uploaded resume file')
    );
    expect(mockStoreUploadedResumeFile).toHaveBeenCalledWith(file);
    expect(mockStoreAnalysisInDB).toHaveBeenCalledWith(
      resumeId,
      sampleAnalysis,
      'technology',
      'Software Engineer',
      'mid-level'
    );
  });

  it('returns a 500 when OpenAI analysis fails', async () => {
    mockAnalyzeResumeFileWithOpenAI.mockRejectedValue(new Error('OpenAI request failed'));

    const formData = new FormData();
    const file = new File(['pdf-bytes'], 'resume.pdf', {
      type: 'application/pdf',
    });
    formData.set('file', file);
    formData.set('industry', 'technology');
    formData.set('jobTitle', 'Software Engineer');
    formData.set('experienceLevel', 'mid-level');

    const response = await POST(createFormRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/OpenAI request failed/i);
    expect(mockStoreUploadedResumeFile).not.toHaveBeenCalled();
    expect(mockStoreAnalysisInDB).not.toHaveBeenCalled();
  });
});
