import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PaginationSchema, UserCreateSchema } from '@/lib/validation/adminSchemas';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUsersHandler(request: NextRequest) {
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

    // Check if admin has user management permission
    if (!adminUser.permissions.includes('manage_users')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    try {
      const validatedParams = PaginationSchema.parse(queryParams);
      const { page, limit, search, role } = validatedParams;

      // Build query
      const query: any = {};
      
      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }

      if (role !== 'all') {
        query.role = role;
      }

      // Get total count
      const totalUsers = await db.collection('users').countDocuments(query);
      const totalPages = Math.ceil(totalUsers / limit);

      // Get users with pagination
      const users = await db.collection('users')
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      // Get usage statistics for each user
      const usersWithUsage = await Promise.all(
        users.map(async (user) => {
          const usageCount = await db.collection('toolusage')
            .countDocuments({ userId: user._id.toString() });
          
          return {
            ...user,
            totalUsage: usageCount
          };
        })
      );

      // Log activity
      await db.collection('adminactivities').insertOne({
        adminId: new ObjectId(decoded.id),
        type: 'viewed',
        action: 'user_list',
        details: { page, limit, search, role, totalUsers },
        createdAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: {
          users: usersWithUsage,
          pagination: {
            page,
            limit,
            totalUsers,
            totalPages
          }
        }
      });
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: validationError.errors || validationError.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

async function createUserHandler(request: NextRequest) {
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

    // Only super_admin can create users
    if (adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validatedData = UserCreateSchema.parse(body);
    const { email, firstName, lastName, role, password, status } = validatedData;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with proper schema
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
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

    // Log activity
    await db.collection('adminactivities').insertOne({
      adminId: new ObjectId(decoded.id),
      type: 'created',
      action: 'user',
      details: { userId: result.insertedId, email, role },
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: createdUser,
      message: 'User created successfully'
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed: ' + error.errors.map((e: any) => e.message).join(', '),
        status: 400
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// Export handlers directly without validation middleware
export const GET = getUsersHandler;
export const POST = createUserHandler; 