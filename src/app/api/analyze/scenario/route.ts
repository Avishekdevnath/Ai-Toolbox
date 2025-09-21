import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';
import { parseAIResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { financialData, scenarios, timeHorizon } = body;

    const prompt = `
    Analyze the following financial scenarios and provide detailed insights:

    Financial Data: ${JSON.stringify(financialData)}
    Scenarios: ${JSON.stringify(scenarios)}
    Time Horizon: ${timeHorizon} years

    Please provide a comprehensive analysis including:
    1. Scenario comparison and risk assessment
    2. Recommended strategies for each scenario
    3. Contingency planning recommendations
    4. Key metrics and projections

    Return the response as valid JSON with the following structure:
    {
      "scenarioAnalysis": {
        "bestCase": { "description": "", "projections": {}, "recommendations": [] },
        "worstCase": { "description": "", "projections": {}, "recommendations": [] },
        "mostLikely": { "description": "", "projections": {}, "recommendations": [] }
      },
      "riskAssessment": { "overallRisk": "", "keyRisks": [], "mitigationStrategies": [] },
      "recommendations": { "immediate": [], "shortTerm": [], "longTerm": [] },
      "metrics": { "expectedReturn": "", "riskLevel": "", "confidence": "" }
    }
    `;

    const aiResponse = await generateGeminiResponse(prompt);
    const analysis = parseAIResponse(
      typeof aiResponse === 'string' ? aiResponse : (aiResponse?.text ?? '')
    );

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('Scenario analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze scenarios' },
      { status: 500 }
    );
  }
} 