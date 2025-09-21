import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthUserModel } from '@/models/AuthUserModel';
import { getPendingRegistrationModel } from '@/models/PendingRegistrationModel';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, firstName, lastName, email, phoneNumber, password } = body || {};

    if (!username || !firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const User = await getAuthUserModel();
    const Pending = await getPendingRegistrationModel();

    const lowerEmail = String(email).toLowerCase();
    const lowerUsername = String(username).toLowerCase();

    // Reject if real user already exists
    const existing = await User.findOne({ $or: [{ email: lowerEmail }, { username: lowerUsername }] }).lean();
    if (existing) {
      return NextResponse.json({ success: false, message: 'User with email or username already exists' }, { status: 409 });
    }

    // Clean any expired pending entries for same identifiers
    const now = new Date();
    await Pending.deleteMany({ email: lowerEmail, otpExpiresAt: { $lt: now } });

    // If a pending exists and not yet eligible to resend, return hint
    const pendingExisting = await Pending.findOne({ email: lowerEmail }).lean();
    if (pendingExisting && pendingExisting.resendAvailableAt && new Date(pendingExisting.resendAvailableAt) > now) {
      return NextResponse.json({
        success: true,
        pendingId: String(pendingExisting._id),
        resendAvailableAt: pendingExisting.resendAvailableAt,
        message: 'OTP already sent. Please check your email or wait to resend.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpCodeHash = await bcrypt.hash(otp, 10);

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resendAvailableAt = new Date(Date.now() + 30 * 1000); // 30s cooldown

    const created = await Pending.create({
      email: lowerEmail,
      username: lowerUsername,
      firstName,
      lastName,
      phoneNumber,
      passwordHash,
      otpCodeHash,
      otpExpiresAt,
      resendAvailableAt,
      attempts: 0,
    });

    await sendOtpEmail(lowerEmail, otp);

    return NextResponse.json({ success: true, pendingId: String(created._id), resendAvailableAt });
  } catch (error: any) {
    console.error('initiate registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to initiate registration' }, { status: 500 });
  }
}
