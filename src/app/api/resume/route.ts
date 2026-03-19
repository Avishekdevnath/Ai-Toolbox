import { NextRequest, NextResponse } from 'next/server';
import { analyzeResumeTextWithOpenAI } from '@/lib/openaiResumeService';
import { buildResumeAnalysisPrompt } from '@/lib/resumePromptBuilder';
import { ResumeRequest, ResumeResponse } from '@/schemas/resumeSchema';

export async function POST(request: NextRequest) {
  try {
    const body: ResumeRequest = await request.json();
    const { resumeText, industry, jobTitle, experienceLevel } = body;

    // Validate input
    if (!resumeText || !industry || !jobTitle || !experienceLevel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (resumeText.length > 50000) {
      return NextResponse.json(
        { success: false, error: 'Resume text is too long (max 50,000 characters)' },
        { status: 400 }
      );
    }

    // Build the AI prompt
    const prompt = buildResumeAnalysisPrompt(body);

    const analysis = await analyzeResumeTextWithOpenAI(prompt);

    const result: ResumeResponse = {
      success: true,
      analysis
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 
