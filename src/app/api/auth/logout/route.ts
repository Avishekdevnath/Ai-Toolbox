import { NextRequest } from 'next/server';
import { UserAuthService } from '@/lib/userAuthService';
import { AuthResponse, SessionValidator } from '@/lib/authUtils';
import { cookies } from 'next/headers';

/**
 * Enhanced Logout Endpoint
 * 
 * Features:
 * - Secure session clearing
 * - IP logging for security audit
 * - Proper cookie expiration
 * - Session cleanup
 */

export async function POST(request: NextRequest) {
  try {
    const clientIp = SessionValidator.getClientIp(request);
    console.log(`🔓 Logout initiated from IP: ${clientIp}`);

    // Logout user (clear session cookie)
    await UserAuthService.logoutUser();

    // Additional security: explicitly clear the session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/',
    });

    console.log(`✅ User logged out successfully from IP: ${clientIp}`);

    return AuthResponse.success(
      { loggedOutAt: new Date().toISOString() },
      'Logout successful'
    );

  } catch (error: any) {
    console.error('❌ Logout error:', error);
    return AuthResponse.badRequest('Logout failed');
  }
}