import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { z } from 'zod';

// Security settings validation schema
const SecurityUpdateSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(1).max(168).optional(),
  loginNotifications: z.boolean().optional(),
  deviceManagement: z.boolean().optional()
});

// PATCH - Update security settings
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
    const validatedData = SecurityUpdateSchema.parse(body);
    
    // Update security settings
    const updatedSettings = await UserSettings.updateSettingsSection(userId, 'security', validatedData);
    
    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: 'Failed to update security settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings.security,
      message: 'Security settings updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating security settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid security data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
} 