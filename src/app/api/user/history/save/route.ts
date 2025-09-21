import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;
    const body = await request.json();

    const {
      analysisType,
      toolSlug,
      toolName,
      inputData,
      result,
      metadata = {},
      isAnonymous = false
    } = body;

    // Validate required fields
    if (!analysisType || !toolSlug || !toolName || !inputData || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create analysis history record
    const analysisHistory = new UserAnalysisHistory({
      userId: userId || 'anonymous',
      clerkId: userId,
      analysisType,
      toolSlug,
      toolName,
      inputData,
      result,
      metadata: {
        processingTime: metadata.processingTime || 0,
        tokensUsed: metadata.tokensUsed,
        model: metadata.model,
        cost: metadata.cost,
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        sessionId: request.headers.get('x-session-id')
      },
      status: 'completed',
      isAnonymous: !userId || isAnonymous
    });

    await analysisHistory.save();

    return NextResponse.json({
      success: true,
      data: {
        id: analysisHistory._id,
        message: 'Analysis saved to history'
      }
    });

  } catch (error: any) {
    console.error('Error saving analysis to history:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
} 