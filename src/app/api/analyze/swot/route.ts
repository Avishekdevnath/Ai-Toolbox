import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { model } from '@/lib/gemini';
import { parseAIResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { businessType, description } = await request.json();

    if (!businessType || !description) {
      return NextResponse.json(
        { error: 'Business type and description are required' },
        { status: 400 }
      );
    }

    // Generate SWOT analysis using AI
    const prompt = `Analyze the following business and provide a comprehensive SWOT analysis:

Business Type: ${businessType}
Description: ${description}

Please provide a detailed SWOT analysis in the following JSON format:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Focus on practical, actionable insights.`;

    let analysis;
    
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        try {
          analysis = parseAIResponse(text);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // Use fallback analysis
          analysis = getFallbackAnalysis(businessType, description);
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        // Use fallback analysis
        analysis = getFallbackAnalysis(businessType, description);
      }
    } else {
      // Use fallback analysis if AI is not available
      analysis = getFallbackAnalysis(businessType, description);
    }

    // Store analysis in database
    try {
      const db = await getDatabase();
      await db.collection('swot-analyses').insertOne({
        businessType,
        description,
        analysis,
        createdAt: new Date(),
        ipAddress: request.ip || 'unknown'
      });
    } catch (dbError) {
      console.error('Failed to store analysis:', dbError);
      // Continue without storing
    }

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('SWOT analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function getFallbackAnalysis(businessType: string, description: string) {
  return {
    strengths: [
      "Strong market positioning",
      "Unique value proposition",
      "Experienced team"
    ],
    weaknesses: [
      "Limited resources",
      "Market competition",
      "Operational challenges"
    ],
    opportunities: [
      "Market expansion potential",
      "Technology adoption",
      "Partnership opportunities"
    ],
    threats: [
      "Economic uncertainty",
      "Regulatory changes",
      "Competitive pressure"
    ],
    recommendations: [
      "Focus on core strengths",
      "Develop competitive advantages",
      "Monitor market trends"
    ]
  };
} 