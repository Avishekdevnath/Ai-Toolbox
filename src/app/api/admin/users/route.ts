import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import mongoose from 'mongoose';
import { getDatabase } from '@/lib/mongodb';
import { ToolUsage } from '@/models/ToolUsageModel';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get database instance
    const db = await getDatabase();

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { clerkId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      } else {
        query.status = status;
      }
    }

    if (role) {
      query.role = role;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      db.collection('users')
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(query)
    ]);

    // Get admin users if the current user is a super admin
    let adminUsers: any[] = [];
    if (adminSession.role === 'super_admin') {
      adminUsers = await db.collection('adminusers')
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray();
      
      // Remove password field from admin users
      adminUsers = adminUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    }

    // Get user activity data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userActivity = await ToolUsage.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          userId: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$userId',
          toolUsageCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
          toolsUsed: { $addToSet: '$toolSlug' }
        }
      },
      {
        $project: {
          userId: '$_id',
          toolUsageCount: 1,
          lastActivity: 1,
          toolsUsed: { $size: '$toolsUsed' }
        }
      }
    ]);

    // Create activity lookup map
    const activityMap = new Map();
    userActivity.forEach(activity => {
      activityMap.set(activity.userId, activity);
    });

    // Enhance user data with activity information
    const enhancedUsers = users.map(user => {
      const activity = activityMap.get(user.clerkId || user._id.toString()) || {
        toolUsageCount: 0,
        lastActivity: null,
        toolsUsed: 0
      };

      return {
        _id: user._id,
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        role: user.role || 'user',
        status: user.isActive ? 'active' : 'inactive',
        clerkId: user.clerkId || user._id.toString(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        activity: {
          toolUsageCount: activity.toolUsageCount,
          lastActivity: activity.lastActivity,
          toolsUsed: activity.toolsUsed,
          isActive: activity.lastActivity ? 
            (new Date().getTime() - new Date(activity.lastActivity).getTime()) < (7 * 24 * 60 * 60 * 1000) : 
            false
        }
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        users: enhancedUsers,
        adminUsers: adminUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can create users
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, role, status } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get database instance
    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      email: email.toLowerCase(),
      name: `${firstName} ${lastName}`,
      role: role || 'user',
      isActive: status === 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      profile: {
        firstName,
        lastName,
        avatar: null,
        bio: '',
        location: '',
        website: ''
      },
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: false
        }
      },
      security: {
        emailVerified: false,
        twoFactorEnabled: false,
        lastPasswordChange: new Date()
      },
      activity: {
        lastLoginAt: null,
        lastActivityAt: null,
        loginCount: 0,
        toolUsageCount: 0
      },
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null
      },
      permissions: ['basic_access']
    };

    const result = await db.collection('users').insertOne(newUser);
    const createdUser = { ...newUser, _id: result.insertedId };

    return NextResponse.json({
      success: true,
      data: createdUser,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 