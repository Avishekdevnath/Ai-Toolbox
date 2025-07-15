import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { swotType, formData, businessType, description } = await request.json();

    // Support both new and legacy format
    if ((!swotType || !formData) && (!businessType || !description)) {
      return NextResponse.json(
        { error: 'Required data is missing' },
        { status: 400 }
      );
    }

    // Create personalized prompt based on SWOT type
    const createPrompt = () => {
      // Legacy support
      if (businessType && description) {
        return `You are a business strategy expert. Generate a comprehensive SWOT analysis for the given business.

Business Type: ${businessType}
Description: ${description}

Make sure each point is specific, actionable, and relevant to the business described.`;
      }

      const basePrompt = "You are an expert consultant specializing in SWOT analysis. ";
      
      switch (swotType) {
        case 'personal':
          return `${basePrompt}Conduct a comprehensive personal SWOT analysis for:

Name: ${formData.name}
Age: ${formData.age || 'Not specified'}
Profession: ${formData.profession}
Goals: ${formData.goals}
Skills: ${formData.skills || 'Not specified'}
Current Challenges: ${formData.challenges || 'Not specified'}

Analyze this person's strengths, weaknesses, opportunities, and threats in their personal and professional development. Focus on career growth, skill development, and personal goals.`;

        case 'business':
          return `${basePrompt}Conduct a comprehensive business SWOT analysis for:

Business Name: ${formData.name}
Business Type: ${formData.businessType}
Industry: ${formData.industry || 'Not specified'}
Company Size: ${formData.companySize || 'Not specified'}
Years in Business: ${formData.yearsInBusiness || 'Not specified'}
Description: ${formData.businessDescription}

Analyze the business's competitive position, market opportunities, operational strengths/weaknesses, and external threats.`;

        case 'project':
          return `${basePrompt}Conduct a comprehensive project SWOT analysis for:

Project Name: ${formData.projectName}
Project Type: ${formData.projectType || 'Not specified'}
Duration: ${formData.duration || 'Not specified'}
Budget: ${formData.budget || 'Not specified'}
Project Owner: ${formData.name}
Description: ${formData.projectDescription}

Analyze the project's internal capabilities, resource constraints, market opportunities, and potential risks.`;

        case 'career':
          return `${basePrompt}Conduct a comprehensive career SWOT analysis for:

Name: ${formData.name}
Current Role: ${formData.currentRole}
Target Role: ${formData.targetRole || 'Not specified'}
Years of Experience: ${formData.experience || 'Not specified'}
Career Goals: ${formData.careerGoals}

Analyze career strengths, skill gaps, industry opportunities, and potential obstacles to career advancement.`;

        case 'investment':
          return `${basePrompt}Conduct a comprehensive investment SWOT analysis for:

Investor Name: ${formData.name}
Investment Type: ${formData.investmentType}
Investment Amount: ${formData.amount}
Time Horizon: ${formData.timeHorizon || 'Not specified'}
Risk Tolerance: ${formData.riskTolerance || 'Not specified'}

Analyze the investment opportunity's advantages, risks, market conditions, and potential threats.`;

        case 'emotional':
          return `${basePrompt}Conduct a comprehensive emotional SWOT analysis for:

Name: ${formData.name}
Emotional Goals: ${formData.emotionalGoals}
Stress Factors & Triggers: ${formData.stressFactors}
Emotional Strengths: ${formData.emotionalStrengths || 'Not specified'}
Relationship Status: ${formData.relationshipStatus || 'Not specified'}
Current Coping Mechanisms: ${formData.copingMechanisms || 'Not specified'}

Analyze this person's emotional intelligence, psychological well-being, emotional patterns, and mental health opportunities. Focus on emotional strengths, emotional challenges/patterns, opportunities for emotional growth and healing, and emotional threats/triggers. Provide insights for improving emotional resilience, relationship quality, stress management, and overall psychological well-being.`;

        default:
          return `${basePrompt}Conduct a comprehensive SWOT analysis based on the provided information.`;
      }
    };

    const prompt = `${createPrompt()}

Please provide a comprehensive and detailed SWOT analysis with:
- 6-8 specific, actionable strengths
- 6-8 specific weaknesses with clear explanations
- 6-8 realistic opportunities with market insights
- 6-8 potential threats with risk assessments

ADDITIONALLY, provide detailed AI-powered strategic recommendations:
- 5-7 specific, actionable tips to leverage strengths (include HOW to implement each)
- 5-7 practical strategies to address weaknesses (include step-by-step approaches)
- 5-7 concrete ways to capitalize on opportunities (include timing and resources needed)
- 5-7 detailed methods to mitigate threats (include preventive measures and contingency plans)
- 5-7 comprehensive strategic recommendations (include prioritization and implementation timeline)
- A detailed motivational summary (3-4 sentences that inspire action and confidence)

Make each point detailed and actionable. Include specific examples, timeframes, and implementation steps where possible. Focus on practical, real-world applications rather than generic advice.

Return the response in JSON format with the following structure:
{
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "weaknesses": ["weakness1", "weakness2", "weakness3", "weakness4"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3", "opportunity4"],
  "threats": ["threat1", "threat2", "threat3", "threat4"],
  "aiTips": {
    "leverageStrengths": ["tip1", "tip2", "tip3"],
    "addressWeaknesses": ["strategy1", "strategy2", "strategy3"],
    "capitalizeOpportunities": ["way1", "way2", "way3"],
    "mitigateThreats": ["method1", "method2", "method3"],
    "strategicRecommendations": ["recommendation1", "recommendation2", "recommendation3"],
    "motivationalSummary": "Your personalized motivational message here."
  }
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
    const swotAnalysis = JSON.parse(cleanResponse);

    // Save to MongoDB
    try {
      const client = await clientPromise;
      const db = client.db('ai-toolbox');
      const collection = db.collection('swot-analyses');

      // Prepare data for saving
      const saveData: any = {
        analysis: swotAnalysis,
        createdAt: new Date(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      };

      // Add specific fields based on format
      if (swotType && formData) {
        saveData.swotType = swotType;
        saveData.formData = formData;
      } else {
        // Legacy format
        saveData.businessType = businessType;
        saveData.description = description;
      }

      await collection.insertOne(saveData);
    } catch (dbError) {
      console.error('Database save error:', dbError);
      // Continue without failing the request
    }

    return NextResponse.json({
      success: true,
      analysis: swotAnalysis
    });

  } catch (error) {
    console.error('SWOT Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'AI service temporarily unavailable'
    }, { status: 500 });
  }
} 