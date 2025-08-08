import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin login attempt started');
    
    const body = await request.json();
    const { email, password } = body;

    console.log('📧 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('✅ Input validation passed, attempting authentication...');

    // Authenticate using unified service
    const authResult = await AuthService.authenticate(email, password);

    console.log('🔍 Authentication result:', {
      success: authResult.success,
      error: authResult.error,
      hasUser: !!authResult.session?.user,
      isAdmin: authResult.session?.user.isAdmin
    });

    if (!authResult.success || !authResult.session) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!authResult.session.user.isAdmin) {
      console.log('❌ User is not an admin');
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    console.log('✅ Admin authentication successful');

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: authResult.session.user,
      token: authResult.session.token
    });

    // Set secure cookie for admin
    response.cookies.set('adminToken', authResult.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Also set the unified auth token
    response.cookies.set('authToken', authResult.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log('✅ Admin login completed successfully');

    return response;

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 