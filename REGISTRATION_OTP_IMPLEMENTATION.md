## OTP-based Registration Flow (Minimal Model Changes)

Goal: Require email OTP verification before activating a normal user account. Keep the current `authusers` model unchanged. Add a temporary store for pending registrations and small UI/API additions.

### Summary
- Step 1 (Initiate): User submits the sign-up form. We create a Pending Registration record and send a 6-digit OTP via email. UI switches to an OTP entry screen.
- Step 2 (Verify): User enters the OTP. If valid and not expired, we create the real user in `authusers`, issue the JWT cookie, and delete the pending record.

### Why this design
- No changes to `src/models/AuthUserModel.ts` (minimal change requirement).
- All verification state lives in a separate collection (`pendingregistrations`).
- Keeps the production `authusers` clean and only contains verified users.

---

## Data Model (new)

Create a new model `PendingRegistration` (new file `src/models/PendingRegistrationModel.ts`). Fields:
- email (string, required, lowercase, indexed)
- username (string, required, lowercase, indexed)
- firstName (string, required)
- lastName (string, required)
- phoneNumber (string, optional)
- passwordHash (string, required)
- otpCodeHash (string, required) — store a bcrypt or SHA-256 hash of the OTP
- otpExpiresAt (Date, required) — e.g., now + 10 minutes
- resendAvailableAt (Date) — throttle resend (e.g., now + 60s)
- attempts (number, default 0) — max e.g. 5 attempts
- createdAt, updatedAt (timestamps)

Notes:
- Hash OTP codes. Never store raw codes.
- Use unique indexes on `email` and `username` for pending registrations to prevent duplicates.

---

## Endpoints (new)

All endpoints live under `/api/auth/register/*`. They use our existing JWT/cookie utils and Mongo connection.

1) POST `/api/auth/register/initiate`
   - Body: { username, firstName, lastName, email, phoneNumber?, password }
   - Validations: required fields; check uniqueness against `authusers` and `pendingregistrations`.
   - Actions:
     - Hash password (`bcryptjs`).
     - Generate 6-digit OTP (e.g., `Math.floor(100000 + Math.random()*900000)`), hash it.
     - Save PendingRegistration with 10 min expiry and resend throttle (e.g., 60s).
     - Send OTP email.
   - Response: { success: true, pendingId }

2) POST `/api/auth/register/resend`
   - Body: { pendingId }
   - Validations: pending exists; not expired; `resendAvailableAt` <= now; attempts below threshold.
   - Actions: generate new OTP, update `otpCodeHash`, set new `otpExpiresAt` and `resendAvailableAt`, send email.
   - Response: { success: true }

3) POST `/api/auth/register/verify`
   - Body: { pendingId, otp }
   - Validations: pending exists; not expired; attempts < max; compare provided code with `otpCodeHash`.
   - On success:
     - Create user in `authusers` using the stored pending details.
     - Issue JWT cookie (`auth_token`).
     - Delete the pending registration.
     - Response: { success: true, user: {...} }
   - On failure: increment `attempts`; lock or delete after max attempts; return 400.

Security
- Rate-limit OTP resends and verifications (basic throttle per record; optional IP-based limits).
- OTP length 6 digits; TTL 10 minutes. Resend cooldown: 30 seconds. Verify attempt limit: 3.
- Never return whether email exists in `authusers` vs `pendingregistrations` with different messages.

---

## Email Delivery

Add `src/lib/email.ts` with an abstraction `sendOtpEmail(to: string, code: string)`. Implement using Nodemailer or a provider (e.g., Resend). Env needed:
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM

During development, log the OTP to the server console in addition to attempting send.

Email content (simple):
- Subject: "Your AI Toolbox verification code"
- Body: "Your code is 123456. It expires in 10 minutes."

---

## UI Changes (minimal)

Modify `src/app/sign-up/[[...sign-up]]/page.tsx` only; leave `AuthUserModel` and most app structure untouched.

1) Replace current single-step `register()` call with a two-step flow:
   - On form submit: call `POST /api/auth/register/initiate`.
   - On success: store `pendingId` in state, show an OTP input UI (same page conditional render).

2) OTP UI:
   - Inputs: 6-digit code, submit button, resend button (disabled until `resendAvailableAt`).
   - On submit: call `POST /api/auth/register/verify` with { pendingId, otp }.
   - On success: redirect to `/dashboard`.
   - On failure: show error; allow retry until attempts exhausted.

3) Optional: Add a separate route `/verify-otp` if desired, but minimal change is inline on the same page.

No changes to `AuthProvider` are strictly required; the page can call the new endpoints directly. You may add helpers later if useful.

