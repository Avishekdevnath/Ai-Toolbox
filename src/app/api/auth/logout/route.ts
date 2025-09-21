import { NextRequest, NextResponse } from 'next/server';
import { UserAuthService } from '@/lib/userAuthService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 User logout attempt started');

    // Logout user (clear session cookie)
    await UserAuthService.logoutUser();

    console.log('✅ User logged out successfully');

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ User logout error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}