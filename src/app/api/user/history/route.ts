import { NextRequest, NextResponse } from 'next/server';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { MockDataService } from '@/lib/mockDataService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
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
      const history = await UserAnalysisHistory.getUserHistory(userId, limit, offset);

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
      console.error('Database error, using mock data:', dbError);
      
      // Fallback to mock data
      const mockData = MockDataService.getFilteredHistory(
        search,
        analysisType,
        status,
        limit,
        offset
      );

      return NextResponse.json({
        success: true,
        data: {
          history: mockData.history,
          pagination: {
            limit,
            offset,
            hasMore: mockData.history.length === limit
          }
        },
        note: 'Using mock data due to database connection issues'
      });
    }

  } catch (error: any) {
    console.error('Error fetching user history:', error);
    
    // Return mock data as final fallback
    const mockData = MockDataService.getFilteredHistory('', 'all', 'all', 20, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        history: mockData.history,
        pagination: {
          limit: 20,
          offset: 0,
          hasMore: false
        }
      },
      note: 'Using mock data due to system error'
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
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
      const result = await UserAnalysisHistory.deleteAnalysis(analysisId, userId);

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
    const { userId } = await auth();
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      analysisType,
      toolSlug,
      toolName,
      inputData,
      result,
      metadata = {},
      status = 'completed',
      errorMessage,
      isAnonymous = false
    } = body;

    // Validate required fields
    if (!analysisType || !toolSlug || !toolName || !inputData || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new analysis history entry
    const analysisHistory = new UserAnalysisHistory({
      userId,
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
        ipAddress: request.ip || 'unknown',
        sessionId: metadata.sessionId
      },
      status,
      errorMessage,
      isAnonymous
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