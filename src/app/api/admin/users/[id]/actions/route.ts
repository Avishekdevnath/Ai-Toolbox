import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !['suspend', 'activate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "suspend" or "activate"' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const isActive = action === 'activate';

    // Try to find user in regular users collection first
    let user = await db.collection('users').findOne({
      $or: [
        { _id: new ObjectId(userId) },
        { clerkId: userId },
        { email: userId }
      ]
    });

    let collectionName = 'users';
    let userType = 'regular user';

    // If not found in users, try adminusers collection
    if (!user) {
      user = await db.collection('adminusers').findOne({
        $or: [
          { _id: new ObjectId(userId) },
          { email: userId }
        ]
      });
      
      if (user) {
        collectionName = 'adminusers';
        userType = 'admin user';
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent super_admin from being suspended by non-super_admin
    if (user.role === 'super_admin' && adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can suspend other super admins' },
        { status: 403 }
      );
    }

    // Prevent admin from being suspended by non-super_admin
    if (user.role === 'admin' && adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can suspend admin users' },
        { status: 403 }
      );
    }

    // Prevent self-suspension
    if (user.email === adminSession.email) {
      return NextResponse.json(
        { success: false, error: 'Cannot suspend your own account' },
        { status: 403 }
      );
    }

    // Update user status
    const updateData = {
      isActive,
      updatedAt: new Date()
    };

    // For regular users, also update status field
    if (collectionName === 'users') {
      updateData.status = isActive ? 'active' : 'suspended';
    }

    await db.collection(collectionName).updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    // Get updated user
    const updatedUser = await db.collection(collectionName).findOne({ _id: user._id });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `${userType} ${action === 'suspend' ? 'suspended' : 'activated'} successfully`
    });

  } catch (error: any) {
    console.error('Error performing user action:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform user action',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 