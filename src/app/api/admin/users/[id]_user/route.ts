import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const isAdmin = claims?.role === 'admin' || claims?.role === 'super_admin';
    
    if (!claims || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { action, isActive, name, email, role } = body;

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    if (action === 'activate' || action === 'deactivate') {
      updateData.isActive = isActive;
      updateData.updatedAt = new Date();
    } else if (action === 'update_profile') {
      // Handle profile update
      if (name) updateData.name = name;
      if (email) {
        // Check if email is already taken by another user
        const emailExists = await db.collection('users').findOne({ 
          email: email.toLowerCase(),
          _id: { $ne: new ObjectId(userId) }
        });
        if (emailExists) {
          return NextResponse.json(
            { success: false, error: 'Email already exists' },
            { status: 409 }
          );
        }
        updateData.email = email.toLowerCase();
      }
      if (role) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      updateData.updatedAt = new Date();
    }

    // Update user
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action === 'update_profile' ? 'updated' : action} successful`
    });

  } catch (error) {
    console.error('User action API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const isAdmin = claims?.role === 'admin' || claims?.role === 'super_admin';
    
    if (!claims || !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Delete user
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('User delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 