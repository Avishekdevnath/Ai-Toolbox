import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin is updating their own profile or has permission
    if (adminSession.id !== params.id && !AdminAuth.hasPermission(adminSession, 'manage_admins')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email } = body;

    // Validate input
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Check if email is already taken by another admin
    const existingAdmin = await db.collection('adminusers').findOne({
      email: email.toLowerCase(),
      _id: { $ne: params.id }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Email is already taken' },
        { status: 400 }
      );
    }

    // Update admin profile
    const result = await db.collection('adminusers').updateOne(
      { _id: params.id },
      {
        $set: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Log activity
    await AdminAuth.logActivity(
      adminSession.id,
      'update_profile',
      'admin_profile',
      { adminId: params.id, fields: ['firstName', 'lastName', 'email'] }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName,
        lastName,
        email: email.toLowerCase()
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 