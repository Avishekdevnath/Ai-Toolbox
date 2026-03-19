# Authentication Security Questions Redesign - Design Spec

**Date:** 2026-03-19
**Project:** AI Toolbox
**Scope:** User registration, forgot-password, logged-in password change, user auth data model, user auth API routes, auth UI screens
**Out of Scope:** Admin authentication, OAuth/social login, billing/subscription auth, session provider rewrite, authorization role redesign

---

## Problem Statement

The current user authentication flow is internally inconsistent:

1. Registration uses email OTP verification through pending-registration routes.
2. Forgot-password uses an email reset-link flow.
3. Logged-in password change uses current password plus email OTP.
4. Existing user auth is custom JWT cookie auth, not a third-party auth provider.

The requested direction is to remove email verification entirely and replace password recovery with fixed security questions chosen by the user at signup.

This redesign must simplify the auth surface rather than layering another recovery mechanism on top of the current one.

---

## Goals

1. Remove email verification from user registration.
2. Require every new user to configure security questions during signup.
3. Use security questions for forgot-password recovery.
4. Allow logged-in password change by either:
   - current password, or
   - security-question verification
5. Reuse one challenge-based verification model for both forgot-password and question-based password change.

---

## Non-Goals

1. Replacing the existing JWT cookie session approach.
2. Adding social login providers.
3. Changing admin login or admin session handling.
4. Introducing MFA, passkeys, or email-based fallback recovery.
5. Building a full account-security management suite beyond what this feature needs.

---

## Product Decisions

### Registration

- Email verification is removed completely.
- New users register directly and are signed in immediately after successful account creation.
- Users must choose **3 to 5** security questions from a fixed catalog of 10.
- Users must provide one answer for each selected question.

### Security Question Catalog

The app owns a fixed list of 10 questions. Users do not write custom questions.

Recommended catalog:

1. What was your childhood nickname?
2. What is the name of your first school?
3. What was the name of your favorite teacher?
4. What is your favorite food?
5. What is your favorite movie?
6. What is your favorite book?
7. What city were you born in?
8. What was your dream job as a child?
9. What is the name of your favorite sports team?
10. What is your favorite holiday destination?

Each question must have a stable `id` and display `label`.

### Forgot Password

- Forgot-password uses security questions instead of email.
- The user starts with email or username.
- If the account is eligible, the server returns a short-lived challenge containing **2 random questions** selected from the user’s saved set.
- Correct answers allow the user to set a new password.

### Logged-In Password Change

Logged-in users can choose one of two verification methods:

1. Verify with current password.
2. Verify by answering 2 random security questions.

Both methods converge on the same password-update endpoint.

### Existing Users

- Existing users will not have security questions configured.
- They can still change password using current password.
- They cannot use question-based forgot-password until they configure at least 3 questions.
- The UI should prompt them to configure security questions from account settings or an auth prompt after sign-in.

---

## Architecture

### Unit 1: Fixed Security Question Catalog

**Responsibility:** Provide the canonical list of allowed questions.

**Proposed file:** `src/lib/auth/securityQuestions.ts`

**Interface:**

```ts
export interface SecurityQuestionOption {
  id: string;
  label: string;
}

export const SECURITY_QUESTION_OPTIONS: SecurityQuestionOption[];

export function isValidSecurityQuestionId(id: string): boolean;
export function getSecurityQuestionLabel(id: string): string | null;
```

**Rules:**

- The catalog is code-owned, not database-owned.
- Question IDs are stable and safe to persist in user records.
- UI reads from this module for registration and question challenge rendering.

### Unit 2: Answer Normalization And Hashing

**Responsibility:** Normalize raw answers before hashing and comparison.

**Proposed file:** `src/lib/auth/securityAnswers.ts`

**Interface:**

```ts
export function normalizeSecurityAnswer(value: string): string;
export async function hashSecurityAnswer(value: string): Promise<string>;
export async function verifySecurityAnswer(raw: string, answerHash: string): Promise<boolean>;
```

**Normalization rules:**

- trim leading and trailing whitespace
- collapse repeated internal whitespace to a single space
- lowercase the final value

**Rules:**

- Answers are never stored in plain text.
- Empty answers after normalization are invalid.
- Duplicate normalized answers across the same user’s selected questions are not allowed.

