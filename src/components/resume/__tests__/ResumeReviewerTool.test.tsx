import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeReviewerTool from '../ResumeReviewerTool';

const mockJsPdfText = jest.fn();
const mockJsPdfSave = jest.fn();
const mockJsPdfAddPage = jest.fn();
const mockJsPdfSplitTextToSize = jest.fn((text: string) => [text]);

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setDrawColor: jest.fn(),
    line: jest.fn(),
    text: mockJsPdfText,
    splitTextToSize: mockJsPdfSplitTextToSize,
    addPage: mockJsPdfAddPage,
    save: mockJsPdfSave,
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
  })),
}));

const successAnalysis = {
  overallScore: 82,
  scoreBreakdown: {
    content: 20,
    structure: 20,
    keywords: 21,
    atsOptimization: 21,
  },
  strengths: ['Strong impact statements'],
  weaknesses: ['Missing metrics in some bullets'],
  suggestions: [
    {
      category: 'content' as const,
      title: 'Add metrics',
      description: 'Quantify achievements where possible.',
      priority: 'high' as const,
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
    score: 80,
    issues: [],
    recommendations: [],
    formatCompliance: {
      isCompliant: true,
      issues: [],
    },
  },
  actionPlan: [
    {
      priority: 'high' as const,
      action: 'Add measurable results',
      timeline: 'Today',
      impact: 'Clearer outcomes',
    },
  ],
  summary: 'Solid resume with room to strengthen impact.',
};

describe('ResumeReviewerTool', () => {
  let clipboardWriteText: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    mockJsPdfText.mockClear();
    mockJsPdfSave.mockClear();
    mockJsPdfAddPage.mockClear();
    mockJsPdfSplitTextToSize.mockClear();
    mockJsPdfSplitTextToSize.mockImplementation((text: string) => [text]);
    clipboardWriteText = jest.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    });
  });

  it('submits uploaded files to the enhanced resume endpoint', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: successAnalysis,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ResumeReviewerTool />);

    const file = new File(
      ['resume pdf'],
      'resume.pdf',
      { type: 'application/pdf' }
    );

    await user.upload(screen.getByLabelText(/upload resume/i), file);
    await user.selectOptions(screen.getByLabelText(/target industry/i), 'technology');
    await user.type(screen.getByLabelText(/target job title/i), 'Software Engineer');
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'mid-level');
    await user.click(screen.getByRole('button', { name: /analyze resume/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/resume/enhanced');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('file')).toBe(file);
    expect(options.body.get('industry')).toBe('technology');
    expect(options.body.get('jobTitle')).toBe('Software Engineer');
    expect(options.body.get('experienceLevel')).toBe('mid-level');
  });

  it('keeps the text-only flow on the existing resume endpoint', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: successAnalysis,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ResumeReviewerTool />);

    await user.type(
      screen.getByLabelText(/or paste resume text/i),
      'Contact\nExperience\nBuilt React applications and improved page performance by 35 percent for enterprise clients.'
    );
    await user.selectOptions(screen.getByLabelText(/target industry/i), 'technology');
    await user.type(screen.getByLabelText(/target job title/i), 'Frontend Engineer');
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'mid-level');
    await user.click(screen.getByRole('button', { name: /analyze resume/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('/api/resume');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(options.body)).toMatchObject({
      resumeText: expect.stringContaining('Built React applications'),
      industry: 'technology',
      jobTitle: 'Frontend Engineer',
      experienceLevel: 'mid-level',
    });
  });

  it('shows the recruiter-style intake state and lets users start a new analysis after results', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: successAnalysis,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ResumeReviewerTool />);

    expect(screen.getByText(/review your resume like a recruiter/i)).toBeInTheDocument();
    expect(screen.getByText(/candidate brief/i)).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/or paste resume text/i),
      'Contact\nExperience\nBuilt React applications and improved page performance by 35 percent for enterprise clients.'
    );
    await user.selectOptions(screen.getByLabelText(/target industry/i), 'technology');
    await user.type(screen.getByLabelText(/target job title/i), 'Frontend Engineer');
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'mid-level');
    await user.click(screen.getByRole('button', { name: /analyze resume/i }));

    expect(await screen.findByRole('button', { name: /new analysis/i })).toBeInTheDocument();
    expect(screen.getByText(/evaluation summary/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new analysis/i }));

    expect(screen.getByText(/review your resume like a recruiter/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new analysis/i })).not.toBeInTheDocument();
  });

  it('copies the richer recruiter report content instead of a reduced text export', async () => {
    const user = userEvent.setup();
    clipboardWriteText = jest.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: successAnalysis,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ResumeReviewerTool />);

    await user.type(
      screen.getByLabelText(/or paste resume text/i),
      'Contact\nExperience\nBuilt React applications and improved page performance by 35 percent for enterprise clients.'
    );
    await user.selectOptions(screen.getByLabelText(/target industry/i), 'technology');
    await user.type(screen.getByLabelText(/target job title/i), 'Frontend Engineer');
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'mid-level');
    await user.click(screen.getByRole('button', { name: /analyze resume/i }));

    await screen.findByRole('button', { name: /copy report/i });
    await user.click(screen.getByRole('button', { name: /copy report/i }));

    expect(clipboardWriteText).toHaveBeenCalledWith(
      expect.stringContaining('KEYWORD SNAPSHOT:')
    );
    expect(clipboardWriteText).toHaveBeenCalledWith(
      expect.stringContaining('TARGET JOB TITLE: Frontend Engineer')
    );
    expect(clipboardWriteText).toHaveBeenCalledWith(
      expect.stringContaining('IMPACT: Improves credibility')
    );
    expect(clipboardWriteText).toHaveBeenCalledWith(
      expect.stringContaining('RECRUITER VERDICT:')
    );
  });

  it('downloads the full recruiter report as a pdf', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analysis: successAnalysis,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ResumeReviewerTool />);

    await user.type(
      screen.getByLabelText(/or paste resume text/i),
      'Contact\nExperience\nBuilt React applications and improved page performance by 35 percent for enterprise clients.'
    );
    await user.selectOptions(screen.getByLabelText(/target industry/i), 'technology');
    await user.type(screen.getByLabelText(/target job title/i), 'Frontend Engineer');
    await user.selectOptions(screen.getByLabelText(/experience level/i), 'mid-level');
    await user.click(screen.getByRole('button', { name: /analyze resume/i }));

    await screen.findByRole('button', { name: /download pdf/i });
    await user.click(screen.getByRole('button', { name: /download pdf/i }));

    expect(mockJsPdfSave).toHaveBeenCalledWith('resume-analysis-report.pdf');

    const renderedPdfText = mockJsPdfText.mock.calls
      .flatMap(([content]) => (Array.isArray(content) ? content : [content]))
      .join('\n');

    expect(renderedPdfText).toContain('KEYWORD SNAPSHOT:');
    expect(renderedPdfText).toContain('TARGET JOB TITLE: Frontend Engineer');
    expect(renderedPdfText).toContain('RECRUITER VERDICT:');
  });
});