### Current code delta (based on repo)

- `src/app/sign-up/[[...sign-up]]/page.tsx` currently calls `useAuth().register()` which posts to `/api/auth/register` and immediately logs the user in on success. For OTP flow:
  - Replace the `register(...)` call with `initiate` (POST `/api/auth/register/initiate`).
  - Add a local UI state for `otp`, `pendingId`, `resendCooldown` and render an OTP entry section when `pendingId` is set.
  - Wire the Verify button to POST `/api/auth/register/verify` and, on success, navigate to `/dashboard`.
  - Wire the Resend button to POST `/api/auth/register/resend`, honoring `resendAvailableAt` from the API response.

- `src/components/AuthProvider.tsx` currently exposes `register()` that posts to `/api/auth/register` (immediate create). Minimal change path: leave as-is and do NOT use it on the sign-up page. Optionally, later replace with:
  - `initiateRegistration(payload)` → returns `{success, pendingId, resendAvailableAt}`.
  - `verifyRegistration({ pendingId, otp })` → on success, refresh session.
  - `resendRegistrationOtp({ pendingId })`.

- `src/app/api/auth/register/route.ts` currently creates the user immediately. For OTP flow, prefer leaving it untouched for now (backward-compat, scripts, internal admin tooling). The new OTP endpoints will be authoritative for normal user sign-up. You may deprecate or protect this route later.

---

## Implementation Sketch (file map)

- New model: `src/models/PendingRegistrationModel.ts`
- New lib: `src/lib/email.ts`
- New API routes:
  - `src/app/api/auth/register/initiate/route.ts`
  - `src/app/api/auth/register/resend/route.ts`
  - `src/app/api/auth/register/verify/route.ts`
- Update page: `src/app/sign-up/[[...sign-up]]/page.tsx` (add OTP step UI)

---

## Integration Details

Uniqueness checks
- Before creating a pending record, ensure `email` and `username` do not exist in `authusers` and do not exist in non-expired `pendingregistrations`.

Expiry cleanup (optional)
- Add a small cleanup job/route to delete pending records older than `otpExpiresAt` + buffer.

JWT on success
- Reuse `signAccessToken` and `setAuthCookie` once verification succeeds.

Middleware
- No changes required. Middleware already relies on `auth_token` set after OTP verification.

---

## Test Plan

Happy path
1) Submit sign-up → receive `pendingId`, email with OTP.
2) Enter correct OTP within 10 minutes → account created → redirected to `/dashboard`.

Edge cases
- Wrong OTP: attempts increment; error shown; lock after max attempts.
- Expired OTP: specific error; user may resend after throttle.
- Duplicate email/username: initiate responds with generic error.
- Email unavailable: in dev, OTP logged to console; in prod, ensure SMTP configured.

---

## Rollout Steps
1) Add model and API routes.
2) Add `email.ts` and environment variables.
3) Update `sign-up` page to two-step flow.
4) Verify end-to-end locally; confirm JWT cookie set after verify.
5) Deploy; ensure SMTP credentials on server.

---

## Implementation Checklist

- [ ] Create `src/models/PendingRegistrationModel.ts` with fields and indexes described.
- [ ] Add `src/lib/email.ts` with `sendOtpEmail(to, code)` and env-driven transport (SMTP/Resend).
- [ ] Implement API: `POST /api/auth/register/initiate` (validation, uniqueness checks, store pending, send email).
- [ ] Implement API: `POST /api/auth/register/resend` (throttle, regenerate OTP, update TTL, send email).
- [ ] Implement API: `POST /api/auth/register/verify` (validate OTP, create user in `authusers`, set JWT, delete pending).
- [ ] Update `src/app/sign-up/[[...sign-up]]/page.tsx` to two-step UI (form → OTP input), handle resend with cooldown; stop calling `useAuth().register()` here.
- [ ] Ensure `src/lib/auth/jwt.ts` and `src/lib/auth/cookies.ts` are reused to issue `auth_token` on success.
- [ ] Add `.env` values for email (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) and test in dev.
- [ ] Log OTP to server console in development for testing convenience.
- [ ] Add basic rate-limiting/throttle (per pending record; optional IP-based guard).
- [ ] Write unit/integration tests for: initiate (dup/valid), resend (throttle), verify (good/bad/expired), happy path.
- [ ] Optional: add cleanup job/route to purge expired pending registrations.
**Optional (nice-to-have):**
- [ ] Add `initiateRegistration/verifyRegistration/resendRegistrationOtp` helpers to `AuthProvider` and refactor sign-up page to use them.
- [ ] Deprecate or protect `POST /api/auth/register` for non-admin contexts.


