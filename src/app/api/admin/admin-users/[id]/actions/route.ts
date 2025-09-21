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

    // Only super_admin can perform actions on admin users
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
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

    // Find admin user
    const user = await db.collection('adminusers').findOne({
      $or: [
        { _id: new ObjectId(userId) },
        { email: userId }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Prevent self-suspension
    if (user.email === adminSession.email) {
      return NextResponse.json(
        { success: false, error: 'Cannot suspend your own account' },
        { status: 403 }
      );
    }

    // Update admin user status
    const updateData = {
      isActive,
      updatedAt: new Date()
    };

    // If suspending, also clear lockUntil
    if (!isActive) {
      updateData.lockUntil = null;
    }

    await db.collection('adminusers').updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    // Get updated user
    const updatedUser = await db.collection('adminusers').findOne(
      { _id: user._id },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `Admin user ${action === 'suspend' ? 'suspended' : 'activated'} successfully`
    });

  } catch (error: any) {
    console.error('Error performing admin action:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform admin action',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 