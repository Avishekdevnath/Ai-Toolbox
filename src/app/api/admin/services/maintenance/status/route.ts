import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Get maintenance status from system settings
    const settings = await db.collection('systemsettings').findOne({});
    
    const maintenanceMode = settings?.maintenanceMode || false;

    return NextResponse.json({
      success: true,
      maintenanceMode
    });

  } catch (error) {
    console.error('Maintenance status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 