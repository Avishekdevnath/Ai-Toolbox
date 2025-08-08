import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ContactModel } from '@/schemas/contactSchema';

export async function GET(request: NextRequest) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get basic stats
    const stats = await ContactModel.getStats();

    // Get stats for the specified time range
    const timeRangeStats = await ContactModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);

    // Get category distribution
    const categoryStats = await ContactModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get daily submissions for the last 7 days
    const dailyStats = await ContactModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
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
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get recent urgent contacts
    const urgentContacts = await ContactModel.find({
      priority: 'urgent',
      status: { $in: ['pending', 'in-progress'] }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    return NextResponse.json({
      overall: stats,
      timeRange: timeRangeStats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
        high: 0
      },
      categories: categoryStats,
      daily: dailyStats,
      urgentContacts,
      timeRange: timeRange
    });

  } catch (error: any) {
    console.error('Error fetching contact stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact statistics' },
      { status: 500 }
    );
  }
} 