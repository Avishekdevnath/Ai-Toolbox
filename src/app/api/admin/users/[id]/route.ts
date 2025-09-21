import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import mongoose from 'mongoose';
import { getDatabase } from '@/lib/mongodb';
import { AdminActivity } from '@/models/AdminActivityModel';

export async function GET(
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

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id: userId } = await params;
    const db = await getDatabase();

    // Find user by ID or clerkId or email
    const user = await db.collection('users').findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { clerkId: userId },
        { email: userId }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user activity data
    const userActivity = await AdminActivity.find({
      $or: [
        { 'details.userId': user.clerkId || user._id.toString() },
        { 'details.userEmail': user.email }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Get user tool usage statistics
    const toolUsage = await mongoose.connection.db.collection('toolusages').aggregate([
      {
        $match: {
          $or: [
            { userId: user.clerkId || user._id.toString() },
            { userEmail: user.email }
          ]
        }
      },
      {
        $group: {
          _id: '$toolSlug',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    const enhancedUser = {
      ...user,
      activity: userActivity,
      toolUsage: toolUsage
    };

    return NextResponse.json({
      success: true,
      data: enhancedUser
    });

  } catch (error: any) {
    console.error('Error fetching user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { firstName, lastName, role, status, email } = body;
    const db = await getDatabase();

    // Find user by ID or clerkId
    const user = await db.collection('users').findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { clerkId: userId },
        { email: userId }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Store original values for audit log
    const originalValues = {
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      email: user.email
    };

    // Build update object
    const updateData: any = {
      updatedAt: new Date()
    };

    if (firstName !== undefined || lastName !== undefined) {
      const currentName = user.name || '';
      const currentParts = currentName.split(' ');
      const newFirstName = firstName !== undefined ? firstName : currentParts[0] || '';
      const newLastName = lastName !== undefined ? lastName : currentParts.slice(1).join(' ') || '';
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }

    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.isActive = status === 'active';
    if (email !== undefined) updateData.email = email.toLowerCase();

    // Update user
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    // Get updated user
    const updatedUser = await db.collection('users').findOne({ _id: user._id });

    // Log admin activity
    await AdminActivity.create({
      adminId: adminSession.id,
      adminEmail: adminSession.email,
      adminRole: adminSession.role,
      action: 'updated',
      resource: 'user',
      resourceId: user._id.toString(),
      details: {
        before: originalValues,
        after: {
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          email: updatedUser.email
        },
        changes: body
      },
      status: 'success'
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

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

    // Only super_admin can delete users
    if (adminSession.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id: userId } = await params;
    const db = await getDatabase();

    // Find user by ID or clerkId
    const user = await db.collection('users').findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { clerkId: userId },
        { email: userId }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users
    if (user.role === 'super_admin' || user.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Soft delete - set status to deleted
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          isActive: false,
          status: 'deleted',
          updatedAt: new Date() 
        } 
      }
    );

    // Log admin activity
    await AdminActivity.create({
      adminId: adminSession.id,
      adminEmail: adminSession.email,
      adminRole: adminSession.role,
      action: 'deleted',
      resource: 'user',
      resourceId: user._id.toString(),
      details: {
        before: {
          isActive: true,
          email: user.email,
          role: user.role
        },
        after: {
          isActive: false,
          status: 'deleted'
        },
        reason: 'Admin deletion'
      },
      status: 'success'
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 