import { NextRequest, NextResponse } from 'next/server';
import { UserAuthService } from '@/lib/userAuthService';
import { cookies } from 'next/headers';
import { getVisitorIdFromCookieStore } from '@/lib/visitorId';
import { getVisitorIdentityModel } from '@/models/VisitorIdentityModel';
import { RateLimiter, AuthResponse, SessionValidator, authUtils } from '@/lib/authUtils';

/**
 * Enhanced Login Endpoint
 * 
 * Features:
 * - Rate limiting (5 attempts per 15 minutes)
 * - Email validation
 * - Input validation
 * - Session tracking
 * - Visitor identity linking
 * - Comprehensive error handling
 */

export async function POST(request: NextRequest) {
  try {
    const clientIp = SessionValidator.getClientIp(request);
    const body = await request.json();
    const { email, username, password } = body;

    console.log(`🔐 Login attempt from IP: ${clientIp}`);

    // Input validation
    if ((!email && !username) || !password) {
      console.warn(`❌ Invalid login attempt - missing credentials from ${clientIp}`);
      return AuthResponse.badRequest('Email/username and password are required');
    }

    // Email validation if provided
    if (email && !authUtils.isValidEmail(email)) {
      console.warn(`❌ Invalid email format from ${clientIp}`);
      return AuthResponse.badRequest('Please provide a valid email address');
    }

    // Rate limiting using email or username as identifier
    const identifier = (email || username).toLowerCase();

    // Check if account is locked
    const lockStatus = RateLimiter.getLockStatus(identifier);
    if (lockStatus.isLocked) {
      const minutesRemaining = Math.ceil(lockStatus.remainingTime / 60000);
      console.warn(`🔒 Account locked for ${identifier} - retrying in ${minutesRemaining} minutes`);
      
      return AuthResponse.tooManyRequests(
        `Too many login attempts. Please try again in ${minutesRemaining} minutes.`,
        lockStatus.remainingTime / 1000
      );
    }

    // Record login attempt
    const canAttempt = RateLimiter.recordAttempt(identifier);
    if (!canAttempt) {
      console.warn(`🔒 Rate limit exceeded for ${identifier}`);
      const lockStatus = RateLimiter.getLockStatus(identifier);
      const minutesRemaining = Math.ceil(lockStatus.remainingTime / 60000);
      
      return AuthResponse.tooManyRequests(
        `Account temporarily locked due to multiple failed attempts. Try again in ${minutesRemaining} minutes.`,
        lockStatus.remainingTime / 1000
      );
    }

    // Attempt authentication
    console.log(`📧 Authenticating user: ${email || username}`);
    
    const authResult = await UserAuthService.authenticateUser({ 
      email, 
      username, 
      password 
    });

    if (!authResult.success || !authResult.user) {
      const remainingAttempts = RateLimiter.getRemainingAttempts(identifier);
      console.warn(`❌ Authentication failed for ${identifier} - ${remainingAttempts} attempts remaining`);
      
      return AuthResponse.unauthorized(
        'Invalid email/username or password. Please try again.',
        { remainingAttempts }
      );
    }

    // Clear rate limiting on successful login
    RateLimiter.reset(identifier);
    console.log(`✅ Authentication successful for ${authResult.user.email}`);

    // Create JWT token
    const token = UserAuthService.createUserToken(authResult.user);

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Stricter CSRF protection
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Track session creation
    console.log(`🔐 Session created for ${authResult.user.email}`);

    // Link visitor identity with user (non-blocking)
    try {
      const visitorId = await getVisitorIdFromCookieStore();
      if (visitorId && authResult.user.id) {
        const VisitorIdentity = await getVisitorIdentityModel();
        const now = new Date();
        await VisitorIdentity.findOneAndUpdate(
          { visitorId },
          {
            $set: { userId: authResult.user.id.toString(), lastSeenAt: now },
            $setOnInsert: { firstSeenAt: now },
          },
          { upsert: true }
        );
        console.log(`👤 Linked visitor ${visitorId} to user ${authResult.user.id}`);
      }
    } catch (error) {
      console.error('⚠️ Failed to link visitor identity (non-blocking):', error);
      // Don't fail the login due to this error
    }

    return AuthResponse.success({
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        username: authResult.user.username,
        firstName: authResult.user.firstName || '',
        lastName: authResult.user.lastName || '',
        phoneNumber: authResult.user.phoneNumber,
        role: authResult.user.role,
      },
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    }, 'Login successful');

  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    return NextResponse.json(
      {
        error: 'LOGIN_ERROR',
        message: error.message || 'An unexpected error occurred during login',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
