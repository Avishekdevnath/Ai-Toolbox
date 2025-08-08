import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const user = await AuthService.getSession(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 