import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';

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

    // Authenticate admin using new service
    const authResult = await AdminAuth.authenticateAdmin(email, password);

    console.log('🔍 Authentication result:', {
      success: authResult.success,
      error: authResult.error,
      hasAdmin: !!authResult.admin
    });

    if (!authResult.success || !authResult.admin) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log('✅ Authentication successful, creating JWT token...');

    // Create JWT token
    const token = AdminAuth.createToken(authResult.admin);

    console.log('✅ JWT token created, logging activity...');

    // Log admin activity
    await AdminAuth.logActivity(
      authResult.admin.id,
      'login',
      'admin_dashboard',
      { ipAddress: request.headers.get('x-forwarded-for') || 'unknown' }
    );

    console.log('✅ Activity logged, returning success response');

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token: token, // Return token for client-side storage
      admin: {
        id: authResult.admin.id,
        email: authResult.admin.email,
        role: authResult.admin.role,
        firstName: authResult.admin.firstName,
        lastName: authResult.admin.lastName,
        permissions: authResult.admin.permissions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Admin login error:', error);
    
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