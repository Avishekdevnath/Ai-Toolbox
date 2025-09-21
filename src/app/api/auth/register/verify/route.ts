import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPendingRegistrationModel } from '@/models/PendingRegistrationModel';
import { getAuthUserModel } from '@/models/AuthUserModel';
import { signAccessToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pendingId, otp } = body || {};

    if (!pendingId || !otp) {
      return NextResponse.json({ success: false, message: 'pendingId and otp are required' }, { status: 400 });
    }

    const Pending = await getPendingRegistrationModel();
    const pending = await Pending.findById(pendingId);
    if (!pending) {
      return NextResponse.json({ success: false, message: 'Pending registration not found' }, { status: 404 });
    }

    const now = new Date();
    if (pending.otpExpiresAt < now) {
      await Pending.deleteOne({ _id: pending._id });
      return NextResponse.json({ success: false, message: 'OTP expired. Please restart registration.' }, { status: 400 });
    }

    if (pending.attempts >= 3) {
      await Pending.deleteOne({ _id: pending._id });
      return NextResponse.json({ success: false, message: 'Too many attempts. Please restart registration.' }, { status: 429 });
    }

    const valid = await bcrypt.compare(String(otp), pending.otpCodeHash);
    if (!valid) {
      pending.attempts += 1;
      await pending.save();
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    // Create the real user
    const User = await getAuthUserModel();
    const existing = await User.findOne({ $or: [{ email: pending.email }, { username: pending.username }] }).lean();
    if (existing) {
      await Pending.deleteOne({ _id: pending._id });
      return NextResponse.json({ success: false, message: 'User already exists. Please sign in.' }, { status: 409 });
    }

    const doc = await User.create({
      email: pending.email,
      username: pending.username,
      firstName: pending.firstName,
      lastName: pending.lastName,
      phoneNumber: pending.phoneNumber,
      passwordHash: pending.passwordHash,
      role: 'user',
    });

    // cleanup pending
    await Pending.deleteOne({ _id: pending._id });

    // set session
    const token = signAccessToken({ id: String(doc._id), username: doc.username, email: doc.email, role: doc.role });
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: String(doc._id),
        username: doc.username,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        phoneNumber: doc.phoneNumber,
        role: doc.role,
      }
    });
  } catch (error: any) {
    console.error('verify registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to verify registration' }, { status: 500 });
  }
}
