## Forms Feature Plan (Google Forms-style)

Goal: Logged-in users can create/manage forms (survey, general form, attendance, quiz). Public pages accept responses. Responses are viewable in tables with export. Analytics (basic + AI-powered insights). Quiz supports identity gate, timer, dedup (by email/id), and anti-cheating guidance.

### Form Types
- survey: multi-question, optional anonymity
- general: free-form data collection
- attendance: date/time capture, identity fields
- quiz: graded; identity gate (name, email, studentId), timer, single attempt policy

---

## Data Models (Mongoose)

1) Form
- ownerId: string (auth user id)
- title: string
- description: string
- type: 'survey' | 'general' | 'attendance' | 'quiz'
- fields: Array<FormField>
- settings: {
  isPublic: boolean
  allowMultipleSubmissions: boolean (default true except quiz)
  allowAnonymous: boolean (default false for quiz)
  identitySchema?: { requireName?: boolean; requireEmail?: boolean; requireStudentId?: boolean }
  timer?: { enabled: boolean; minutes: number }
  startAt?: Date; endAt?: Date
  quiz?: { scoringEnabled: boolean; passingScore?: number }
}
- status: 'draft' | 'published' | 'archived'
- submissionPolicy: {
  dedupeBy?: Array<'email' | 'studentId'>
  oneAttemptPerIdentity?: boolean
}
- createdAt, updatedAt

FormField
- id: string (uuid)
- label: string
- type: 'short_text' | 'long_text' | 'email' | 'number' | 'date' | 'time' | 'dropdown' | 'checkbox' | 'radio' | 'matrix' | 'file' | 'rating' | 'scale' | 'section' | 'image' | 'video'
- required: boolean
- options?: string[] (dropdown/radio/checkbox)
- multiple?: boolean (only for dropdown; radio is single-select; checkbox is multi-select)
- placeholder?: string
- helpText?: string
- visibility?: 'public' | 'internal'
- validation?: {
    min?: number; max?: number; pattern?: string; unique?: boolean;
    selection?: { min?: number; max?: number } // for checkbox or dropdown when multiple=true
  }
- quiz?: { correctOptions?: number[]; points?: number }

2) FormResponse
- formId: ObjectId
- responder: { name?: string; email?: string; studentId?: string; ip?: string; userAgent?: string }
- startedAt?: Date; submittedAt: Date
- durationMs?: number
- answers: Array<{ fieldId: string; value: any }>
- score?: number (quiz)
- meta?: Record<string, any>

Indexes
- Form: ownerId, status, type
- FormResponse: formId, 'responder.email', 'responder.studentId', submittedAt

---

## API Routes (Next.js App Routes)

All JWT-protected unless public endpoints noted.

- POST /api/forms
  - Create form (owner)
- GET /api/forms
  - List forms for owner (filters: status, type, q)
- GET /api/forms/[id]
  - Get form (owner)
- PATCH /api/forms/[id]
  - Update form (fields/settings/title)
- DELETE /api/forms/[id]
  - Archive/delete (soft delete to status=archived)
- POST /api/forms/[id]/publish
  - Toggle publish (status: draft↔published)
- GET /api/forms/[id]/schema (public)
  - Public schema for rendering
- POST /api/forms/[id]/submit (public)
  - Submit response (enforce identity/timer/dedupe)
- GET /api/forms/[id]/responses
  - Owner: list responses (pagination, export=csv)
- GET /api/forms/[id]/analytics
  - Owner: basic charts data (counts, per-field distribution)
- POST /api/forms/[id]/ai-insights
  - Owner: AI-powered summary (calls model provider if configured)

Validation/Guards
- Ownership check via JWT claims.id === form.ownerId
- Public schema/submit honor status=published and time window
- Dedupe for quiz: check by email/studentId when `submissionPolicy` flags set
- Timer: require `startedAt` token or server-start time; reject late submissions

---

## Utils

- validation/formValidation.ts
  - validateFormDefinition(form)
  - validateSubmission(form, payload)

- scoring/quizScoring.ts
  - scoreQuiz(form, answers) → { score, maxScore, perQuestion }

- dedupe/submissionPolicy.ts
  - canSubmit(form, responder, existingResponses)

- analytics/formsAnalytics.ts
  - aggregateDistributions(form, responses)
  - timeSeries(responses)
  - attendanceStats(responses)

- export/csv.ts
  - formResponsesToCsv(form, responses)

- ai/insights.ts
  - summarizeResponses(form, responses) (pluggable; returns text + key stats; no provider lock-in)

---

## Dashboard UI (React, client components)

1) Forms List Page: /dashboard/forms
- Table: title, type, status, submissions, last updated
- Actions: create, edit, publish/unpublish, set availability window (start/end), analytics, responses, delete/archive

Form Management (Owner)
- Publish/Unpublish toggle with status badge
- Availability: startAt/endAt pickers (expiry time) with validation against current time
- Quick actions: Copy public URL, View public form, Export responses CSV

2) Form Builder: /dashboard/forms/new and /dashboard/forms/[id]/edit
- Left: field palette (text, email, number, date/time, options, rating, file, section/image/video)
- Middle: canvas (drag/sort fields)
- Right: properties (label, required, validation, options, quiz points/correct)
- Settings tab: type, identity schema, timer, dedupe policy, availability window

3) Form Responses: /dashboard/forms/[id]/responses
- Table with column per field (virtualized), search, filters, export CSV

4) Form Analytics: /dashboard/forms/[id]/analytics
- Charts: submissions over time, per-field distribution, completion rate, attendance stats
- Toggle: AI Insights (summary, trends, anomalies)

---

## Public UI

