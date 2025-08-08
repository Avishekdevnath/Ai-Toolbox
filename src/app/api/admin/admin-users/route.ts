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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';

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

    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Get total count
    const totalAdmins = await db.collection('adminusers').countDocuments(query);
    const totalPages = Math.ceil(totalAdmins / limit);

    // Get admins with pagination
    const admins = await db.collection('adminusers')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Format admin data
    const formattedAdmins = admins.map(admin => ({
      _id: admin._id.toString(),
      email: admin.email,
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      role: admin.role || 'admin',
      permissions: admin.permissions || [],
      isActive: admin.isActive !== false,
      loginAttempts: admin.loginAttempts || 0,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        admins: formattedAdmins,
        pagination: {
          page,
          limit,
          totalAdmins,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { email, firstName, lastName, role, password, permissions } = body;

    // Check if admin already exists
    const existingAdmin = await db.collection('adminusers').findOne({
      email: email.toLowerCase()
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    // Create new admin
    const newAdmin = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: role || 'admin',
      permissions: permissions || ['basic_access'],
      isActive: true,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('adminusers').insertOne(newAdmin);

    return NextResponse.json({
      success: true,
      data: { ...newAdmin, _id: result.insertedId },
      message: 'Admin user created successfully'
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 