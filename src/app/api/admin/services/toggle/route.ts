import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin has service management permission
    if (!AdminAuth.hasPermission(adminSession, 'manage_services')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { toolId, status } = body;

    if (!toolId || !status) {
      return NextResponse.json(
        { success: false, error: 'Tool ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'maintenance', 'disabled', 'deprecated'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Update tool status
    const result = await db.collection('tools').updateOne(
      { _id: toolId },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Log activity
    await AdminAuth.logActivity(
      adminSession.id,
      'toggle_tool_status',
      'service_management',
      { toolId, status }
    );

    return NextResponse.json({
      success: true,
      message: 'Tool status updated successfully'
    });

  } catch (error) {
    console.error('Tool toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tool status' },
      { status: 500 }
    );
  }
} 