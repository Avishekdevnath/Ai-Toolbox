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
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Enabled status is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Update maintenance mode status
    await db.collection('systemsettings').updateOne(
      { key: 'maintenance_mode' },
      {
        $set: {
          key: 'maintenance_mode',
          value: { enabled },
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Log activity
    await AdminAuth.logActivity(
      adminSession.id,
      'toggle_maintenance_mode',
      'service_management',
      { enabled }
    );

    return NextResponse.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Maintenance toggle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle maintenance mode' },
      { status: 500 }
    );
  }
} 