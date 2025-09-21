import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import mongoose from 'mongoose';
import { getDatabase } from '@/lib/mongodb';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can modify roles
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const roleId = id;
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !description || !permissions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const db = await getDatabase();

    // Check if role exists
    const existingRole = await db.collection('roles').findOne({ _id: roleId });
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Update role
    const updatedRole = await db.collection('roles').findOneAndUpdate(
      { _id: roleId },
      {
        $set: {
          name,
          description,
          permissions,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });

  } catch (error: any) {
    console.error('Error updating role:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update role',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Check admin authentication
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only super_admin can delete roles
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const roleId = id;

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const db = await getDatabase();

    // Check if role exists and is not a system role
    const existingRole = await db.collection('roles').findOne({ _id: roleId });
    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.isSystem) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete system roles' },
        { status: 400 }
      );
    }

    // Check if any users are using this role
    const usersWithRole = await db.collection('users').countDocuments({ role: roleId });
    if (usersWithRole > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete role. ${usersWithRole} users are currently using this role.` },
        { status: 400 }
      );
    }

    // Delete role
    await db.collection('roles').deleteOne({ _id: roleId });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting role:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete role',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 