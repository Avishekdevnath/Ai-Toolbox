import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { clientPromise } from '@/lib/mongodb';
import { getDatabase } from '@/lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIResponse } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { retirementData } = await request.json();

    if (!retirementData) {
      return NextResponse.json(
        { error: 'Retirement data is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive retirement analysis using Google Gemini
    const prompt = `You are a certified retirement planning specialist with 25+ years of experience. Analyze this retirement profile and provide detailed, personalized retirement planning advice.

RETIREMENT PROFILE:
- Current Age: ${retirementData.current_age}
- Desired Retirement Age: ${retirementData.retirement_age}
- Life Expectancy: ${retirementData.life_expectancy}
- Current Annual Income: ${retirementData.current_income}
- Profession: ${retirementData.profession}
- Years of Experience: ${retirementData.years_experience}
- Education Level: ${retirementData.education_level}
- Monthly Side Income: ${retirementData.side_income}

CURRENT SAVINGS & CONTRIBUTIONS:
- Current Retirement Savings: ${retirementData.current_savings}
- Monthly Contribution: ${retirementData.monthly_contribution}
- Employer Match: ${retirementData.employer_match}%

INVESTMENT ASSUMPTIONS:
- Expected Annual Return: ${retirementData.expected_return}%
- Expected Inflation Rate: ${retirementData.inflation_rate}%
- Expected Annual Salary Increase: ${retirementData.salary_increase}%

RETIREMENT INCOME GOALS:
- Desired Annual Retirement Income: ${retirementData.desired_retirement_income}
- Expected Social Security Benefit: ${retirementData.social_security_benefit}
- Expected Pension Income: ${retirementData.pension_income}

Provide a comprehensive retirement analysis in JSON format:
{
  "retirementReadiness": {
    "score": number (0-100),
    "level": "Excellent/Good/Fair/Poor",
    "summary": "Brief assessment of retirement readiness"
  },
  "financialProjection": {
    "yearsToRetirement": number,
    "requiredSavings": number,
    "currentTrajectory": number,
    "gap": number,
    "monthlyRequired": number,
    "incomeGrowthPotential": number
  },
  "professionInsights": {
    "growthPotential": "Analysis of income growth in this profession",
    "sideIncomeOpportunities": "Specific opportunities for additional income",
    "careerAdvice": "Professional development recommendations"
  },
  "investmentStrategy": {
    "portfolioAllocation": {
      "stocks": number,
      "bonds": number,
      "realEstate": number,
      "cash": number
    },
    "riskAssessment": "Risk level assessment based on age and goals",
    "rebalancingSchedule": "Recommended rebalancing frequency"
  },
  "actionPlan": {
    "immediate": [
      "Action to take within 30 days"
    ],
    "shortTerm": [
      "Actions for next 6 months"
    ],
    "longTerm": [
      "Actions for next 5 years"
    ]
  },
  "scenarioAnalysis": {
    "conservative": {
      "description": "Conservative investment approach",
      "projectedSavings": number,
      "risk": "Low"
    },
    "moderate": {
      "description": "Moderate investment approach",
      "projectedSavings": number,
      "risk": "Medium"
    },
    "aggressive": {
      "description": "Aggressive investment approach",
      "projectedSavings": number,
      "risk": "High"
    }
  },
  "keyRecommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "priority": "high/medium/low",
      "impact": "Expected impact on retirement goals"
    }
  ],
  "riskFactors": [
    "Potential risk factor",
    "Mitigation strategy"
  ],
  "summaryMessage": "Motivational summary with specific next steps and encouragement"
}

Return only the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    if (!aiResponse) {
      throw new Error('No response from Google AI');
    }

    // Clean and parse the JSON response (remove markdown formatting)
    const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const retirementAnalysis = parseAIResponse(cleanResponse);

    // Save to MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection('retirement-consultations');

      await collection.insertOne({
        retirementData: retirementData,
        analysis: retirementAnalysis,
        createdAt: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return NextResponse.json({
      success: true,
      analysis: retirementAnalysis
    });

  } catch (error) {
    console.error('Retirement Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'AI service temporarily unavailable'
    }, { status: 500 });
  }
} 