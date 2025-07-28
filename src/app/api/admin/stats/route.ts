import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Get user statistics
    const totalUsers = await db.collection('users').countDocuments();
    const activeUsers = await db.collection('users').countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Get tool usage statistics
    const toolUsage = await db.collection('tool_usage').aggregate([
      {
        $group: {
          _id: '$toolName',
          count: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]).toArray();

    // Get recent activity
    const recentActivity = await db.collection('tool_usage').aggregate([
      {
        $sort: { lastUsed: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          toolName: 1,
          lastUsed: 1,
          userEmail: { $arrayElemAt: ['$user.email', 0] }
        }
      }
    ]).toArray();

    // System health data
    const systemHealth = {
      apiStatus: 'Online',
      errorRate: 0.2,
      lastDowntime: '2024-07-01 10:15',
      uptime: '99.98%'
    };

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        toolUsage: toolUsage.map(tool => ({
          name: tool._id,
          count: tool.count
        })),
        systemHealth,
        recentActivity: recentActivity.map(activity => ({
          user: activity.userEmail || 'Anonymous',
          action: `Used ${activity.toolName}`,
          time: activity.lastUsed
        }))
      }
    });

  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 