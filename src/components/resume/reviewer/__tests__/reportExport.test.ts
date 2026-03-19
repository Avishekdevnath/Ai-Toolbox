import { buildResumeReportLines, sanitizePdfText } from '../reportExport';

describe('reportExport', () => {
  const analysis = {
    overallScore: 84,
    scoreBreakdown: {
      content: 21,
      structure: 20,
      keywords: 22,
      atsOptimization: 21,
    },
    strengths: ['Strong backend ownership'],
    weaknesses: ['Needs clearer metrics'],
    suggestions: [
      {
        category: 'content' as const,
        title: 'Clarify scope',
        description: 'Add the team size and business context.',
        priority: 'high' as const,
        impact: 'Improves credibility',
      },
    ],
    sectionAnalysis: [],
    keywordAnalysis: {
      foundKeywords: ['Node.js'],
      missingKeywords: ['Observability'],
      suggestedKeywords: ['Grafana'],
      keywordDensity: {},
    },
    atsOptimization: {
      score: 84,
      issues: [
        `Hidden/unicode characters detected (e.g., "deplo${String.fromCharCode(0)}yment", "Positio${String.fromCharCode(8203)}n"), parsers.`,
        `Some role bullets contain smart punctuation — line wraps may split ATS phrases.`,
      ],
      recommendations: [
        `Save a plain-text PDF and DOCX. Replace “smart quotes” and normalize section titles.`,
      ],
      formatCompliance: {
        isCompliant: true,
        issues: [],
      },
    },
    actionPlan: [
      {
        priority: 'high' as const,
        action: 'Fix encoding artifacts',
        timeline: 'Today',
        impact: 'Improves ATS parsing',
      },
    ],
    summary: 'Solid backend profile with some ATS cleanup needed.',
  };

  it('sanitizes unsupported and hidden characters for pdf text', () => {
    const sanitized = sanitizePdfText(`“deplo${String.fromCharCode(0)}yment” — Positio${String.fromCharCode(8203)}n`);

    expect(sanitized).toBe('"deployment" - Position');
  });

  it('renders ats issues and recommendations as separate sanitized bullets', () => {
    const lines = buildResumeReportLines({
      analysis,
      formData: {
        resumeText: 'resume',
        industry: 'technology',
        jobTitle: 'Backend Engineer',
        experienceLevel: 'mid-level',
      },
      fileName: 'resume.pdf',
      generatedOn: '3/19/2026',
    });

    expect(lines).toContain('- ISSUES:');
    expect(lines).toContain('  - Hidden/unicode characters detected (e.g., "deployment", "Position"), parsers.');
    expect(lines).toContain('  - Some role bullets contain smart punctuation - line wraps may split ATS phrases.');
    expect(lines).toContain('- RECOMMENDATIONS:');
    expect(lines).toContain('  - Save a plain-text PDF and DOCX. Replace "smart quotes" and normalize section titles.');
  });
});
