import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analytics Usage API - Starting authentication check...');
    
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    console.log('🔍 Analytics Usage API - Auth result:', { 
      hasUser: !!user, 
      isAdmin: user?.isAdmin,
      email: user?.email 
    });
    
    if (!user || !user.isAdmin) {
      console.log('❌ Analytics Usage API - Unauthorized:', { user: !!user, isAdmin: user?.isAdmin });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Analytics Usage API - Authentication successful');

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total usage in the selected range
    const totalUsage = await db.collection('toolusages').countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get unique users who used tools in the selected range
    const uniqueUsers = await db.collection('toolusages').distinct('userId', {
      createdAt: { $gte: startDate }
    });

    // Calculate average usage per user
    const avgUsagePerUser = uniqueUsers.length > 0 ? totalUsage / uniqueUsers.length : 0;

    // Get tool usage breakdown
    const toolUsage = await db.collection('toolusages')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$toolSlug',
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            totalUsage: 1,
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        },
        {
          $sort: { totalUsage: -1 }
        }
      ]).toArray();

    // Add avgDuration as a calculated field
    const toolUsageWithDuration = toolUsage.map(tool => ({
      ...tool,
      avgDuration: 0 // Placeholder - in real system this would be calculated from actual duration data
    }));

    const result = {
      totalUsage,
      uniqueUsers: uniqueUsers.length,
      avgUsagePerUser,
      toolUsage: toolUsageWithDuration
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Usage analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 