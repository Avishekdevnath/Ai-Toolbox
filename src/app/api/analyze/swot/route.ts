import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { model } from '@/lib/gemini';
import { parseAIResponse } from '@/lib/utils';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { DuplicateDetectionService } from '@/lib/duplicateDetectionService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | null = null;
  let clerkId: string | null = null;

  try {
    // Get user authentication
    try {
      // Assuming you have a custom admin auth or no auth for anonymous users
      // For now, we'll proceed as anonymous if Clerk auth fails
      // In a real application, you'd implement your own auth logic here
      // For this example, we'll simulate an anonymous user for demonstration
      // In a production environment, you'd get userId from Clerk.userId
      // For now, we'll set it to a placeholder or null
      userId = 'anonymous_user_id'; // Placeholder for anonymous user
      clerkId = 'anonymous_clerk_id'; // Placeholder for anonymous user
    } catch (authError) {
      // User not authenticated, continue as anonymous
      console.log('User not authenticated, proceeding as anonymous');
    }

    const { swotType, formData, forceRegenerate = false } = await request.json();

    if (!swotType || !formData) {
      return NextResponse.json(
        { error: 'SWOT type and form data are required' },
        { status: 400 }
      );
    }

    // Check for duplicates if user is authenticated and not forcing regeneration
    if (userId && !forceRegenerate) {
      const duplicateCheck = await DuplicateDetectionService.checkForDuplicates({
        userId,
        clerkId: clerkId!,
        toolSlug: 'swot-analysis',
        toolName: 'SWOT Analysis',
        analysisType: 'swot',
        parameters: { swotType, formData }
      });

      // If duplicate found, return cached result
      if (duplicateCheck.isDuplicate && duplicateCheck.existingAnalysis) {
        console.log('Duplicate analysis found, returning cached result');
        
        return NextResponse.json({
          success: true,
          result: duplicateCheck.existingAnalysis.result,
          metadata: {
            processingTime: Date.now() - startTime,
            tokensUsed: duplicateCheck.existingAnalysis.metadata.tokensUsed || 0,
            model: duplicateCheck.existingAnalysis.metadata.model || 'cached',
            cost: duplicateCheck.existingAnalysis.metadata.cost || 0,
            userAgent: request.headers.get('user-agent') || 'Unknown',
            ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'Unknown'
          },
          isDuplicate: true,
          existingAnalysisId: duplicateCheck.existingAnalysis._id,
          similarity: duplicateCheck.similarity,
          differences: duplicateCheck.differences,
          parameterHash: duplicateCheck.parameterHash
        });
      }
    }

    // Generate SWOT analysis using AI
    const prompt = `Analyze the following ${swotType} scenario and provide a comprehensive SWOT analysis:

${swotType.toUpperCase()} ANALYSIS
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Please provide a detailed SWOT analysis in the following JSON format:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "threats": ["Threat 1", "Threat 2", "Threat 3"],
  "aiTips": {
    "leverageStrengths": ["Tip 1", "Tip 2"],
    "addressWeaknesses": ["Strategy 1", "Strategy 2"],
    "capitalizeOpportunities": ["Way 1", "Way 2"],
    "mitigateThreats": ["Method 1", "Method 2"],
    "strategicRecommendations": ["Rec 1", "Rec 2"],
    "motivationalSummary": "Encouraging summary message"
  }
}

Focus on practical, actionable insights specific to ${swotType} analysis.`;

    let analysis;
    let tokensUsed = 0;
    let modelUsed = 'fallback';
    
    if (model) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        try {
          analysis = parseAIResponse(text);
          modelUsed = 'gemini';
          // Estimate tokens (rough calculation)
          tokensUsed = Math.ceil((prompt.length + text.length) / 4);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          // Use fallback analysis
          analysis = getFallbackAnalysis(swotType, formData);
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        // Use fallback analysis
        analysis = getFallbackAnalysis(swotType, formData);
      }
    } else {
      // Use fallback analysis if AI is not available
      analysis = getFallbackAnalysis(swotType, formData);
    }

    const processingTime = Date.now() - startTime;
    const metadata = {
      processingTime,
      tokensUsed,
      model: modelUsed,
      cost: tokensUsed * 0.000001, // Rough cost estimation
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'Unknown'
    };

    // Save to user history if authenticated
    let analysisId: string | undefined;
    if (userId) {
      try {
        // Check if this is a duplicate of an existing analysis
        const duplicateCheck = await DuplicateDetectionService.checkForDuplicates({
          userId,
          clerkId: clerkId!,
          toolSlug: 'swot-analysis',
          toolName: 'SWOT Analysis',
          analysisType: 'swot',
          parameters: { swotType, formData }
        });

        // Save with duplicate detection info
        analysisId = await DuplicateDetectionService.saveAnalysisResult(
          {
            userId,
            clerkId: clerkId!,
            toolSlug: 'swot-analysis',
            toolName: 'SWOT Analysis',
            analysisType: 'swot',
            parameters: { swotType, formData }
          },
          analysis,
          metadata,
          duplicateCheck.isDuplicate,
          duplicateCheck.existingAnalysis?._id
        );

        console.log('Analysis saved to history with ID:', analysisId);
      } catch (historyError) {
        console.error('Failed to save to history:', historyError);
        // Continue without saving to history
      }
    }

    return NextResponse.json({
      success: true,
      result: analysis,
      metadata,
      analysisId,
      isDuplicate: false
    });

  } catch (error) {
    console.error('SWOT analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate SWOT analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getFallbackAnalysis(swotType: string, formData: any) {
  const name = formData.name || 'Your Analysis';
  
  return {
    strengths: [
      `Strong ${swotType} foundation`,
      `Clear ${swotType} objectives`,
      `Experienced approach to ${swotType}`,
      `Well-defined ${swotType} strategy`
    ],
    weaknesses: [
      `Limited ${swotType} resources`,
      `Need for ${swotType} improvement`,
      `${swotType} challenges to address`,
      `Areas for ${swotType} growth`
    ],
    opportunities: [
      `${swotType} expansion potential`,
      `New ${swotType} opportunities`,
      `${swotType} market growth`,
      `Technology adoption in ${swotType}`
    ],
    threats: [
      `${swotType} competition`,
      `Market changes affecting ${swotType}`,
      `External factors impacting ${swotType}`,
      `${swotType} regulatory challenges`
    ],
    aiTips: {
      leverageStrengths: [
        `Focus on your ${swotType} strengths`,
        `Build upon your ${swotType} advantages`
      ],
      addressWeaknesses: [
        `Develop ${swotType} improvement plans`,
        `Seek ${swotType} support and resources`
      ],
      capitalizeOpportunities: [
        `Act on ${swotType} opportunities`,
        `Expand your ${swotType} reach`
      ],
      mitigateThreats: [
        `Monitor ${swotType} threats`,
        `Develop ${swotType} contingency plans`
      ],
      strategicRecommendations: [
        `Create a comprehensive ${swotType} plan`,
        `Focus on ${swotType} priorities`
      ],
      motivationalSummary: `You have a solid foundation for ${swotType} success. Focus on leveraging your strengths while addressing areas for improvement.`
    }
  };
} 