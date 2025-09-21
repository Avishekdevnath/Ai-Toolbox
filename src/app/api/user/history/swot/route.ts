import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { SwotAnalysisService } from '@/lib/swotAnalysisService';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('user_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = verifyAccessToken(token);
    if (!claims?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    const swotService = SwotAnalysisService.getInstance();
    
    // Get user's SWOT analysis history
    const { analyses, total } = await swotService.getUserAnalyses(claims.id, {
      limit,
      skip,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    return NextResponse.json({
      success: true,
      history: analyses.map(item => ({
        id: item._id,
        analysisType: item.analysisType,
        swotType: item.inputData?.swotType,
        name: item.name,
        createdAt: item.createdAt,
        lastAccessed: item.lastAccessed,
        accessCount: item.accessCount,
        isDuplicate: item.isDuplicate,
        result: {
          strengths: item.result?.strengths || [],
          weaknesses: item.result?.weaknesses || [],
          opportunities: item.result?.opportunities || [],
          threats: item.result?.threats || []
        }
      })),
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching SWOT history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user authentication
    const token = request.cookies.get('user_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const claims = verifyAccessToken(token);
    if (!claims?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { analysisId } = await request.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 });
    }

    const swotService = SwotAnalysisService.getInstance();

    // Delete the analysis (only if it belongs to the user)
    const deleted = await swotService.deleteAnalysis(analysisId, claims.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Analysis not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting SWOT analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
