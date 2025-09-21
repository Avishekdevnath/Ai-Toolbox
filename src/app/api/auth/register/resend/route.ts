import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPendingRegistrationModel } from '@/models/PendingRegistrationModel';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pendingId } = body || {};

    if (!pendingId) {
      return NextResponse.json({ success: false, message: 'pendingId is required' }, { status: 400 });
    }

    const Pending = await getPendingRegistrationModel();
    const pending = await Pending.findById(pendingId);
    if (!pending) {
      return NextResponse.json({ success: false, message: 'Pending registration not found' }, { status: 404 });
    }

    const now = new Date();
    if (pending.resendAvailableAt && pending.resendAvailableAt > now) {
      return NextResponse.json({ success: false, message: 'Please wait before resending OTP', resendAvailableAt: pending.resendAvailableAt }, { status: 429 });
    }

    // Regenerate OTP and update expiry + cooldown
    const otp = generateOtp();
    pending.otpCodeHash = await bcrypt.hash(otp, 10);
    pending.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    pending.resendAvailableAt = new Date(Date.now() + 30 * 1000);
    await pending.save();

    await sendOtpEmail(pending.email, otp);

    return NextResponse.json({ success: true, resendAvailableAt: pending.resendAvailableAt });
  } catch (error: any) {
    console.error('resend otp error:', error);
    return NextResponse.json({ success: false, message: 'Failed to resend OTP' }, { status: 500 });
  }
}
