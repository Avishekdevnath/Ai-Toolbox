import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { z } from 'zod';

// Application settings validation schema
const ApplicationUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  compactMode: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  defaultTool: z.string().optional(),
  resultsPerPage: z.number().min(5).max(100).optional()
});

// PATCH - Update application settings
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
    const validatedData = ApplicationUpdateSchema.parse(body);
    
    // Update application settings
    const updatedSettings = await UserSettings.updateSettingsSection(userId, 'application', validatedData);
    
    if (!updatedSettings) {
      return NextResponse.json(
        { success: false, error: 'Failed to update application settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSettings.application,
      message: 'Application settings updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating application settings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid application data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update application settings' },
      { status: 500 }
    );
  }
} 