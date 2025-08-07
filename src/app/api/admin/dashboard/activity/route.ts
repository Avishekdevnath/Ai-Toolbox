import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get recent admin activity
    const recentActivity = await db.collection('adminactivities')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Format activity data
    const formattedActivity = recentActivity.map(activity => ({
      id: activity._id.toString(),
      action: activity.action,
      resource: activity.resource,
      adminEmail: activity.adminEmail,
      timestamp: new Date(activity.createdAt).toLocaleString(),
      status: activity.status
    }));

    return NextResponse.json(formattedActivity);

  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
} 