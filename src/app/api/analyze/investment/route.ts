import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { clientPromise } from '@/lib/mongodb';
import { getDatabase } from '@/lib/mongodb';
import { parseAIResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { 
      name, age, income, investment_goal, time_horizon, 
      target_amount, current_investments, monthly_investment,
      risk_tolerance, investment_knowledge, loss_comfort,
      selectedCurrency, country
    } = await request.json();

    // Validate required fields
    if (!name || !age || !income || !investment_goal || !time_horizon || !target_amount) {
      return NextResponse.json(
        { error: 'Required investment data is missing' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert financial advisor specializing in ${country || 'international'} markets. Create a concise, practical investment plan for the following profile.

Client Profile:
- Name: ${name}
- Age: ${age}
- Country: ${country || 'Not specified'}
- Annual Income: ${selectedCurrency?.symbol || '$'}${income}
- Investment Goal: ${investment_goal}
- Time Horizon: ${time_horizon} years
- Target Amount: ${selectedCurrency?.symbol || '$'}${target_amount}
- Current Investments: ${selectedCurrency?.symbol || '$'}${current_investments || '0'}
- Monthly Investment Capacity: ${selectedCurrency?.symbol || '$'}${monthly_investment || '0'}
- Risk Tolerance: ${risk_tolerance || '5'}/10
- Investment Knowledge: ${investment_knowledge || 'Beginner'}

Provide a concise, A4-friendly investment plan with:

1. EXECUTIVE SUMMARY (2-3 sentences):
- Key recommendation and expected outcome

2. PORTFOLIO ALLOCATION (Simple breakdown):
- 4-5 asset classes with percentages
- Brief rationale for each

3. TOP INVESTMENT PICKS (${country || 'International'} specific):
- 3-4 specific stocks/ETFs with ticker symbols
- 2-3 mutual funds or index funds
- 1-2 fixed deposit schemes or bonds
- Include expected returns and timeframes

4. MONTHLY INVESTMENT PLAN:
- How to allocate the ${selectedCurrency?.symbol || '$'}${monthly_investment || '0'} monthly
- Specific amounts to each investment type

5. KEY ACTION STEPS (Next 30 days):
- 5-7 specific, actionable steps
- Include account opening, first investments, etc.

6. RISK MANAGEMENT:
- 3-4 key risks to watch
- 3-4 mitigation strategies

7. MONITORING SCHEDULE:
- When to review and rebalance
- Key performance indicators

Return the response in JSON format:
{
  "executiveSummary": "Brief 2-3 sentence summary",
  "portfolioAllocation": [
    {"asset": "Asset Name", "percentage": 40, "rationale": "Brief reason"}
  ],
  "topPicks": {
    "stocks": [
      {"name": "Stock Name", "ticker": "TICKER", "allocation": "10%", "expectedReturn": "12-15%", "timeframe": "3-5 years", "rationale": "Why this stock"}
    ],
    "funds": [
      {"name": "Fund Name", "type": "ETF/Mutual Fund", "allocation": "20%", "expectedReturn": "8-10%", "timeframe": "5-10 years", "rationale": "Why this fund"}
    ],
    "fixedIncome": [
      {"name": "FD/Bond Name", "type": "Fixed Deposit/Bond", "allocation": "15%", "expectedReturn": "6-8%", "timeframe": "1-3 years", "rationale": "Why this FD"}
    ]
  },
  "monthlyPlan": {
    "totalMonthly": ${monthly_investment || '0'},
    "allocations": [
      {"investment": "Investment Name", "amount": "Amount", "percentage": "Percentage of monthly"}
    ]
  },
  "actionSteps": ["Step 1", "Step 2", "Step 3"],
  "riskManagement": {
    "risks": ["Risk 1", "Risk 2", "Risk 3"],
    "mitigation": ["Strategy 1", "Strategy 2", "Strategy 3"]
  },
  "monitoring": {
    "reviewFrequency": "Monthly/Quarterly",
    "kpis": ["KPI 1", "KPI 2", "KPI 3"],
    "rebalancing": "When to rebalance"
  }
}

Keep it concise, practical, and focused on actionable advice. Return only the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    if (!aiResponse) {
      throw new Error('No response from Google AI');
    }

    // Clean and parse the JSON response (remove markdown formatting)
    const investmentAnalysis = parseAIResponse(aiResponse);

    // Calculate achievability
    // FV = P * [((1 + r)^n - 1) / r]
    const years = Number(time_horizon);
    const monthlyInvestment = Number(monthly_investment) || 0;
    const targetAmount = Number(target_amount) || 0;
    const r = 0.08 / 12; // 8% annual, monthly
    const n = years * 12;
    let achievable = 0;
    if (monthlyInvestment > 0 && years > 0) {
      achievable = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r);
    }
    const percentAchievable = targetAmount > 0 ? Math.min(100, (achievable / targetAmount) * 100) : 0;
    let expectationRealism = 'Realistic';
    if (percentAchievable < 60) expectationRealism = 'Very Ambitious';
    else if (percentAchievable < 90) expectationRealism = 'Ambitious';
    else if (percentAchievable > 110) expectationRealism = 'Conservative';

    investmentAnalysis.expectationRealism = expectationRealism;
    investmentAnalysis.achievabilityPercent = Math.round(percentAchievable);

    // Save to MongoDB
    try {
      const db = await getDatabase();
      const collection = db.collection('investment-analyses');

      const saveData = {
        analysis: investmentAnalysis,
        clientProfile: {
          name,
          age,
          income,
          investment_goal,
          time_horizon,
          target_amount,
          current_investments,
          monthly_investment,
          risk_tolerance,
          investment_knowledge,
          loss_comfort,
          selectedCurrency,
          country
        },
        createdAt: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      };

      await collection.insertOne(saveData);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue without failing the request
    }

    return NextResponse.json({
      success: true,
      analysis: investmentAnalysis
    });

  } catch (error) {
    console.error('Investment Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'AI service temporarily unavailable'
    }, { status: 500 });
  }
} 