import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get all users
    const users = await db.collection('users')
      .find({})
      .project({
        _id: 1,
        email: 1,
        name: 1,
        firstName: 1,
        lastName: 1,
        role: 1,
        isActive: 1,
        createdAt: 1,
        lastLoginAt: 1
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Format user data
    const formattedUsers = users.map(user => ({
      _id: user._id.toString(),
      email: user.email,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      role: user.role || 'user',
      isActive: user.isActive !== false, // Default to true if not specified
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 