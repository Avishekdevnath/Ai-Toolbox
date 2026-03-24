import OpenAI, { toFile } from 'openai';
import { z } from 'zod';
import type { ResumeAnalysis } from '@/schemas/resumeSchema';

const resumeAnalysisSchema = z.object({
  overallScore: z.number(),
  scoreBreakdown: z.object({
    content: z.number(),
    structure: z.number(),
    keywords: z.number(),
    atsOptimization: z.number(),
  }),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.object({
    category: z.enum(['content', 'structure', 'keywords', 'format']),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    impact: z.string(),
  })),
  sectionAnalysis: z.array(z.object({
    section: z.string(),
    score: z.number(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggestions: z.array(z.string()),
  })),
  keywordAnalysis: z.object({
    foundKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    suggestedKeywords: z.array(z.string()),
    keywordDensity: z.record(z.string(), z.number()),
  }),
  atsOptimization: z.object({
    score: z.number(),
    issues: z.array(z.string()),
    recommendations: z.array(z.string()),
    formatCompliance: z.object({
      isCompliant: z.boolean(),
      issues: z.array(z.string()),
    }),
  }),
  actionPlan: z.array(z.object({
    priority: z.enum(['high', 'medium', 'low']),
    action: z.string(),
    timeline: z.string(),
    impact: z.string(),
  })),
  summary: z.string(),
});

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}

function getResumeModel(): string {
  return process.env.OPENAI_RESUME_MODEL || process.env.OPENAI_MODEL || 'gpt-5-mini';
}

function parseResumeAnalysis(outputText: string | null | undefined): ResumeAnalysis {
  if (!outputText) {
    throw new Error('OpenAI returned an empty response.');
  }

  const parsed = JSON.parse(outputText);
  return resumeAnalysisSchema.parse(parsed) as ResumeAnalysis;
}

async function createResumeAnalysis(input: string | Array<Record<string, unknown>>): Promise<ResumeAnalysis> {
  const response = await getClient().responses.create({
    model: getResumeModel(),
    input: input as any,
    text: {
      format: {
        type: 'json_object',
      },
      verbosity: 'medium',
    },
  });

  return parseResumeAnalysis(response.output_text);
}

export async function analyzeResumeTextWithOpenAI(prompt: string): Promise<ResumeAnalysis> {
  return createResumeAnalysis(prompt);
}

export async function analyzeResumeFileWithOpenAI(file: File, prompt: string): Promise<ResumeAnalysis> {
  const openAIClient = getClient();
  const uploadedFile = await openAIClient.files.create({
    file: await toFile(Buffer.from(await file.arrayBuffer()), file.name, {
      type: file.type || 'application/octet-stream',
    }),
    purpose: 'user_data',
  });

  try {
    return await createResumeAnalysis([
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: prompt,
          },
          {
            type: 'input_file',
            file_id: uploadedFile.id,
          },
        ],
      },
    ]);
  } finally {
    try {
      await openAIClient.files.delete(uploadedFile.id);
    } catch (error) {
      console.warn('Failed to delete temporary OpenAI file:', error);
    }
  }
}
