import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';
import { parseAIResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personalInfo, currentInsurance, needs, budget } = body;

    const prompt = `
    Analyze the following insurance needs and provide comprehensive recommendations:

    Personal Information: ${JSON.stringify(personalInfo)}
    Current Insurance: ${JSON.stringify(currentInsurance)}
    Insurance Needs: ${JSON.stringify(needs)}
    Budget: ${JSON.stringify(budget)}

    Please provide a detailed insurance analysis including:
    1. Coverage gaps and recommendations
    2. Policy comparisons and cost analysis
    3. Risk assessment and coverage priorities
    4. Budget optimization strategies

    Return the response as valid JSON with the following structure:
    {
      "coverageAnalysis": {
        "healthInsurance": { "recommended": "", "coverage": {}, "cost": "" },
        "lifeInsurance": { "recommended": "", "coverage": {}, "cost": "" },
        "autoInsurance": { "recommended": "", "coverage": {}, "cost": "" },
        "homeInsurance": { "recommended": "", "coverage": {}, "cost": "" },
        "disabilityInsurance": { "recommended": "", "coverage": {}, "cost": "" }
      },
      "riskAssessment": { "highRisk": [], "mediumRisk": [], "lowRisk": [] },
      "recommendations": { "immediate": [], "shortTerm": [], "longTerm": [] },
      "budgetOptimization": { "monthlyCost": "", "savings": "", "strategies": [] }
    }
    `;

    const aiResponse = await generateGeminiResponse(prompt);
    const analysis = parseAIResponse(aiResponse);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('Insurance analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze insurance needs' },
      { status: 500 }
    );
  }
} 