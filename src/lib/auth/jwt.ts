import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface JwtUserClaims {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'super_admin';
  iat: number;
}

export function signAccessToken(payload: JwtUserClaims): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

export function verifyAccessToken(token: string): JwtUserClaims | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    return jwt.verify(token, secret) as JwtUserClaims;
  } catch {
    return null;
  }
}


