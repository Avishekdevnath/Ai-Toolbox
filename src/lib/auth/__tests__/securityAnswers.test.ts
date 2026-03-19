import {
  hashSecurityAnswer,
  normalizeSecurityAnswer,
  verifySecurityAnswer,
} from '@/lib/auth/securityAnswers';

describe('normalizeSecurityAnswer', () => {
  it('trims, lowercases, and collapses repeated whitespace', () => {
    expect(normalizeSecurityAnswer('  Mrs   Rahman  ')).toBe('mrs rahman');
  });
});

describe('security answer hashing', () => {
  it('verifies equivalent normalized answers against the stored hash', async () => {
    const hash = await hashSecurityAnswer('Mrs Rahman');

    await expect(verifySecurityAnswer('  mrs   rahman ', hash)).resolves.toBe(true);
    await expect(verifySecurityAnswer('someone else', hash)).resolves.toBe(false);
  });
});
