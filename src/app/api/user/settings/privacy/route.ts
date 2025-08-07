import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { z } from 'zod';

// Privacy settings validation schema
const PrivacyUpdateSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
  shareAnalytics: z.boolean().optional(),
  allowDataCollection: z.boolean().optional(),
  showUsageStats: z.boolean().optional()
});

// PATCH - Update privacy settings
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = PrivacyUpdateSchema.parse(body);
    
    // Update privacy settings
    const updatedSettings = await UserSettings.updateSettingsSection(userId, 'privacy', validatedData);
    
    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: 'Failed to update privacy settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings.privacy,
      message: 'Privacy settings updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating privacy settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid privacy data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
} 