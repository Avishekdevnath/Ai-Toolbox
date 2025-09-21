import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import mongoose from 'mongoose';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default: // 7d
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get total users
    const totalUsers = await db.collection('users').countDocuments({});

    // Get active users (users with activity in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await db.collection('users').countDocuments({
      'activity.lastActivityAt': { $gte: sevenDaysAgo }
    });

    // Get new users in the selected time range
    const newUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get inactive users (no activity in 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveUsers = await db.collection('users').countDocuments({
      $or: [
        { 'activity.lastActivityAt': { $lt: thirtyDaysAgo } },
        { 'activity.lastActivityAt': { $exists: false } }
      ]
    });

    // Get suspended users
    const suspendedUsers = await db.collection('users').countDocuments({
      isActive: false,
      status: { $ne: 'deleted' }
    });

    // Calculate user growth (comparing current period with previous period)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodLength);
    previousEndDate.setTime(previousEndDate.getTime() - periodLength);

    const currentPeriodUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const previousPeriodUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate }
    });

    const userGrowth = previousPeriodUsers > 0 
      ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 
      : currentPeriodUsers > 0 ? 100 : 0;

    // Calculate active user rate
    const activeUserRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    // Get average session duration (mock for now, would need session tracking)
    const averageSessionDuration = 23.4;

    // Get top tools usage - handle case where collection might not exist
    let topTools = [];
    try {
      const toolUsageCollection = db.collection('toolusages');
      const collectionExists = await toolUsageCollection.findOne({});
      
      if (collectionExists) {
        topTools = await toolUsageCollection.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$toolSlug',
              usage: { $sum: 1 },
              toolName: { $first: '$toolName' }
            }
          },
          {
            $sort: { usage: -1 }
          },
          {
            $limit: 5
          }
        ]).toArray();
      }
    } catch (error) {
      console.log('Tool usage collection not available, using empty array');
      topTools = [];
    }

    const totalToolUsage = topTools.reduce((sum, tool) => sum + tool.usage, 0);
    const topToolsWithPercentage = topTools.map(tool => ({
      name: tool.toolName || tool._id,
      usage: tool.usage,
      percentage: totalToolUsage > 0 ? (tool.usage / totalToolUsage) * 100 : 0
    }));

    // Get user activity by day
    const userActivity = await db.collection('users').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    // Get active users by day from tool usage
    let activeUsersByDay = [];
    try {
      const toolUsageCollection = db.collection('toolusages');
      const collectionExists = await toolUsageCollection.findOne({});
      
      if (collectionExists) {
        activeUsersByDay = await toolUsageCollection.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              activeUsers: { $addToSet: "$userId" }
            }
          },
          {
            $project: {
              _id: 1,
              activeUsers: { $size: "$activeUsers" }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]).toArray();
      }
    } catch (error) {
      console.log('Tool usage collection not available for active users');
      activeUsersByDay = [];
    }

    // Combine user activity data
    const combinedUserActivity = userActivity.map(day => {
      const activeDay = activeUsersByDay.find(active => active._id === day._id);
      return {
        date: day._id,
        activeUsers: activeDay ? activeDay.activeUsers : 0,
        newUsers: day.newUsers
      };
    });

    // Get role distribution
    const roleDistribution = await db.collection('users').aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          percentage: { $multiply: [{ $divide: ['$count', totalUsers] }, 100] }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // Get user engagement levels (mock for now, would need more sophisticated tracking)
    const highEngagement = Math.floor(activeUsers * 0.4);
    const mediumEngagement = Math.floor(activeUsers * 0.3);
    const lowEngagement = activeUsers - highEngagement - mediumEngagement;

    const analytics = {
      totalUsers,
      activeUsers,
      newUsers,
      inactiveUsers,
      suspendedUsers,
      userGrowth: Math.round(userGrowth * 10) / 10,
      activeUserRate: Math.round(activeUserRate * 10) / 10,
      averageSessionDuration,
      topTools: topToolsWithPercentage,
      userActivity: combinedUserActivity,
      roleDistribution,
      userEngagement: {
        high: highEngagement,
        medium: mediumEngagement,
        low: lowEngagement
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error: any) {
    console.error('Error fetching user analytics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user analytics',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 