### Unit 3: User Security Question Storage

**Responsibility:** Persist the user’s selected question IDs and hashed answers.

**Schema change in:** `src/models/AuthUserModel.ts`

**Add field:**

```ts
securityQuestions: [
  {
    questionId: string;
    answerHash: string;
  }
]
```

**Rules:**

- Array length must be between 3 and 5 for newly configured users.
- `questionId` values must be unique per user.
- Legacy users may have no `securityQuestions` field until they configure it.

### Unit 4: Security Question Challenge Service

**Responsibility:** Create, verify, expire, and consume question-based verification challenges.

**Proposed file:** `src/lib/auth/securityQuestionChallengeService.ts`

**Backed by collection:** `security_question_challenges`

**Document shape:**

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  purpose: 'forgot_password' | 'change_password',
  questionIds: string[],
  expiresAt: Date,
  attemptCount: number,
  maxAttempts: number,
  verifiedAt?: Date,
  usedAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Interface:**

```ts
createChallenge(userId: string, purpose: 'forgot_password' | 'change_password'): Promise<ChallengeView>
verifyChallengeAnswers(challengeId: string, answers: { questionId: string; answer: string }[]): Promise<VerifyResult>
consumeVerifiedChallenge(challengeId: string, purpose: 'forgot_password' | 'change_password'): Promise<boolean>
```

**Rules:**

- Each challenge contains exactly 2 randomly selected question IDs from the user’s configured set.
- Challenge TTL: 15 minutes.
- Maximum attempts: 5.
- Verified challenges are single-use.
- Used or expired challenges must not allow password updates.

The challenge service is the shared boundary between forgot-password and question-based password change.

### Unit 5: Password Update Service

**Responsibility:** Validate and update password hashes for the user.

This can extend the existing `UserAuthService.updatePassword` logic or move into a focused auth utility.

**Rules:**

- Password minimum length remains 8 characters.
- Password reset and password change both reuse the same final password-update logic.
- After password change or reset, the server updates `passwordHash` and `updatedAt`.

---

## Data Model Changes

### `authusers` collection

Add:

```ts
securityQuestions?: Array<{
  questionId: string;
  answerHash: string;
}>
```

### New collection: `security_question_challenges`

Purpose:

- store 2-question verification challenges
- track expiry
- track attempts
- track verified and used state

### Collections to Remove From This Flow

These become obsolete for user registration and password recovery after rollout:

- `pending_registrations` flow used by registration OTP
- `password_reset_tokens` flow used by email reset links
- `password_reset_otps` flow used by email OTP password change

The code paths should be removed once the new flow is implemented and verified.

---

## API Design

### Registration

#### `POST /api/auth/register`

**Purpose:** Direct account creation with required security questions.

**Request:**

```json
{
  "username": "jane",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phoneNumber": "+1 555 123 4567",
  "password": "StrongPassword123",
  "securityQuestions": [
    { "questionId": "childhood_nickname", "answer": "sunny" },
    { "questionId": "first_school", "answer": "green field school" },
    { "questionId": "favorite_teacher", "answer": "mrs rahman" }
  ]
}
```

**Validation:**

- required fields stay aligned with current registration fields
- password length >= 8
- `securityQuestions.length` must be between 3 and 5
- question IDs must be valid and unique
- answers must be non-empty after normalization
- normalized answers must be unique within the submission
- email and username must remain unique

**Success behavior:**

- create user
- hash password
- hash normalized answers
- set `user_session` auth cookie
- return current user payload

### Remove Registration OTP Routes

These routes are removed:

- `POST /api/auth/register/initiate`
- `POST /api/auth/register/verify`
- `POST /api/auth/register/resend`

The sign-up UI no longer has OTP or resend states.

### Forgot Password

#### `POST /api/auth/forgot-password/challenge`

**Purpose:** Start recovery using email or username.

**Request:**

```json
{
  "identifier": "jane@example.com"
}
```

**Response on eligible account:**

```json
{
  "success": true,
  "challengeId": "abc123",
  "questions": [
    { "questionId": "first_school", "label": "What is the name of your first school?" },
    { "questionId": "favorite_food", "label": "What is your favorite food?" }
  ]
}
```

