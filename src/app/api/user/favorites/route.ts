import { NextRequest, NextResponse } from 'next/server';
import { UserFavorite } from '@/models/UserFavoritesModel';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Add timeout and retry logic
    const favorites = await Promise.race([
      UserFavorite.getUserFavorites(userId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    const stats = await Promise.race([
      UserFavorite.getFavoriteStats(userId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    return NextResponse.json({
      success: true,
      data: {
        favorites,
        stats
      }
    });
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    
    // Return empty data instead of error for better UX
    return NextResponse.json({
      success: true,
      data: {
        favorites: [],
        stats: {}
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { userId, toolSlug, toolName, category, notes, tags } = body;

    if (!userId || !toolSlug || !toolName || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const favorite = await Promise.race([
      UserFavorite.addFavorite({
        userId,
        toolSlug,
        toolName,
        category,
        notes,
        tags
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    return NextResponse.json({
      success: true,
      data: favorite
    });
  } catch (error: any) {
    console.error('Error adding favorite:', error);
    
    if (error.message === 'Tool already in favorites') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getDatabase();
    
    const body = await request.json();
    const { userId, toolSlug, notes, tags } = body;

    if (!userId || !toolSlug) {
      return NextResponse.json(
        { success: false, error: 'User ID and tool slug are required' },
        { status: 400 }
      );
    }

    const favorite = await Promise.race([
      UserFavorite.updateFavorite(userId, toolSlug, {
        notes,
        tags
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    if (!favorite) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: favorite
    });
  } catch (error) {
    console.error('Error updating favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const toolSlug = searchParams.get('toolSlug');

    if (!userId || !toolSlug) {
      return NextResponse.json(
        { success: false, error: 'User ID and tool slug are required' },
        { status: 400 }
      );
    }

    const result = await Promise.race([
      UserFavorite.removeFavorite(userId, toolSlug),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
} 