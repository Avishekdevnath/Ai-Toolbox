import jsPDF from 'jspdf';
import type { ResumeAnalysis, ResumeRequest } from '@/schemas/resumeSchema';
import { getVerdict } from './shared';

interface ResumeReportExportInput {
  analysis: ResumeAnalysis;
  formData: ResumeRequest;
  fileName: string;
  generatedOn?: string;
}

function getQuickRead(overallScore: number) {
  return overallScore >= 80
    ? 'This resume is close to interview-ready with focused refinements.'
    : 'The profile has value, but the signal is not landing fast enough yet.';
}

export function sanitizePdfText(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/[\u2022\u25CF\u25E6]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizePdfList(items: string[]) {
  return items
    .map((item) => sanitizePdfText(item))
    .filter(Boolean);
}

export function buildResumeReportLines({
  analysis,
  formData,
  fileName,
  generatedOn = new Date().toLocaleDateString(),
}: ResumeReportExportInput) {
  const verdict = getVerdict(analysis.overallScore);
  const sanitizedStrengths = sanitizePdfList(analysis.strengths);
  const sanitizedWeaknesses = sanitizePdfList(analysis.weaknesses);
  const sanitizedFoundKeywords = sanitizePdfList(analysis.keywordAnalysis.foundKeywords);
  const sanitizedMissingKeywords = sanitizePdfList(analysis.keywordAnalysis.missingKeywords);
  const sanitizedSuggestedKeywords = sanitizePdfList(analysis.keywordAnalysis.suggestedKeywords);
  const sanitizedAtsIssues = sanitizePdfList(analysis.atsOptimization.issues);
  const sanitizedAtsRecommendations = sanitizePdfList(analysis.atsOptimization.recommendations);

  return [
    'RESUME ANALYSIS REPORT',
    `Generated on: ${generatedOn}`,
    '',
    'RECRUITER REPORT:',
    `SUMMARY: ${sanitizePdfText(analysis.summary)}`,
    '',
    'TARGET CONTEXT:',
    `- TARGET JOB TITLE: ${sanitizePdfText(formData.jobTitle || 'Not provided')}`,
    `- INDUSTRY: ${sanitizePdfText(formData.industry || 'Not provided')}`,
    `- EXPERIENCE LEVEL: ${sanitizePdfText(formData.experienceLevel || 'Not provided')}`,
    `- RESUME FILE: ${sanitizePdfText(fileName || 'Pasted resume text')}`,
    '',
    `OVERALL SCORE: ${analysis.overallScore}/100`,
    `RECRUITER VERDICT: ${sanitizePdfText(verdict.label)}`,
    `QUICK READ: ${sanitizePdfText(getQuickRead(analysis.overallScore))}`,
    '',
    'SCORE BREAKDOWN:',
    `- Content: ${analysis.scoreBreakdown.content}/25`,
    `- Structure: ${analysis.scoreBreakdown.structure}/25`,
    `- Keywords: ${analysis.scoreBreakdown.keywords}/25`,
    `- ATS Optimization: ${analysis.scoreBreakdown.atsOptimization}/25`,
    '',
    'STRENGTHS:',
    ...(sanitizedStrengths.length > 0 ? sanitizedStrengths.map((item) => `- ${item}`) : ['- None reported']),
    '',
    'HIRING RISKS:',
    ...(sanitizedWeaknesses.length > 0 ? sanitizedWeaknesses.map((item) => `- ${item}`) : ['- None reported']),
    '',
    'RECOMMENDED EDITS:',
    ...analysis.suggestions.flatMap((item) => [
      `- ${sanitizePdfText(item.title)}`,
      `  PRIORITY: ${sanitizePdfText(item.priority)}`,
      `  CATEGORY: ${sanitizePdfText(item.category)}`,
      `  DESCRIPTION: ${sanitizePdfText(item.description)}`,
      `  IMPACT: ${sanitizePdfText(item.impact)}`,
    ]),
    '',
    'ACTION PLAN:',
    ...analysis.actionPlan.flatMap((item) => [
      `- ${sanitizePdfText(item.action)}`,
      `  PRIORITY: ${sanitizePdfText(item.priority)}`,
      `  TIMELINE: ${sanitizePdfText(item.timeline)}`,
      `  IMPACT: ${sanitizePdfText(item.impact)}`,
    ]),
    '',
    'KEYWORD SNAPSHOT:',
    `- FOUND: ${sanitizedFoundKeywords.join(', ') || 'None identified'}`,
    `- MISSING: ${sanitizedMissingKeywords.join(', ') || 'None identified'}`,
    `- SUGGESTED: ${sanitizedSuggestedKeywords.join(', ') || 'None suggested'}`,
    '',
    'ATS SUMMARY:',
    `- SCORE: ${analysis.atsOptimization.score}/100`,
    `- FORMAT COMPLIANT: ${analysis.atsOptimization.formatCompliance.isCompliant ? 'Yes' : 'No'}`,
    '- ISSUES:',
    ...(sanitizedAtsIssues.length > 0 ? sanitizedAtsIssues.map((item) => `  - ${item}`) : ['  - None reported']),
    '- RECOMMENDATIONS:',
    ...(sanitizedAtsRecommendations.length > 0
      ? sanitizedAtsRecommendations.map((item) => `  - ${item}`)
      : ['  - None reported']),
  ];
}

export function buildResumeReportText(input: ResumeReportExportInput) {
  return buildResumeReportLines(input).join('\n');
}

export function downloadResumeReportText(input: ResumeReportExportInput) {
  const blob = new Blob([buildResumeReportText(input)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'resume-analysis-report.txt';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadResumeReportPdf(input: ResumeReportExportInput) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const lines = buildResumeReportLines(input);
  const marginX = 18;
  const topMargin = 20;
  const bottomMargin = 18;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginX * 2;
  let y = topMargin;

  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded <= pageHeight - bottomMargin) {
      return;
    }

    doc.addPage();
    y = topMargin;
  };

  const writeLine = (text: string, options?: { size?: number; style?: 'normal' | 'bold'; indent?: number; gap?: number; color?: [number, number, number] }) => {
    const {
      size = 10.5,
      style = 'normal',
      indent = 0,
      gap = 2,
      color = [15, 23, 42],
    } = options || {};
    const availableWidth = contentWidth - indent;
    const wrappedText = doc.splitTextToSize(text, availableWidth);
    const lineHeight = size * 0.42 + 1.2;
    ensureSpace(wrappedText.length * lineHeight + gap);
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(wrappedText, marginX + indent, y);
    y += wrappedText.length * lineHeight + gap;
  };

  lines.forEach((line) => {
    if (!line.trim()) {
      y += 2;
      return;
    }

    if (line === 'RESUME ANALYSIS REPORT') {
      writeLine(line, { size: 18, style: 'bold', gap: 3, color: [17, 24, 39] });
      doc.setDrawColor(203, 213, 225);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 6;
      return;
    }

    if (/^[A-Z][A-Z /-]+:?$/.test(line) && line.length <= 40) {
      writeLine(line, { size: 12.5, style: 'bold', gap: 1.5, color: [30, 41, 59] });
      return;
    }

    if (line.startsWith('  ')) {
      writeLine(line.trim(), { size: 10, indent: 8, gap: 1.2, color: [71, 85, 105] });
      return;
    }

    if (line.startsWith('- ')) {
      writeLine(line, { size: 10.25, indent: 3, gap: 1.5, color: [15, 23, 42] });
      return;
    }

    writeLine(line, { size: 10.5, gap: 1.8, color: [31, 41, 55] });
  });

  doc.save('resume-analysis-report.pdf');
}
