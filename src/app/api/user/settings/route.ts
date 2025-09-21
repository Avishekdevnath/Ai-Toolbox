import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { UserSettings } from '@/models/UserSettingsModel';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';
import { userSettingsSchema } from '@/lib/validation/userSettingsValidation';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await connectToDatabase();
      const settings = await UserSettings.getUserSettings(claims.id);
      return NextResponse.json({ success: true, data: settings });
    } catch (dbError) {
      console.error('Database error, returning default settings:', dbError);
      // Return default settings when database is unavailable
      const defaultSettings = await UserSettings.getUserSettings(claims.id);
      return NextResponse.json({ 
        success: true, 
        data: defaultSettings,
        note: 'Using default settings due to database connection issues'
      });
    }
  } catch (error: any) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch settings',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = userSettingsSchema.parse(body);

    try {
      await connectToDatabase();
      const updatedSettings = await UserSettings.updateUserSettings(claims.id, validatedData);
      return NextResponse.json({ success: true, data: updatedSettings });
    } catch (dbError) {
      console.error('Database error during update:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update settings due to database connection issues',
        details: dbError.message 
      }, { status: 503 });
    }
  } catch (error: any) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update settings',
      details: error.message 
    }, { status: 500 });
  }
} 