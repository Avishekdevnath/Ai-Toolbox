import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email address is required' 
      }, { status: 400 });
    }

    console.log('🔐 Forgot password request for:', email);

    const db = await getDatabase();
    
    // Find user by email
    const user = await db.collection('authusers').findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      console.log('🔐 User not found for email:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, we\'ve sent a password reset link.' 
      });
    }

    console.log('🔐 User found, generating reset token for:', user.email);

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15) + 
                      Date.now().toString(36);
    
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await db.collection('password_reset_tokens').insertOne({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: tokenExpiry,
      createdAt: new Date(),
      used: false
    });

    console.log('🔐 Reset token stored for user:', user.email);

    // Send password reset email
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(user.email, user.firstName || user.username || 'User', resetUrl);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    // Clean up expired tokens
    await db.collection('password_reset_tokens').deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, we\'ve sent a password reset link.' 
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
