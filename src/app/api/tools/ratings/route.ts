import { NextRequest, NextResponse } from 'next/server';
import { ToolRating } from '@/models/ToolRatingModel';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get('toolSlug');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!toolSlug) {
      return NextResponse.json(
        { success: false, error: 'Tool slug is required' },
        { status: 400 }
      );
    }

    const [ratings, stats] = await Promise.all([
      ToolRating.getToolRatings(toolSlug, limit, skip),
      ToolRating.getToolStats(toolSlug)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ratings,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { userId, toolSlug, toolName, rating, review } = body;

    if (!userId || !toolSlug || !toolName || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const toolRating = await ToolRating.addRating({
      userId,
      toolSlug,
      toolName,
      rating,
      review
    });

    return NextResponse.json({
      success: true,
      data: toolRating
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add rating' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { ratingId, action } = body;

    if (!ratingId || !action) {
      return NextResponse.json(
        { success: false, error: 'Rating ID and action are required' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'helpful') {
      result = await ToolRating.markHelpful(ratingId);
    } else if (action === 'report') {
      result = await ToolRating.reportRating(ratingId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Rating not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rating' },
      { status: 500 }
    );
  }
} 