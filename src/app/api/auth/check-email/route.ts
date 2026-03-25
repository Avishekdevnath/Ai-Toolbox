import { NextRequest, NextResponse } from 'next/server';
import { AuthUserModel } from '@/models/AuthUserModel';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.toLowerCase().trim();

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { available: false, error: 'Valid email is required' },
      { status: 400 }
    );
  }

  try {
    const existing = await AuthUserModel.findByEmail(email);
    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json(
      { available: false, error: 'Service unavailable' },
      { status: 500 }
    );
  }
}
