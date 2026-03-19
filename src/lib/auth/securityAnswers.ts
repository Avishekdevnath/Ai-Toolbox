import bcrypt from 'bcryptjs';

export function normalizeSecurityAnswer(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export async function hashSecurityAnswer(value: string): Promise<string> {
  return bcrypt.hash(normalizeSecurityAnswer(value), 12);
}

export async function verifySecurityAnswer(raw: string, answerHash: string): Promise<boolean> {
  return bcrypt.compare(normalizeSecurityAnswer(raw), answerHash);
}
