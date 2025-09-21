import { NextRequest, NextResponse } from 'next/server';
import { UserAuthService } from '@/lib/userAuthService';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 User registration attempt started');
    
    const body = await request.json();
    const { email, username, password, name, firstName, lastName } = body;

    console.log('📧 Registration attempt for email:', email, 'username:', username);

    // Validate input
    if (!email || !password || !name) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    console.log('✅ Input validation passed, attempting registration...');

    // Register user
    const result = await UserAuthService.registerUser({
      email,
      username,
      password,
      name,
      firstName,
      lastName
    });

    console.log('🔍 Registration result:', {
      success: result.success,
      error: result.error,
      hasUser: !!result.user
    });

    if (!result.success || !result.user) {
      console.log('❌ Registration failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Registration failed' },
        { status: 400 }
      );
    }

    console.log('✅ Registration successful, creating JWT token...');

    // Create JWT token
    const token = UserAuthService.createUserToken(result.user);

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
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        name: result.user.name,
        role: result.user.role,
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ User registration error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed',
        message: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}