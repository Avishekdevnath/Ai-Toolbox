import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Notification settings validation schema
const NotificationUpdateSchema = z.object({
  email: z.object({
    analysisResults: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    systemUpdates: z.boolean().optional(),
    marketing: z.boolean().optional()
  }).optional(),
  push: z.object({
    analysisComplete: z.boolean().optional(),
    newFeatures: z.boolean().optional(),
    reminders: z.boolean().optional()
  }).optional(),
  frequency: z.enum(['immediate', 'daily', 'weekly']).optional()
});

// PATCH - Update notification settings
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    
    if (!claims?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = NotificationUpdateSchema.parse(body);
    
    // Update notification settings
    const updatedSettings = await UserSettings.updateSettingsSection(claims.id, 'notifications', validatedData);
    
    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings.notifications,
      message: 'Notification settings updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating notification settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
} 