import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get maintenance mode status from system settings
    const settings = await db.collection('systemsettings').findOne({
      key: 'maintenance_mode'
    });

    const maintenanceMode = settings?.value?.enabled || false;

    return NextResponse.json({
      success: true,
      maintenanceMode
    });

  } catch (error) {
    console.error('Maintenance status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get maintenance status' },
      { status: 500 }
    );
  }
} 