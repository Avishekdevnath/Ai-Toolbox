/** @jest-environment node */

const mockResponsesCreate = jest.fn();
const mockFilesCreate = jest.fn();
const mockFilesDelete = jest.fn();

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      responses: {
        create: (...args: unknown[]) => mockResponsesCreate(...args),
      },
      files: {
        create: (...args: unknown[]) => mockFilesCreate(...args),
        delete: (...args: unknown[]) => mockFilesDelete(...args),
      },
    })),
    toFile: jest.fn(async (value: unknown) => value),
  };
}, { virtual: true });

import {
  analyzeResumeTextWithOpenAI,
  analyzeResumeFileWithOpenAI,
} from '../openaiResumeService';

const sampleAnalysis = {
  overallScore: 86,
  scoreBreakdown: {
    content: 22,
    structure: 21,
    keywords: 21,
    atsOptimization: 22,
  },
  strengths: ['Impactful work history'],
  weaknesses: ['Missing measurable outcomes'],
  suggestions: [
    {
      category: 'content',
      title: 'Add metrics',
      description: 'Quantify key outcomes in experience bullets.',
      priority: 'high',
      impact: 'Improves credibility',
    },
  ],
  sectionAnalysis: [],
  keywordAnalysis: {
    foundKeywords: ['React'],
    missingKeywords: ['TypeScript'],
    suggestedKeywords: ['TypeScript'],
    keywordDensity: {},
  },
  atsOptimization: {
    score: 84,
    issues: [],
    recommendations: [],
    formatCompliance: {
      isCompliant: true,
      issues: [],
    },
  },
  actionPlan: [
    {
      priority: 'high',
      action: 'Add measurable results',
      timeline: 'This week',
      impact: 'Stronger recruiter signal',
    },
  ],
  summary: 'Strong baseline resume with room to improve specificity.',
};

describe('openaiResumeService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      OPENAI_API_KEY: 'test-openai-key',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('requests JSON resume analysis for text prompts', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify(sampleAnalysis),
    });

    const result = await analyzeResumeTextWithOpenAI('Analyze this resume.');

    expect(mockResponsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-mini',
        input: 'Analyze this resume.',
        text: expect.objectContaining({
          verbosity: 'medium',
        }),
      })
    );
    expect(result).toEqual(sampleAnalysis);
  });

  it('uploads a file to OpenAI and deletes it after analysis', async () => {
    mockFilesCreate.mockResolvedValue({ id: 'file-123' });
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify(sampleAnalysis),
    });
    mockFilesDelete.mockResolvedValue({ id: 'file-123', deleted: true });

    const file = new File(['pdf-bytes'], 'resume.pdf', {
      type: 'application/pdf',
    });

    const result = await analyzeResumeFileWithOpenAI(file, 'Analyze this uploaded resume.');

    expect(mockFilesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'user_data',
      })
    );
    expect(mockResponsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5-mini',
        input: [
          expect.objectContaining({
            role: 'user',
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'input_text' }),
              expect.objectContaining({ type: 'input_file', file_id: 'file-123' }),
            ]),
          }),
        ],
      })
    );
    expect(mockFilesDelete).toHaveBeenCalledWith('file-123');
    expect(result).toEqual(sampleAnalysis);
  });
});
