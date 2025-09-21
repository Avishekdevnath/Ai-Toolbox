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

    // Only super_admin can unlock admin users
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const db = await getDatabase();

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

    // Check if user is actually locked
    if (!user.lockUntil || new Date(user.lockUntil) <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'User is not locked' },
        { status: 400 }
      );
    }

    // Unlock user
    await db.collection('adminusers').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lockUntil: null,
          loginAttempts: 0,
          updatedAt: new Date() 
        } 
      }
    );

    // Get updated user
    const updatedUser = await db.collection('adminusers').findOne(
      { _id: user._id },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Admin user unlocked successfully'
    });

  } catch (error: any) {
    console.error('Error unlocking admin user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unlock admin user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 