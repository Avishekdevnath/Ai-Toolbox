import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import { buildResumeAnalysisPrompt } from '@/lib/resumePromptBuilder';
import { ResumeRequest, ResumeResponse, ResumeAnalysis } from '@/schemas/resumeSchema';

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

    // Generate analysis using Gemini
    const response = await generateContent(prompt);

    if (!response) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate analysis' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let analysis: ResumeAnalysis;
    try {
      // Extract JSON from the response (handle potential markdown formatting)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse AI analysis. Please try again.' 
        },
        { status: 500 }
      );
    }

    // Validate the analysis structure
    if (!analysis.overallScore || !analysis.strengths || !analysis.weaknesses) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid analysis structure received from AI' 
        },
        { status: 500 }
      );
    }

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