import { NextRequest } from 'next/server';
import { SessionValidator, AuthResponse, requireAuth } from '@/lib/authUtils';

/**
 * Session Validation Endpoint
 * 
 * Returns current session information and validates token
 * Protected route - requires valid authentication
 */

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const result = await requireAuth(request);

    // Check if result is an error response (NextResponse instance)
    if (result instanceof Response) {
      return result;
    }

    // Session is valid, return session data
    return AuthResponse.success({
      valid: true,
      session: {
        userId: result.userId,
        email: result.email,
        role: result.role,
        createdAt: new Date(result.createdAt).toISOString(),
        expiresAt: new Date(result.expiresAt).toISOString(),
        remainingTime: result.expiresAt - Date.now(),
      },
    }, 'Session is valid');

  } catch (error) {
    console.error('Error validating session:', error);
    return AuthResponse.unauthorized('Failed to validate session');
  }
}