- /f/[formId]
  - Render public schema; identity gate if required
  - Timer banner for quiz; start on first interaction
  - Submit; show success/failure message
  - Respect publish status and start/end availability window (expiry)

Security/UX Notes for Quiz
- Single attempt via dedupe (email/studentId) and token per session
- Prevent copy/selection best-effort with CSS/JS; educate that perfect prevention isn’t possible
- Disable context menu, selection, and key combos (Ctrl+C/PrtScn) best-effort
- Late submissions rejected by server timer check

---

## Rollout Steps
1) Models: Form, FormResponse
2) APIs: create/list/get/update/publish; public schema/submit; responses; analytics; AI insights
3) Utils: validation, scoring, dedupe, analytics, csv, ai
4) UI: list → builder → responses → analytics; public page
5) Tests: validators; submit flow; dedupe; scoring; date windows
6) Docs: user guide; admin guidance; limits & privacy

---

## Explicit File Map (Models, APIs, Utils, Components)

Models
- src/models/FormModel.ts
- src/models/FormResponseModel.ts

APIs (App Router)
- src/app/api/forms/route.ts (POST create, GET list)
- src/app/api/forms/[id]/route.ts (GET detail, PATCH update, DELETE archive)
- src/app/api/forms/[id]/publish/route.ts (POST toggle publish)
- src/app/api/forms/[id]/schema/route.ts (GET public schema)
- src/app/api/forms/[id]/submit/route.ts (POST public submit)
- src/app/api/forms/[id]/responses/route.ts (GET responses list, export)
- src/app/api/forms/[id]/analytics/route.ts (GET basic analytics)
- src/app/api/forms/[id]/ai-insights/route.ts (POST AI summary)

Utils
- src/lib/forms/validation.ts
- src/lib/forms/scoring.ts
- src/lib/forms/submissionPolicy.ts
- src/lib/forms/analytics.ts
- src/lib/forms/csv.ts
- src/lib/forms/ai.ts

Dashboard Pages (UI)
- src/app/dashboard/forms/page.tsx (Forms list/management)
- src/app/dashboard/forms/new/page.tsx (Create & builder)
- src/app/dashboard/forms/[id]/edit/page.tsx (Edit & builder)
- src/app/dashboard/forms/[id]/responses/page.tsx (Responses table)
- src/app/dashboard/forms/[id]/analytics/page.tsx (Analytics & AI toggle)

Dashboard Components
- src/components/forms/FormBuilder.tsx
- src/components/forms/FormFieldPalette.tsx
- src/components/forms/FormCanvas.tsx
- src/components/forms/FormFieldEditor.tsx
- src/components/forms/FormSettings.tsx
- src/components/forms/ResponsesTable.tsx
- src/components/forms/AnalyticsOverview.tsx
- src/components/forms/AIInsights.tsx

Public Pages & Components
- src/app/f/[id]/page.tsx (Public form renderer)
- src/components/forms/PublicFormRenderer.tsx
- src/components/forms/QuizTimer.tsx
- src/components/forms/IdentityGate.tsx

---

## Implementation Checklist (with file names)

- [x] Models: create `src/models/FormModel.ts`, `src/models/FormResponseModel.ts`
- [x] APIs: `src/app/api/forms/route.ts` (POST, GET)
- [x] APIs: `src/app/api/forms/[id]/route.ts` (GET, PATCH, DELETE)
- [x] APIs: `src/app/api/forms/[id]/publish/route.ts` (POST publish/unpublish)
- [x] APIs: `src/app/api/forms/[id]/schema/route.ts` (GET public)
- [x] APIs: `src/app/api/forms/[id]/submit/route.ts` (POST submit; dedupe; timer; windows)
- [x] APIs: `src/app/api/forms/[id]/responses/route.ts` (GET; pagination; CSV export)
- [x] APIs: `src/app/api/forms/[id]/analytics/route.ts` (GET metrics)
- [x] APIs: `src/app/api/forms/[id]/ai-insights/route.ts` (POST insights)
- [x] Utils: `src/lib/forms/validation.ts` (form + submission)
- [x] Utils: `src/lib/forms/scoring.ts` (quiz scoring)
- [x] Utils: `src/lib/forms/submissionPolicy.ts` (dedupe, attempts)
- [x] Utils: `src/lib/forms/analytics.ts` (distributions, timeseries, attendance)
- [x] Utils: `src/lib/forms/csv.ts` (export)
- [x] Utils: `src/lib/forms/ai.ts` (summary)
- [x] UI: `src/app/dashboard/forms/page.tsx` (list with publish/unpublish & expiry pickers)
- [x] UI: `src/app/dashboard/forms/new/page.tsx` (builder)
- [x] UI: `src/app/dashboard/forms/[id]/edit/page.tsx` (builder)
- [x] UI: `src/app/dashboard/forms/[id]/responses/page.tsx`
- [x] UI: `src/app/dashboard/forms/[id]/analytics/page.tsx`
- [x] Components: `src/components/forms/FormBuilder.tsx`
- [x] Components: `src/components/forms/FormFieldPalette.tsx`
- [x] Components: `src/components/forms/FormCanvas.tsx`
- [ ] Components: `src/components/forms/FormFieldEditor.tsx`
- [ ] Components: `src/components/forms/FormSettings.tsx`
- [x] Components: `src/components/forms/ResponsesTable.tsx`
- [x] Components: `src/components/forms/AnalyticsOverview.tsx`
- [ ] Components: `src/components/forms/AIInsights.tsx`
- [x] Public: `src/app/f/[id]/page.tsx`, `src/components/forms/PublicFormRenderer.tsx`
- [ ] Public: `src/components/forms/QuizTimer.tsx`, `src/components/forms/IdentityGate.tsx`


