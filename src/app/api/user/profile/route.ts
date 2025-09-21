import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getAuthUserModel } from '@/models/AuthUserModel';

export async function GET() {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const User = await getAuthUserModel();
  const user = await User.findById(claims.id, {
    passwordHash: 0,
  }).lean();
  if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: {
    id: String(user._id),
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  }});
}

export async function PUT(request: NextRequest) {
  const token = await getAuthCookie();
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { firstName, lastName, phoneNumber, username } = body || {};

  const updates: any = {};
  if (typeof firstName === 'string') updates.firstName = firstName.trim();
  if (typeof lastName === 'string') updates.lastName = lastName.trim();
  if (typeof phoneNumber === 'string') updates.phoneNumber = phoneNumber.trim();
  if (typeof username === 'string' && username.trim()) updates.username = username.trim().toLowerCase();
  updates.updatedAt = new Date();

  const User = await getAuthUserModel();

  // Ensure username uniqueness if updating
  if (updates.username) {
    const exists = await User.findOne({ username: updates.username, _id: { $ne: claims.id } });
    if (exists) {
      return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 409 });
    }
  }

  const result = await User.findByIdAndUpdate(claims.id, { $set: updates }, { new: true, projection: { passwordHash: 0 } });
  if (!result) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: {
    id: String(result._id),
    username: result.username,
    firstName: result.firstName,
    lastName: result.lastName,
    email: result.email,
    phoneNumber: result.phoneNumber,
    role: result.role,
  }});
}


