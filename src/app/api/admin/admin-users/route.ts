import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication - try both admin and user sessions
    let adminSession = await AdminAuthService.getAdminSession(request);
    
    // If no admin session, try user session with admin role
    if (!adminSession) {
      const { getAuthCookie } = await import('@/lib/auth/cookies');
      const { verifyAccessToken } = await import('@/lib/auth/jwt');
      
      const token = await getAuthCookie();
      const claims = token ? verifyAccessToken(token) : null;
      
      if (claims && (claims.role === 'admin' || claims.role === 'super_admin')) {
        adminSession = {
          id: claims.id,
          email: claims.email,
          role: claims.role,
          permissions: ['manage_users', 'manage_tools', 'view_analytics', 'manage_system', 'manage_content', 'view_audit_logs', 'view_dashboard', 'manage_settings'],
          firstName: claims.name.split(' ')[0] || '',
          lastName: claims.name.split(' ').slice(1).join(' ') || '',
          isActive: true,
          lastLoginAt: new Date(),
        };
      }
    }
    
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin or super_admin can view admin users
    if (adminSession.role !== 'admin' && adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const db = await getDatabase();
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (status === 'active') {
        query.isActive = true;
        query.$or = [
          { lockUntil: { $exists: false } },
          { lockUntil: { $lt: new Date() } }
        ];
      } else if (status === 'inactive') {
        query.isActive = false;
      } else if (status === 'locked') {
        query.lockUntil = { $gt: new Date() };
      }
    }

    if (role) {
      query.role = role;
    }

    // Get total count
    const totalUsers = await db.collection('adminusers').countDocuments(query);

    // Get admin users
    const adminUsers = await db.collection('adminusers')
      .find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Remove password field from all users
    const sanitizedUsers = adminUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        adminUsers: sanitizedUsers,
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
    console.error('Error fetching admin users:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch admin users',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication - try both admin and user sessions
    let adminSession = await AdminAuthService.getAdminSession(request);
    
    // If no admin session, try user session with admin role
    if (!adminSession) {
      const { getAuthCookie } = await import('@/lib/auth/cookies');
      const { verifyAccessToken } = await import('@/lib/auth/jwt');
      
      const token = await getAuthCookie();
      const claims = token ? verifyAccessToken(token) : null;
      
      if (claims && (claims.role === 'admin' || claims.role === 'super_admin')) {
        adminSession = {
          id: claims.id,
          email: claims.email,
          role: claims.role,
          permissions: ['manage_users', 'manage_tools', 'view_analytics', 'manage_system', 'manage_content', 'view_audit_logs', 'view_dashboard', 'manage_settings'],
          firstName: claims.name.split(' ')[0] || '',
          lastName: claims.name.split(' ').slice(1).join(' ') || '',
          isActive: true,
          lastLoginAt: new Date(),
        };
      }
    }
    
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can create admin users
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions - Super admin required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, firstName, lastName, role, permissions } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if email already exists
    const existingUser = await db.collection('adminusers').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const newAdminUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      permissions: permissions || [],
      isActive: true,
      loginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('adminusers').insertOne(newAdminUser);

    // Get created user (without password)
    const createdUser = await db.collection('adminusers').findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      data: createdUser,
      message: 'Admin user created successfully'
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create admin user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 