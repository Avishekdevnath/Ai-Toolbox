import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
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

    const { userId } = params;

    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user details with enhanced search
    const user = await db.collection('users').findOne({
      $or: [
        { _id: new ObjectId(userId) },
        { email: userId }
      ]
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user usage statistics
    const usageCount = await db.collection('toolusage')
      .countDocuments({ userId: userId });

    // Get user activity data
    const userActivity = await db.collection('adminactivities')
      .find({
        $or: [
          { 'details.userId': userId },
          { 'details.userEmail': user.email }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get user tool usage breakdown
    const toolUsage = await db.collection('toolusage')
      .aggregate([
        {
          $match: {
            userId: userId
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

    const userWithStats = {
      ...user,
      totalUsage: usageCount,
      activity: userActivity,
      toolUsage: toolUsage
    };

    return NextResponse.json({
      success: true,
      user: userWithStats
    });

  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
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

    const { userId } = params;
    const body = await request.json();
    const { action, ...updateData } = body;

    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let updateFields: any = { updatedAt: new Date() };

    // Handle different actions
    switch (action) {
      case 'activate':
        updateFields.isActive = true;
        updateFields.status = 'active';
        break;
      case 'deactivate':
        updateFields.isActive = false;
        updateFields.status = 'suspended';
        break;
      case 'suspend':
        updateFields.isActive = false;
        updateFields.status = 'suspended';
        break;
      case 'update_role':
        if (!updateData.role) {
          return NextResponse.json(
            { success: false, error: 'Role is required' },
            { status: 400 }
          );
        }
        updateFields.role = updateData.role;
        break;
      case 'update_profile':
        if (updateData.firstName) updateFields.firstName = updateData.firstName;
        if (updateData.lastName) updateFields.lastName = updateData.lastName;
        if (updateData.email) {
          // Check if email is already taken
          const emailExists = await db.collection('users').findOne({ 
            email: updateData.email.toLowerCase(),
            _id: { $ne: new ObjectId(userId) }
          });
          if (emailExists) {
            return NextResponse.json(
              { success: false, error: 'Email already exists' },
              { status: 409 }
            );
          }
          updateFields.email = updateData.email.toLowerCase();
        }
        break;
      case 'reset_password':
        if (!updateData.password) {
          return NextResponse.json(
            { success: false, error: 'Password is required' },
            { status: 400 }
          );
        }
        const hashedPassword = await bcrypt.hash(updateData.password, 12);
        updateFields.password = hashedPassword;
        updateFields['security.lastPasswordChange'] = new Date();
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Prevent super_admin from being modified by non-super_admin
    if (existingUser.role === 'super_admin' && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can modify super admin users' },
        { status: 403 }
      );
    }

    // Prevent admin from being modified by non-super_admin
    if (existingUser.role === 'admin' && adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super admins can modify admin users' },
        { status: 403 }
      );
    }

    // Prevent self-modification for critical actions
    if (existingUser.email === adminUser.email && ['suspend', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify your own account status' },
        { status: 403 }
      );
    }

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Log activity
    await db.collection('adminactivities').insertOne({
      adminId: new ObjectId(decoded.id),
      type: 'updated',
      action: 'user',
      details: { userId, action, ...updateData },
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
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

    // Only super_admin can delete users
    if (adminUser.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { userId } = params;

    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin users
    if (existingUser.role === 'admin' || existingUser.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (existingUser.email === adminUser.email) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Delete user
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Log activity
    await db.collection('adminactivities').insertOne({
      adminId: new ObjectId(decoded.id),
      type: 'deleted',
      action: 'user',
      details: { userId, userEmail: existingUser.email },
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('User delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 