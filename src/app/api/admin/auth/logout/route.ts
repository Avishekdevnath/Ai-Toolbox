import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully'
    });

    // Clear the unified user session cookie (current system)
    response.cookies.set('user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    // Backward compatibility: also clear legacy admin_session cookie if present
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Error during admin logout:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to logout',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 