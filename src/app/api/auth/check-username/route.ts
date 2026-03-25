import { NextRequest, NextResponse } from 'next/server';
import { AuthUserModel } from '@/models/AuthUserModel';

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('username');
  const username = raw?.toLowerCase().trim();

  if (!username) {
    return NextResponse.json(
      { available: false, error: 'Username is required' },
      { status: 400 }
    );
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { available: false, error: 'Username must be 3–20 characters: letters, numbers, underscores only' },
      { status: 400 }
    );
  }

  try {
    const existing = await AuthUserModel.findByUsername(username);
    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json(
      { available: false, error: 'Service unavailable' },
      { status: 500 }
    );
  }
}
