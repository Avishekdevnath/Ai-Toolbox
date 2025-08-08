import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '@/lib/mongodb';
import { UserAnalysisHistoryModel } from '@/models/UserAnalysisHistoryModel';
import { ToolUsage as ToolUsageModel } from '@/models/ToolUsageModel';
import { createHash } from 'crypto';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { organization, industry, description, includeRecommendations = true } = body;

    // Validate input
    if (!organization || !industry || !description) {
      return NextResponse.json(
        { error: 'Organization, industry, and description are required' },
        { status: 400 }
      );
    }

    // Generate anonymous user ID
    const ipAddress = request.ip || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const userId = createHash('sha256')
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex')
      .substring(0, 16);

    // Track tool usage
    try {
      await ToolUsageModel.create({
        userId: `anon_${userId}`,
        toolSlug: 'swot-analysis',
        toolName: 'SWOT Analysis',
        usageType: 'generate',
        metadata: {
          organization,
          industry,
          includeRecommendations
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking tool usage:', error);
    }

    // Generate SWOT analysis
    const prompt = `
      Please provide a comprehensive SWOT analysis for the following organization:

      Organization: ${organization}
      Industry: ${industry}
      Description: ${description}

      Please structure your response as follows:

      STRENGTHS:
      - [List 5-7 key strengths]

      WEAKNESSES:
      - [List 5-7 key weaknesses]

      OPPORTUNITIES:
      - [List 5-7 key opportunities]

      THREATS:
      - [List 5-7 key threats]

      ${includeRecommendations ? `
      STRATEGIC RECOMMENDATIONS:
      - [Provide 3-5 strategic recommendations based on the SWOT analysis]
      ` : ''}

      Please be specific, actionable, and relevant to the organization's context.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const swotAnalysis = response.text();

    // Parse the SWOT analysis
    const parsedAnalysis = parseSWOTAnalysis(swotAnalysis);

    // Save analysis to history
    try {
      await UserAnalysisHistoryModel.create({
        userId: `anon_${userId}`,
        toolSlug: 'swot-analysis',
        toolName: 'SWOT Analysis',
        analysisType: 'comprehensive',
        parameters: {
          organization,
          industry,
          description,
          includeRecommendations
        },
        result: parsedAnalysis,
        duration: 0, // Will be calculated if needed
        success: true,
        metadata: {
          userAgent,
          ipAddress,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis,
      rawText: swotAnalysis
    });

  } catch (error) {
    console.error('SWOT Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate SWOT analysis' },
      { status: 500 }
    );
  }
}

function parseSWOTAnalysis(text: string) {
  const sections = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    threats: [] as string[],
    recommendations: [] as string[]
  };

  const lines = text.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.toUpperCase().includes('STRENGTHS')) {
      currentSection = 'strengths';
    } else if (trimmedLine.toUpperCase().includes('WEAKNESSES')) {
      currentSection = 'weaknesses';
    } else if (trimmedLine.toUpperCase().includes('OPPORTUNITIES')) {
      currentSection = 'opportunities';
    } else if (trimmedLine.toUpperCase().includes('THREATS')) {
      currentSection = 'threats';
    } else if (trimmedLine.toUpperCase().includes('RECOMMENDATIONS')) {
      currentSection = 'recommendations';
    } else if (trimmedLine.startsWith('-') && currentSection) {
      const content = trimmedLine.substring(1).trim();
      if (content) {
        sections[currentSection as keyof typeof sections].push(content);
      }
    }
  }

  return sections;
} 