import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { email, password, name, firstName, lastName } = validationResult.data;

    // Create user using unified service
    const authResult = await AuthService.createUser({
      email,
      password,
      name,
      firstName,
      lastName
    });

    if (!authResult.success || !authResult.session) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: authResult.session.user,
      token: authResult.session.token,
      message: 'User account created successfully'
    });

    // Set secure cookie
    response.cookies.set('authToken', authResult.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 