**Security behavior:**

- The endpoint always returns `success: true` with generic copy.
- If the account is eligible, the response also includes `challengeId` and `questions`.
- If the account does not exist or has no configured security questions, the response omits `challengeId` and `questions`.

This avoids explicit "user not found" messaging, but the presence of a challenge still reveals account eligibility. That disclosure is an accepted tradeoff for this product direction.

#### `POST /api/auth/forgot-password/verify`

**Purpose:** Verify answers for a recovery challenge.

**Request:**

```json
{
  "challengeId": "abc123",
  "answers": [
    { "questionId": "first_school", "answer": "green field school" },
    { "questionId": "favorite_food", "answer": "biryani" }
  ]
}
```

**Success behavior:**

- mark challenge as verified
- return permission to continue to password reset

#### `POST /api/auth/forgot-password/reset`

**Purpose:** Set a new password using a verified recovery challenge.

**Request:**

```json
{
  "challengeId": "abc123",
  "newPassword": "NewStrongPassword123"
}
```

**Rules:**

- challenge must exist
- purpose must be `forgot_password`
- challenge must be verified, unexpired, and unused
- password must meet validation rules
- on success, mark challenge as used

### Logged-In Password Change

#### `POST /api/user/change-password/challenge`

**Purpose:** Start question-based password change for an authenticated user.

**Behavior:**

- requires authenticated `user_session`
- creates a `change_password` challenge
- returns 2 random saved questions

#### `POST /api/user/change-password/verify-questions`

**Purpose:** Verify answers for the logged-in challenge.

**Behavior:**

- verifies the 2 answers
- marks challenge verified if correct

#### `POST /api/user/change-password/update`

**Purpose:** Update the password after either verification path succeeds.

**Request:**

```json
{
  "newPassword": "NewStrongPassword123",
  "verification": {
    "method": "current_password",
    "currentPassword": "CurrentPassword123"
  }
}
```

**Rules:**

- For `current_password`, this endpoint verifies the current password inline and updates the password in one request.
- For `security_questions`, the request uses a verified challenge:

```json
{
  "newPassword": "NewStrongPassword123",
  "verification": {
    "method": "security_questions",
    "challengeId": "abc123"
  }
}
```

- one endpoint handles both verification methods
- update is rejected unless the current password is correct or the challenge is valid, verified, unexpired, and unused

### User Security Question Management

Expose:

- `GET /api/user/security-questions`
- `PUT /api/user/security-questions`

This is required for legacy-user remediation and for any user who wants to rotate their saved questions later.

---

## UI Changes

### Sign-Up Page

File: `src/app/sign-up/[[...sign-up]]/page.tsx`

Changes:

- remove OTP initiation, OTP entry, resend-code, and pending registration states
- keep direct registration form
- add a security-question section with:
  - question selectors from the fixed 10-question catalog
  - dynamic add/remove rows
  - minimum 3 rows, maximum 5 rows
  - answer inputs for each selected question
- submit one direct registration request
- sign in and redirect on success

### Forgot Password Page

File: `src/app/forgot-password/page.tsx`

Changes:

- replace email reset-link language with question-based recovery language
- step 1: identifier input (`email or username`)
- step 2: show returned 2 questions and answer inputs
- step 3: after successful verification, show new password form on the same page
- remove resend-email and check-inbox UI

### Reset Password Page

File: `src/app/reset-password/page.tsx`

Recommendation:

- retire this page if forgot-password is converted into a single in-page challenge + reset flow

If the page is kept, it must switch from query-string token handling to challenge-based reset handling. The simpler option is to remove it from the public flow.

### Logged-In Password Change Modal

File: `src/components/modals/PasswordChangeModal.tsx`

Changes:

- remove email OTP messaging and OTP steps
- add method chooser:
  - `Use current password`
  - `Use security questions`
- current-password path:
  - current password input
  - new password and confirm-password inputs
  - submit one update request
- security-question path:
  - fetch 2 random questions
  - answer inputs
  - then new password form
- share one final update action

### Legacy User Prompt

At minimum, legacy users without configured questions need one visible prompt after authentication or in settings:

- explain that security questions are required for account recovery
- guide them to configure 3 to 5 questions
- link to a concrete settings surface backed by `GET/PUT /api/user/security-questions`

