import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, userIds, ...actionData } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Validate user IDs
    const validUserIds = userIds.filter(id => ObjectId.isValid(id));
    if (validUserIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid user IDs provided' },
        { status: 400 }
      );
    }

    let updateFields: any = { updatedAt: new Date() };
    let operationResult: any = {};

    // Handle different bulk actions
    switch (action) {
      case 'activate':
        updateFields.isActive = true;
        operationResult = await db.collection('users').updateMany(
          { _id: { $in: validUserIds.map(id => new ObjectId(id)) } },
          { $set: updateFields }
        );
        break;

      case 'deactivate':
        updateFields.isActive = false;
        operationResult = await db.collection('users').updateMany(
          { _id: { $in: validUserIds.map(id => new ObjectId(id)) } },
          { $set: updateFields }
        );
        break;

      case 'update_role':
        if (!actionData.role) {
          return NextResponse.json(
            { success: false, error: 'Role is required for update_role action' },
            { status: 400 }
          );
        }
        updateFields.role = actionData.role;
        operationResult = await db.collection('users').updateMany(
          { _id: { $in: validUserIds.map(id => new ObjectId(id)) } },
          { $set: updateFields }
        );
        break;

      case 'delete':
        // Only super_admin can delete users
        if (adminUser.role !== 'super_admin') {
          return NextResponse.json(
            { success: false, error: 'Insufficient permissions for bulk delete' },
            { status: 403 }
          );
        }

        // Check if any of the users are admins
        const usersToDelete = await db.collection('users').find({
          _id: { $in: validUserIds.map(id => new ObjectId(id)) }
        }).toArray();

        const adminUsers = usersToDelete.filter(user => 
          user.role === 'admin' || user.role === 'super_admin'
        );

        if (adminUsers.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Cannot delete admin users' },
            { status: 403 }
          );
        }

        operationResult = await db.collection('users').deleteMany({
          _id: { $in: validUserIds.map(id => new ObjectId(id)) }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log activity
    await db.collection('adminactivities').insertOne({
      adminId: new ObjectId(decoded.id),
      type: 'bulk_action',
      action: `bulk_${action}`,
      details: { 
        action, 
        userIds: validUserIds, 
        affectedCount: operationResult.modifiedCount || operationResult.deletedCount,
        ...actionData 
      },
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      affectedCount: operationResult.modifiedCount || operationResult.deletedCount || 0
    });

  } catch (error) {
    console.error('Bulk user operation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
} 