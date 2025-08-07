import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin has activity logs permission
    if (!AdminAuth.hasPermission(adminSession, 'view_audit_logs')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'all';
    const status = searchParams.get('status') || 'all';
    const range = searchParams.get('range') || '7d';

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build query
    const query: any = {
      createdAt: { $gte: startDate }
    };
    
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
        { adminEmail: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (type !== 'all') {
      query.type = type;
    }

    if (status !== 'all') {
      query.status = status;
    }

    // Get total count
    const totalActivities = await db.collection('adminactivities').countDocuments(query);
    const totalPages = Math.ceil(totalActivities / limit);

    // Get activities with pagination
    const activities = await db.collection('adminactivities')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        totalActivities,
        totalPages
      }
    });

  } catch (error) {
    console.error('Activity logs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
} 