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

    // Get recent notifications
    const notifications = await db.collection('adminnotifications')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Format notification data
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: new Date(notification.createdAt).toLocaleString()
    }));

    return NextResponse.json(formattedNotifications);

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 