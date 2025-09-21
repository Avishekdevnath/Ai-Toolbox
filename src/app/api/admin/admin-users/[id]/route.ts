import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
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

    // Only super_admin can delete admin users
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

    // Prevent self-deletion
    if (user.email === adminSession.email) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Prevent deletion of super_admin users
    if (user.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete super admin users' },
        { status: 403 }
      );
    }

    // Delete admin user
    await db.collection('adminusers').deleteOne({ _id: user._id });

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting admin user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete admin user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 