import { NextRequest, NextResponse } from 'next/server';
import { UserSettings } from '@/models/UserSettingsModel';
import { getAuthUserModel } from '@/models/AuthUserModel';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

// Security settings validation schema
const SecurityUpdateSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(1).max(168).optional(),
  loginNotifications: z.boolean().optional(),
  deviceManagement: z.boolean().optional()
});

// Password change validation schema
const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// PATCH - Update security settings
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
    const validatedData = SecurityUpdateSchema.parse(body);
    
    // Update security settings
    const updatedSettings = await (UserSettings as any).updateSettingsSection(claims.id, 'security', validatedData);
    
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
        { success: false, error: 'Invalid security data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}

// POST - Change password
export async function POST(request: NextRequest) {
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
    const validatedData = PasswordChangeSchema.parse(body);
    
    // Get user from database
    const User = await getAuthUserModel();
    const user = await User.findById(claims.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);
    
    // Update password
    await User.findByIdAndUpdate(claims.id, {
      passwordHash: newPasswordHash,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error: any) {
    console.error('Error changing password:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid password data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
} 