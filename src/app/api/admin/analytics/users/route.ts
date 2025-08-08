import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analytics Users API - Starting authentication check...');
    
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    console.log('🔍 Analytics Users API - Auth result:', { 
      hasUser: !!user, 
      isAdmin: user?.isAdmin,
      email: user?.email 
    });
    
    if (!user || !user.isAdmin) {
      console.log('❌ Analytics Users API - Unauthorized:', { user: !!user, isAdmin: user?.isAdmin });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Analytics Users API - Authentication successful');

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

    // Get user growth data
    const userGrowth = await db.collection('users')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            newUsers: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).toArray();

    // Get total users count
    const totalUsers = await db.collection('users').countDocuments();

    // Get active users (users with activity in the last 24 hours)
    const activeUsers = await db.collection('users').countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Get new users in the selected range
    const newUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get user activity by tool
    const userActivityByTool = await db.collection('toolusages')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$toolSlug',
            uniqueUsers: { $addToSet: '$userId' },
            totalUsage: { $sum: 1 }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            uniqueUsers: { $size: '$uniqueUsers' },
            totalUsage: 1,
            _id: 0
          }
        },
        {
          $sort: { totalUsage: -1 }
        }
      ]).toArray();

    const result = {
      totalUsers,
      activeUsers,
      newUsers,
      userGrowth: userGrowth.map(item => ({
        date: item._id,
        count: item.newUsers
      })),
      userActivityByTool
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('User analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 