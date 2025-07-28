import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/lib/gemini';
import { parseAIResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { monthlyExpenses, income, currentSavings, riskFactors } = body;

    const prompt = `
    Analyze the following emergency fund needs and provide comprehensive recommendations:

    Monthly Expenses: ${JSON.stringify(monthlyExpenses)}
    Income: ${JSON.stringify(income)}
    Current Savings: ${JSON.stringify(currentSavings)}
    Risk Factors: ${JSON.stringify(riskFactors)}

    Please provide a detailed emergency fund analysis including:
    1. Recommended emergency fund amount
    2. Savings strategy and timeline
    3. Risk assessment and priority recommendations
    4. Fund allocation and management strategies

    Return the response as valid JSON with the following structure:
    {
      "emergencyFundAnalysis": {
        "recommendedAmount": { "minimum": "", "target": "", "optimal": "" },
        "currentStatus": { "amount": "", "percentage": "", "status": "" },
        "savingsPlan": { "monthlyContribution": "", "timeline": "", "strategies": [] }
      },
      "riskAssessment": { "riskLevel": "", "factors": [], "recommendations": [] },
      "fundingStrategies": { "immediate": [], "shortTerm": [], "longTerm": [] },
      "management": { "allocation": {}, "accessibility": "", "maintenance": [] }
    }
    `;

    const aiResponse = await generateGeminiResponse(prompt);
    const analysis = parseAIResponse(aiResponse);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('Emergency fund analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze emergency fund needs' },
      { status: 500 }
    );
  }
} 