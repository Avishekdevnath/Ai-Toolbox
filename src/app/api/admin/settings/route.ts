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

    // Get system settings
    const settings = await db.collection('systemsettings').findOne({});

    // Return default settings if none exist
    const defaultSettings = {
      siteName: 'AI Toolbox',
      siteDescription: 'Your Ultimate AI Tools Collection',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      maxFileSize: 10,
      sessionTimeout: 1440, // 24 hours in minutes
      lastUpdated: new Date().toISOString()
    };

    const result = settings || defaultSettings;

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();

    // Update settings
    const result = await db.collection('systemsettings').updateOne(
      {}, // Update the first (and only) document
      {
        $set: {
          ...body,
          lastUpdated: new Date().toISOString()
        }
      },
      { upsert: true } // Create if doesn't exist
    );

    return NextResponse.json({
      success: true,
      data: { updated: result.modifiedCount > 0 || result.upsertedCount > 0 }
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 