import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { z } from 'zod';

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
    // Assuming admin authentication is handled elsewhere or removed
    // For now, we'll simulate a successful auth for demonstration
    const userId = 'admin_user_id'; // Replace with actual admin user ID
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = NotificationUpdateSchema.parse(body);
    
    // Update notification settings
    const updatedSettings = await UserSettings.updateSettingsSection(userId, 'notifications', validatedData);
    
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