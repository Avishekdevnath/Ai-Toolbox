import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin token' },
        { status: 401 }
      );
    }

    // Verify admin exists and has permissions
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    const adminUser = await db.collection('adminusers').findOne({ 
      _id: new ObjectId(decoded.id),
      isActive: true 
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found or inactive' },
        { status: 401 }
      );
    }

    // Check if admin has analytics permission
    if (!adminUser.permissions.includes('view_analytics')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

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
    const activeUsers = await db.collection('useranalysishistories')
      .distinct('userId', {
        createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      });

    // Get user activity by tool
    const userActivityByTool = await db.collection('toolusage')
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
            avgUsagePerUser: {
              $divide: ['$totalUsage', { $size: '$uniqueUsers' }]
            }
          }
        },
        {
          $sort: { uniqueUsers: -1 }
        }
      ]).toArray();

    // Get user retention data
    const userRetention = await db.collection('useranalysishistories')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            firstActivity: { $min: '$createdAt' },
            lastActivity: { $max: '$createdAt' },
            totalActivities: { $sum: 1 }
          }
        },
        {
          $project: {
            userId: '$_id',
            firstActivity: 1,
            lastActivity: 1,
            totalActivities: 1,
            daysActive: {
              $ceil: {
                $divide: [
                  { $subtract: ['$lastActivity', '$firstActivity'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        }
      ]).toArray();

    // Calculate retention metrics
    const totalActiveUsers = userRetention.length;
    const returningUsers = userRetention.filter(user => user.daysActive > 1).length;
    const retentionRate = totalActiveUsers > 0 ? (returningUsers / totalActiveUsers) * 100 : 0;

    // Format the data
    const userAnalytics = {
      totalUsers,
      activeUsers: activeUsers.length,
      newUsers: userGrowth.reduce((sum, day) => sum + day.newUsers, 0),
      userGrowth: userGrowth.map(day => ({
        date: day._id,
        count: day.newUsers
      })),
      userActivityByTool: userActivityByTool.map(tool => ({
        toolSlug: tool.toolSlug,
        uniqueUsers: tool.uniqueUsers,
        totalUsage: tool.totalUsage
      }))
    };

    // Log analytics access
    await db.collection('adminactivities').insertOne({
      adminId: new ObjectId(decoded.id),
      type: 'viewed',
      action: 'user_analytics',
      details: { range, totalUsers, activeUsers: activeUsers.length },
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      ...userAnalytics
    });

  } catch (error) {
    console.error('User analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user analytics data' },
      { status: 500 }
    );
  }
} 