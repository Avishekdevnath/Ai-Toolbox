import {
  SECURITY_QUESTION_OPTIONS,
  getSecurityQuestionLabel,
  isValidSecurityQuestionId,
} from '@/lib/auth/securityQuestions';

describe('securityQuestions', () => {
  it('exposes exactly 10 fixed options', () => {
    expect(SECURITY_QUESTION_OPTIONS).toHaveLength(10);
  });

  it('validates known ids and rejects unknown ids', () => {
    expect(isValidSecurityQuestionId('childhood_nickname')).toBe(true);
    expect(isValidSecurityQuestionId('not-real')).toBe(false);
    expect(getSecurityQuestionLabel('favorite_food')).toMatch(/favorite food/i);
    expect(getSecurityQuestionLabel('not-real')).toBeNull();
  });
});
