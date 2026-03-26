import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import mongoose from 'mongoose';
import { getDatabase } from '@/lib/mongodb';
import { ToolUsage } from '@/models/ToolUsageModel';
import { AuthUserModel } from '@/models/AuthUserModel';
import { hashSecurityAnswer, normalizeSecurityAnswer } from '@/lib/auth/securityAnswers';
import { isValidSecurityQuestionId } from '@/lib/auth/securityQuestions';
import crypto from 'crypto';

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
    const userType = searchParams.get('userType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get database instance
    const db = await getDatabase();

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (status === 'active') {
        // For authusers, we consider all users as active by default
        // You could add an isActive field if needed
      } else if (status === 'inactive') {
        // No inactive users in current schema
        query._id = { $in: [] }; // Empty result
      }
    }

    if (role) {
      query.role = role;
    }

    if (userType) {
      query.userType = userType;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const [users, totalUsers] = await Promise.all([
      db.collection('authusers')
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('authusers').countDocuments(query)
    ]);

    // Get admin users from authusers collection
    let adminUsers: any[] = [];
    if (adminSession.role === 'admin') {
      adminUsers = await db.collection('authusers')
        .find({ role: 'admin' })
        .sort({ createdAt: -1 })
        .toArray();
      
      // Remove password field from admin users
      adminUsers = adminUsers.map(user => {
        const { passwordHash, ...userWithoutPassword } = user;
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
        username: user.username || '',
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        role: user.role || 'user',
        userType: user.userType || 'free',
        status: user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : 'active',
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

    // Only admin can create users
    if (adminSession.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, username, firstName, lastName, role, status, securityQuestions } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, firstName, lastName' },
        { status: 400 }
      );
    }

    const normalizedUsername = username?.toLowerCase().trim();
    if (!normalizedUsername || !/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return NextResponse.json(
        { success: false, error: 'Username is required (3–20 chars: letters, numbers, underscores only)' },
        { status: 400 }
      );
    }

    // Validate security questions (3–5 required)
    if (!Array.isArray(securityQuestions) || securityQuestions.length < 3 || securityQuestions.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Please select 3 to 5 security questions' },
        { status: 400 }
      );
    }

    const uniqueQuestionIds = new Set<string>();
    const normalizedAnswers = new Set<string>();

    for (const sq of securityQuestions) {
      const questionId = sq?.questionId;
      const normalizedAnswer = typeof sq?.answer === 'string' ? normalizeSecurityAnswer(sq.answer) : '';

      if (!questionId || !isValidSecurityQuestionId(questionId)) {
        return NextResponse.json(
          { success: false, error: 'Each security question must use a valid question option' },
          { status: 400 }
        );
      }
      if (uniqueQuestionIds.has(questionId)) {
        return NextResponse.json(
          { success: false, error: 'Security question selections must be unique' },
          { status: 400 }
        );
      }
      if (!normalizedAnswer) {
        return NextResponse.json(
          { success: false, error: 'Each security question answer is required' },
          { status: 400 }
        );
      }
      if (normalizedAnswers.has(normalizedAnswer)) {
        return NextResponse.json(
          { success: false, error: 'Security question answers must be unique' },
          { status: 400 }
        );
      }

      uniqueQuestionIds.add(questionId);
      normalizedAnswers.add(normalizedAnswer);
    }

    const hashedSecurityQuestions = await Promise.all(
      securityQuestions.map(async (sq: { questionId: string; answer: string }) => ({
        questionId: sq.questionId,
        answerHash: await hashSecurityAnswer(sq.answer),
      }))
    );

    // Use a random temp password — user must reset via forgot-password
    const tempPassword = crypto.randomBytes(24).toString('hex');

    const newUser = await AuthUserModel.create({
      email: email.toLowerCase(),
      username: normalizedUsername,
      firstName,
      lastName,
      password: tempPassword,
      role: role === 'admin' ? 'admin' : 'user',
      securityQuestions: hashedSecurityQuestions,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
      message: 'User created successfully. They must set their password via forgot-password.',
    });

  } catch (error: any) {
    console.error('Error creating user:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
