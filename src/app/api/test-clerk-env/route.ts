import { NextResponse } from 'next/server';

export async function GET() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  
  return NextResponse.json({
    success: true,
    clerkPublishableKey: clerkPublishableKey ? 'SET' : 'NOT SET',
    clerkSecretKey: clerkSecretKey ? 'SET' : 'NOT SET',
    publishableKeyPrefix: clerkPublishableKey?.substring(0, 20) + '...',
    hasValidKeys: !!(clerkPublishableKey && clerkSecretKey),
    timestamp: new Date().toISOString()
  });
} 