This prompt can be lightweight, but the system must not silently leave legacy users without recovery capability.

---

## Validation Rules

### Security Questions

- minimum selected questions: 3
- maximum selected questions: 5
- verification prompts shown per challenge: 2
- selected question IDs must be unique
- answers must be non-empty after normalization
- normalized answers must be unique within one user’s selection

### Passwords

- minimum length: 8
- confirm-password match required in UI
- password update endpoints enforce server-side validation regardless of UI validation

### Challenge Lifecycle

- challenge expires after 15 minutes
- maximum attempts: 5
- verified challenge is single-use
- used or expired challenge cannot be reused for reset or change

---

## Error Handling

### Generic Responses Where Identity Disclosure Matters

Forgot-password initiation must not reveal:

- whether the account exists
- whether the account has security questions configured

Recommended generic message:

`If the account is eligible for recovery, continue with the verification questions.`

### Specific Responses For Authenticated Flows

Logged-in password change can be specific because the user is already authenticated:

- wrong current password
- invalid or expired challenge
- too many attempts
- user has not configured security questions

### Failure Cases To Handle

1. User selects duplicate questions during signup.
2. User submits fewer than 3 or more than 5 questions.
3. User provides blank or duplicate answers.
4. Account has no security questions configured.
5. Challenge expires before verification.
6. Challenge answers are wrong too many times.
7. User tries to reuse a verified challenge after password update.
8. User changes password while another old challenge still exists.

For case 8, new password updates should invalidate or render obsolete any older outstanding password-change challenges for that user.

---

## Security Requirements

1. Security answers must be hashed with bcrypt before storage.
2. Raw answers must never be logged.
3. Challenge verification must compare normalized answers to stored answer hashes.
4. Recovery and change endpoints must be rate-limited.
5. Challenge IDs must be unguessable database identifiers or opaque tokens.
6. Password updates must require valid server-side proof, not just client state.
7. Expired and used challenges must be cleaned up periodically or opportunistically on access.

### Tradeoff Note

Security questions are weaker than email verification if users choose predictable answers. This is an accepted product tradeoff for this feature. The implementation must still apply hashing, normalization, attempt limits, and expiry to avoid making the flow worse than necessary.

---

## Migration Strategy

### New Users

- immediately use the new direct-registration + security-question model

### Existing Users

- keep current login unchanged
- allow current-password password change immediately
- block question-based forgot-password until questions are configured
- prompt them to configure 3 to 5 questions from a settings or post-login entry point

### Cleanup

After rollout verification:

- remove obsolete registration OTP code
- remove obsolete email reset-token code
- remove obsolete password-change OTP code
- remove now-unused email copy from the affected UI

---

## Testing Strategy

### Registration

1. succeeds with 3 valid questions
2. succeeds with 5 valid questions
3. fails with fewer than 3 questions
4. fails with more than 5 questions
5. fails with duplicate question IDs
6. fails with invalid question IDs
7. fails with blank answers
8. fails with duplicate normalized answers
9. fails on duplicate email or username

### Forgot Password

1. eligible account gets a 2-question challenge
2. selected questions are always drawn from the user’s saved set
3. wrong answers increment attempt count
4. correct answers verify the challenge
5. expired challenge is rejected
6. verified challenge allows password reset exactly once
7. account without configured questions fails safely without identity disclosure

### Logged-In Password Change

1. current-password verification succeeds with correct password
2. current-password verification fails with incorrect password
3. question challenge succeeds with correct answers
4. question challenge fails with incorrect answers
5. both paths can update password through the shared update endpoint
6. update fails without valid verification proof

### Regression Coverage

1. login still works with existing JWT cookie flow
2. admin authentication remains unaffected
3. `/api/auth/me` still returns the expected user session

---

## Success Criteria

1. Users can register without email verification.
2. Every new user stores 3 to 5 security questions at registration.
3. Forgot-password no longer depends on email links.
4. Logged-in password change supports both current-password and security-question verification.
5. Security-question verification uses one shared challenge model across both recovery and password change.
6. Existing users can still change their password with current password even before configuring security questions.
7. Obsolete OTP and reset-link routes are removed from the user-auth flow.
