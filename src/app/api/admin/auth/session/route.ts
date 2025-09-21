import { NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';

export async function GET() {
  try {
    // Get admin session from cookies
    const adminSession = await AdminAuthService.getAdminSession();
    
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: adminSession.id,
        email: adminSession.email,
        role: adminSession.role,
        permissions: adminSession.permissions,
        firstName: adminSession.firstName,
        lastName: adminSession.lastName,
        isActive: adminSession.isActive,
        lastLoginAt: adminSession.lastLoginAt,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting admin session:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get session',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 