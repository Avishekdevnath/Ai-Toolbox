import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    // Get user session using unified service
    const user = await AuthService.getSession(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Token verification failed' },
      { status: 401 }
    );
  }
} 