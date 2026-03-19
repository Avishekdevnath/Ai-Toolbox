import { NextRequest, NextResponse } from 'next/server';
import { UserAuthService } from '@/lib/userAuthService';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 User login attempt started');
    
    const body = await request.json();
    const { email, username, password } = body;

    console.log('📧 Login attempt for:', email || username);

    // Validate input
    if ((!email && !username) || !password) {
      console.log('❌ Missing email/username or password');
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    console.log('✅ Input validation passed, attempting authentication...');

    // Authenticate user
    const authResult = await UserAuthService.authenticateUser({ email, username, password });

    console.log('🔍 Authentication result:', {
      success: authResult.success,
      error: authResult.error,
      hasUser: !!authResult.user
    });

    if (!authResult.success || !authResult.user) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful, creating JWT token...');

    // Create JWT token
    const token = UserAuthService.createUserToken(authResult.user);

    console.log('✅ JWT token created, setting session cookie...');

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    console.log('✅ Session cookie set, returning success response');

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        username: authResult.user.username,
        firstName: authResult.user.firstName || '',
        lastName: authResult.user.lastName || '',
        phoneNumber: authResult.user.phoneNumber,
        role: authResult.user.role,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ User login error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
