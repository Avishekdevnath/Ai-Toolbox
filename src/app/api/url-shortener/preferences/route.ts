import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAuthService } from '@/lib/userAuthService';

interface UserPreferences {
  defaultExpirationDays?: number;
  autoGenerateAlias: boolean;
  enableAnalytics: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultTags?: string[];
  maxUrlsPerDay?: number;
  customDomain?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('user_preferences');

    // Get user preferences
    const preferences = await collection.findOne({
      userId: userSession.userId
    });

    const defaultPreferences: UserPreferences = {
      autoGenerateAlias: true,
      enableAnalytics: true,
      emailNotifications: false,
      theme: 'system',
      maxUrlsPerDay: 100
    };

    return NextResponse.json({
      success: true,
      data: preferences ? { ...defaultPreferences, ...preferences.preferences } : defaultPreferences
    });

  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const userSession = await UserAuthService.getUserSession(request);
    if (!userSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const preferences: UserPreferences = await request.json();

    // Validate preferences
    if (preferences.defaultExpirationDays && (preferences.defaultExpirationDays < 1 || preferences.defaultExpirationDays > 3650)) {
      return NextResponse.json(
        { success: false, error: 'Default expiration days must be between 1 and 3650' },
        { status: 400 }
      );
    }

    if (preferences.maxUrlsPerDay && (preferences.maxUrlsPerDay < 1 || preferences.maxUrlsPerDay > 1000)) {
      return NextResponse.json(
        { success: false, error: 'Max URLs per day must be between 1 and 1000' },
        { status: 400 }
      );
    }

    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme value' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection('user_preferences');

    // Upsert user preferences
    await collection.updateOne(
      { userId: userSession.userId },
      {
        $set: {
          userId: userSession.userId,
          preferences,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });

  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
