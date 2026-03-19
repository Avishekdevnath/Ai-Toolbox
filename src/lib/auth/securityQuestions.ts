export interface SecurityQuestionOption {
  id: string;
  label: string;
}

export const SECURITY_QUESTION_OPTIONS: SecurityQuestionOption[] = [
  { id: 'childhood_nickname', label: 'What was your childhood nickname?' },
  { id: 'first_school', label: 'What is the name of your first school?' },
  { id: 'favorite_teacher', label: 'What was the name of your favorite teacher?' },
  { id: 'favorite_food', label: 'What is your favorite food?' },
  { id: 'favorite_movie', label: 'What is your favorite movie?' },
  { id: 'favorite_book', label: 'What is your favorite book?' },
  { id: 'birth_city', label: 'What city were you born in?' },
  { id: 'dream_job', label: 'What was your dream job as a child?' },
  { id: 'favorite_team', label: 'What is the name of your favorite sports team?' },
  { id: 'favorite_holiday_destination', label: 'What is your favorite holiday destination?' },
];

const securityQuestionIdSet = new Set(
  SECURITY_QUESTION_OPTIONS.map((question) => question.id)
);

export function isValidSecurityQuestionId(id: string): boolean {
  return securityQuestionIdSet.has(id);
}

export function getSecurityQuestionLabel(id: string): string | null {
  const question = SECURITY_QUESTION_OPTIONS.find((item) => item.id === id);
  return question?.label ?? null;
}
