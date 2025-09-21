import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(request: NextRequest, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip).filter((timestamp: number) => timestamp > windowStart);
  requests.push(now);
  rateLimitMap.set(ip, requests);

  if (requests.length > limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  return null;
}
