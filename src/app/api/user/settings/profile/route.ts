import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Profile settings validation schema
const ProfileUpdateSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko']).optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional()
});

// GET - Fetch profile settings
export async function GET(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const settings = await UserSettings.getUserSettings(claims.id);

    return NextResponse.json({
      success: true,
      data: settings?.profile || {
        displayName: '',
        bio: '',
        avatar: '',
        timezone: 'UTC',
        language: 'en',
        dateFormat: 'MM/DD/YYYY'
      }
    });

  } catch (error: any) {
    console.error('Error fetching profile settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update profile settings
export async function PATCH(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = ProfileUpdateSchema.parse(body);

    await connectToDatabase();

    const updatedSettings = await UserSettings.updateSettingsSection(claims.id, 'profile', validatedData);

    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings.profile,
      message: 'Profile settings updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating profile settings:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid profile data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update profile settings' },
      { status: 500 }
    );
  }
} 