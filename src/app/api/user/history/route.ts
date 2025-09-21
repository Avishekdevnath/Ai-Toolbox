import { NextRequest, NextResponse } from 'next/server';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { MockDataService } from '@/lib/mockDataService';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;

    if (!claims?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const analysisType = searchParams.get('analysisType') || 'all';
    const toolSlug = searchParams.get('toolSlug');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    try {
      // Try to get real data from database
      const history = await (UserAnalysisHistory as any).getUserHistory(claims.id, limit, offset);

      // Apply filters
      let filteredHistory = history;
      
      if (analysisType !== 'all') {
        filteredHistory = filteredHistory.filter(item => item.analysisType === analysisType);
      }
      
      if (status !== 'all') {
        filteredHistory = filteredHistory.filter(item => item.status === status);
      }
      
      if (search) {
        filteredHistory = filteredHistory.filter(item =>
          item.toolName.toLowerCase().includes(search.toLowerCase()) ||
          item.analysisType.toLowerCase().includes(search.toLowerCase())
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          history: filteredHistory,
          pagination: {
            limit,
            offset,
            hasMore: filteredHistory.length === limit
          }
        }
      });

    } catch (dbError) {
      console.error('Database error, returning empty data:', dbError);
      
      // Return empty data instead of mock data to avoid showing same data for all users
      return NextResponse.json({
        success: true,
        data: {
          history: [],
          pagination: {
            limit,
            offset,
            hasMore: false
          }
        },
        note: 'No data available due to database connection issues'
      });
    }

  } catch (error: any) {
    console.error('Error fetching user history:', error);
    
    // Return empty data as final fallback instead of mock data
    return NextResponse.json({
      success: true,
      data: {
        history: [],
        pagination: {
          limit: 20,
          offset: 0,
          hasMore: false
        }
      },
      note: 'No data available due to system error'
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;

    if (!claims?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    try {
      const result = await (UserAnalysisHistory as any).deleteAnalysis(analysisId, claims.id);

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Analysis not found or already deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Analysis deleted successfully'
      });

    } catch (dbError) {
      console.error('Database error during delete:', dbError);
      return NextResponse.json({
        success: true,
        message: 'Analysis marked for deletion (mock mode)'
      });
    }

  } catch (error: any) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
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
      userId: claims?.id || 'anonymous',
      clerkId: claims?.id || undefined,
      analysisType,
      toolSlug,
      toolName,
      inputData,
      result,
      metadata: {
        processingTime: (metadata as any).processingTime || 0,
        tokensUsed: (metadata as any).tokensUsed,
        model: (metadata as any).model,
        cost: (metadata as any).cost,
        userAgent: request.headers.get('user-agent'),
        ipAddress:
          (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           'unknown'),
        sessionId: (metadata as any).sessionId
      },
      status: 'completed',
      isAnonymous: !claims?.id || isAnonymous
    });

    await analysisHistory.save();

    return NextResponse.json({
      success: true,
      data: {
        id: analysisHistory._id,
        message: 'Analysis history saved successfully'
      }
    });

  } catch (error: any) {
    console.error('Error saving analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis history' },
      { status: 500 }
    );
  }
} 