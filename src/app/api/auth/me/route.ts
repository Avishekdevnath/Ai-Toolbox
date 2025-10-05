import { NextRequest, NextResponse } from 'next/server';
import { UserAuthService } from '@/lib/userAuthService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Getting current user session from:', request.url);

    // Get current user session
    const userSession = await UserAuthService.getUserSession(request);

    if (!userSession) {
      console.log('❌ No active user session found');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('✅ User session found:', userSession.email);

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: userSession.id,
        username: userSession.username,
        firstName: userSession.firstName,
        lastName: userSession.lastName,
        email: userSession.email,
        phoneNumber: userSession.phoneNumber,
        role: userSession.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error getting user session:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user session',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}