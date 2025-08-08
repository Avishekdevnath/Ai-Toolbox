import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔐 Signin attempt for:', email);

    // Authenticate user using unified service
    const authResult = await AuthService.authenticate(email, password);

    if (!authResult.success || !authResult.session) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful, setting cookie...');

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: authResult.session.user,
      token: authResult.session.token // Ensure token is returned
    });

    // Set secure cookie
    response.cookies.set('authToken', authResult.session.token, {
      httpOnly: false, // Changed to false for debugging
      secure: false, // Changed to false for development
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log('🍪 Cookie set successfully');

    return response;

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 