import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import {clientPromise } from '@/lib/mongodb';
import { getDatabase } from '@/lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIResponse } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { profile, step } = await request.json();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Calculate total income
    const totalIncome = parseInt(profile.primary_income || '0') + 
                       parseInt(profile.secondary_income || '0') + 
                       parseInt(profile.other_income || '0');

    // Calculate total expenses
    const totalExpenses = parseInt(profile.housing || '0') + 
                          parseInt(profile.transportation || '0') + 
                          parseInt(profile.food || '0') + 
                          parseInt(profile.utilities || '0') + 
                          parseInt(profile.healthcare || '0') + 
                          parseInt(profile.entertainment || '0') + 
                          parseInt(profile.shopping || '0') + 
                          parseInt(profile.other_expenses || '0');

    if (!totalIncome) {
      return NextResponse.json(
        { error: 'Income information is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive financial advice using Google Gemini
    const prompt = `You are a certified financial advisor with 20+ years of experience. Analyze this comprehensive financial profile and provide detailed, personalized advice.

PERSONAL PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Employment: ${profile.employment_status}
- Household Size: ${profile.household_size} people
- Location: ${profile.location || 'Not specified'}
- Country: ${profile.country || 'US'}
- Currency: ${profile.currency || 'USD'}

INCOME ANALYSIS:
- Primary Income: ${profile.primary_income || 0} ${profile.currency || 'USD'} (${profile.income_frequency || 'monthly'})
- Secondary Income: ${profile.secondary_income || 0} ${profile.currency || 'USD'}
- Other Income: ${profile.other_income || 0} ${profile.currency || 'USD'}
- Total Monthly Income: ${totalIncome} ${profile.currency || 'USD'}

EXPENSE BREAKDOWN:
- Housing: ${profile.housing || 0} ${profile.currency || 'USD'}
- Transportation: ${profile.transportation || 0} ${profile.currency || 'USD'}
- Food: ${profile.food || 0} ${profile.currency || 'USD'}
- Utilities: ${profile.utilities || 0} ${profile.currency || 'USD'}
- Healthcare: ${profile.healthcare || 0} ${profile.currency || 'USD'}
- Entertainment: ${profile.entertainment || 0} ${profile.currency || 'USD'}
- Shopping: ${profile.shopping || 0} ${profile.currency || 'USD'}
- Other Expenses: ${profile.other_expenses || 0} ${profile.currency || 'USD'}
- Total Monthly Expenses: ${totalExpenses} ${profile.currency || 'USD'}

FINANCIAL POSITION:
- Current Savings: ${profile.current_savings || 0} ${profile.currency || 'USD'}
- Emergency Fund: ${profile.emergency_fund || 0} ${profile.currency || 'USD'}
- Total Debt: ${profile.debt_total || 0} ${profile.currency || 'USD'}
- Monthly Debt Payment: ${profile.debt_monthly_payment || 0} ${profile.currency || 'USD'}
- Average Debt Interest Rate: ${profile.debt_interest_rate || 0}%

GOALS & PREFERENCES:
- Short-term Goals: ${profile.short_term_goals || 'Not specified'}
- Medium-term Goals: ${profile.medium_term_goals || 'Not specified'}
- Long-term Goals: ${profile.long_term_goals || 'Not specified'}
- Priority Goal: ${profile.priority_goal || 'Not specified'}
- Risk Tolerance: ${profile.risk_tolerance || 'Moderate'}

Provide a comprehensive analysis in JSON format:
{
  "healthScore": number (0-100),
  "healthLevel": "Excellent/Good/Fair/Poor",
  "healthSummary": "Brief summary of financial health",
  "insights": [
    "Key insight about their financial situation",
    "Important observation about spending patterns",
    "Notable strength or concern"
  ],
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "priority": "high/medium/low"
    }
  ],
  "budgetBreakdown": {
    "housing": number,
    "transportation": number,
    "food": number,
    "savings": number,
    "debt_payment": number,
    "entertainment": number,
    "other": number
  },
  "actionPlan": [
    "Specific action to take in next 30 days",
    "Action for next 60 days",
    "Action for next 90 days"
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
    const financeAnalysis = parseAIResponse(cleanResponse);

    // Save to MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection('finance-consultations');

      await collection.insertOne({
        profile: profile,
        financialSummary: { 
          totalIncome, 
          totalExpenses, 
          monthlySurplus: totalIncome - totalExpenses 
        },
        analysis: financeAnalysis,
        createdAt: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return NextResponse.json({
      success: true,
      analysis: financeAnalysis
    });

  } catch (error) {
    console.error('Finance Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'AI service temporarily unavailable'
    }, { status: 500 });
  }
} 