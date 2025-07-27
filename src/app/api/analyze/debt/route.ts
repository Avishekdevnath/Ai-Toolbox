import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIResponse } from '@/lib/utils';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { debtData } = await request.json();

    const prompt = `
    Analyze this debt management scenario and provide a comprehensive debt repayment strategy:

    DEBT INFORMATION:
    ${debtData.debts.map((debt: any, index: number) => `
    Debt ${index + 1}: ${debt.name}
    - Balance: ${debt.balance}
    - Interest Rate: ${debt.interest_rate}%
    - Minimum Payment: ${debt.minimum_payment}
    `).join('\n')}

    MONTHLY BUDGET: ${debtData.monthly_budget}

    Please provide a detailed analysis in the following JSON format:
    {
      "executiveSummary": "Brief overview of the debt situation and recommended approach",
      "debtAnalysis": {
        "totalDebt": "Total outstanding debt amount",
        "totalInterest": "Total annual interest payments",
        "debtToIncomeRatio": "Calculated debt-to-income ratio",
        "priorityRanking": [
          {
            "debtName": "Name of debt",
            "priority": "High/Medium/Low",
            "reason": "Why this debt should be prioritized"
          }
        ]
      },
      "repaymentStrategies": [
        {
          "name": "Strategy name (e.g., Avalanche Method, Snowball Method)",
          "description": "How this strategy works",
          "monthlyAllocation": [
            {
              "debtName": "Debt name",
              "amount": "Amount to pay monthly",
              "percentage": "Percentage of total budget"
            }
          ],
          "estimatedPayoffTime": "Estimated months to pay off all debts",
          "totalInterestPaid": "Total interest that will be paid",
          "savings": "Interest savings compared to minimum payments"
        }
      ],
      "recommendedStrategy": {
        "name": "Best strategy name",
        "reason": "Why this is the best approach",
        "monthlyBreakdown": [
          {
            "debtName": "Debt name",
            "amount": "Recommended monthly payment",
            "priority": "Payment priority order"
          }
        ],
        "timeline": {
          "shortTerm": "3-6 month goals",
          "mediumTerm": "6-12 month goals", 
          "longTerm": "1+ year goals"
        }
      },
      "riskAssessment": {
        "currentRisk": "High/Medium/Low",
        "riskFactors": ["List of risk factors"],
        "mitigationStrategies": ["Ways to reduce risk"]
      },
      "additionalRecommendations": [
        "List of actionable recommendations"
      ],
      "emergencyPlan": {
        "emergencyFund": "Recommended emergency fund amount",
        "debtPauseStrategy": "What to do if unable to make payments"
      }
    }

    Focus on practical, actionable advice. Ensure all monetary values are formatted consistently.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const analysis = parseAIResponse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Debt analysis error:', error);
    
    if (error instanceof Error && error.message.includes('Invalid JSON')) {
      return NextResponse.json({
        success: false,
        error: 'AI returned invalid response format. Please try again.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to analyze debt management scenario. Please try again.'
    }, { status: 500 });
  }
} 