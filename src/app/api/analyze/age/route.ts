import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  calculateAge,
  generateLifeMilestones,
  generateHealthRecommendations,
  calculateRetirementPlan,
  calculateLifeExpectancy,
  generateAgeBasedActivities,
  calculateLifePercentage,
  getNextBirthday,
  type AgeData,
  type LifeMilestone,
  type HealthRecommendation,
  type RetirementPlan,
  type LifeExpectancy,
  type AgeBasedActivity
} from '@/lib/ageCalculatorUtils';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

import { AgeAnalysisRequest, AgeAnalysisResponse } from '@/schemas/ageAnalysisSchema';

export async function POST(request: NextRequest) {
  try {
    const body: AgeAnalysisRequest = await request.json();
    const {
      birthDate,
      gender = 'male',
      lifestyle = 'average',
      healthConditions = [],
      retirementAge = 65,
      currentSavings = 0,
      monthlyIncome = 5000,
      desiredRetirementIncome = 4000,
      includeAIInsights = true
    } = body;

    if (!birthDate) {
      return NextResponse.json(
        { error: 'Birth date is required' },
        { status: 400 }
      );
    }

    const birthDateObj = new Date(birthDate);
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birth date format' },
        { status: 400 }
      );
    }

    // Calculate basic age data
    const ageData = calculateAge(birthDateObj);
    const age = ageData.age.years;

    // Generate all calculations
    const lifeMilestones = generateLifeMilestones(age);
    const healthRecommendations = generateHealthRecommendations(age);
    const retirementPlan = calculateRetirementPlan(
      age,
      retirementAge,
      currentSavings,
      monthlyIncome,
      desiredRetirementIncome
    );
    const lifeExpectancy = calculateLifeExpectancy(age, gender, lifestyle, healthConditions);
    const ageBasedActivities = generateAgeBasedActivities(age);
    const lifePercentage = calculateLifePercentage(age, lifeExpectancy.overall);
    const nextBirthday = getNextBirthday(birthDateObj);

    const response: AgeAnalysisResponse = {
      ageData,
      lifeMilestones,
      healthRecommendations,
      retirementPlan,
      lifeExpectancy,
      ageBasedActivities,
      lifePercentage,
      nextBirthday
    };

    // Generate AI insights if requested and API key is available
    if (includeAIInsights && process.env.GOOGLE_AI_API_KEY) {
      try {
        const aiInsights = await generateAIInsights({
          age,
          gender,
          lifestyle,
          healthConditions,
          lifeMilestones,
          healthRecommendations,
          retirementPlan,
          lifeExpectancy,
          ageBasedActivities,
          lifePercentage
        });
        response.aiInsights = aiInsights;
      } catch (aiError) {
        console.error('AI insights generation failed:', aiError);
        // Continue without AI insights
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Age analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze age data' },
      { status: 500 }
    );
  }
}

async function generateAIInsights(data: {
  age: number;
  gender: string;
  lifestyle: string;
  healthConditions: string[];
  lifeMilestones: LifeMilestone[];
  healthRecommendations: HealthRecommendation[];
  retirementPlan: RetirementPlan;
  lifeExpectancy: LifeExpectancy;
  ageBasedActivities: AgeBasedActivity[];
  lifePercentage: number;
}) {
  const prompt = `
You are an expert life coach and wellness advisor. Analyze the following age-related data and provide personalized, encouraging insights:

Age: ${data.age} years old
Gender: ${data.gender}
Lifestyle: ${data.lifestyle}
Health Conditions: ${data.healthConditions.join(', ') || 'None reported'}
Life Percentage Lived: ${data.lifePercentage.toFixed(1)}%
Life Expectancy: ${data.lifeExpectancy.overall} years

Upcoming Milestones:
${data.lifeMilestones.filter(m => !m.achieved).slice(0, 3).map(m => 
  `- ${m.title} (${m.yearsUntil} years away): ${m.description}`
).join('\n')}

Health Recommendations:
${data.healthRecommendations.slice(0, 3).map(r => 
  `- ${r.title}: ${r.description}`
).join('\n')}

Retirement Planning:
- Years until retirement: ${data.retirementPlan.yearsUntilRetirement}
- Monthly savings needed: $${data.retirementPlan.monthlySavingsNeeded.toFixed(0)}
- Total savings needed: $${data.retirementPlan.totalSavingsNeeded.toFixed(0)}

Recommended Activities:
${data.ageBasedActivities.slice(0, 3).map(a => 
  `- ${a.title}: ${a.description}`
).join('\n')}

Please provide:

1. **Personalized Advice** (2-3 sentences): Specific, actionable advice based on their age and situation
2. **Life Optimization Tips** (3-4 bullet points): Practical tips to make the most of their current life stage
3. **Motivational Message** (1-2 sentences): An encouraging message about their life journey
4. **Future Planning Suggestions** (2-3 bullet points): Specific suggestions for planning their next life phase

Keep the tone positive, encouraging, and practical. Focus on opportunities and growth rather than limitations.
`;

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse the AI response
  const sections = text.split('\n\n');
  const insights = {
    personalizedAdvice: '',
    lifeOptimizationTips: [] as string[],
    motivationalMessage: '',
    futurePlanningSuggestions: [] as string[]
  };

  sections.forEach(section => {
    if (section.includes('Personalized Advice')) {
      insights.personalizedAdvice = section.replace('**Personalized Advice**:', '').trim();
    } else if (section.includes('Life Optimization Tips')) {
      const tips = section.split('\n').filter(line => line.trim().startsWith('-'));
      insights.lifeOptimizationTips = tips.map(tip => tip.replace('-', '').trim());
    } else if (section.includes('Motivational Message')) {
      insights.motivationalMessage = section.replace('**Motivational Message**:', '').trim();
    } else if (section.includes('Future Planning Suggestions')) {
      const suggestions = section.split('\n').filter(line => line.trim().startsWith('-'));
      insights.futurePlanningSuggestions = suggestions.map(suggestion => suggestion.replace('-', '').trim());
    }
  });

  return insights;
} 