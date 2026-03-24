# Analytics & Feedback System — Design Spec

**Date:** 2026-03-23
**Status:** Draft
**Goal:** Build a unified analytics and feedback system. Track all visitors (anonymous + logged-in) with a shared `visitorId` thread, replace mock admin stats with real data, add per-user activity reports, and let users submit bug reports and feature requests via a lightweight widget that flows into an admin inbox.

---

## 1. Data Layer

### 1.1 New collection: `page_visits`

Stores one document per page load (client-side only — bots that don't execute JS won't trigger writes).

| Field | Type | Notes |
|-------|------|-------|
| `visitorId` | `string` | UUID from cookie |
| `userId` | `string \| null` | `null` if anonymous |
| `path` | `string` | e.g. `/ai-tools/swot-analysis` |
| `referrer` | `string \| null` | `document.referrer` |
| `userAgent` | `string` | |
| `createdAt` | `Date` | TTL: auto-delete after 90 days |

**Indexes:**
- `{ visitorId: 1, createdAt: -1 }`
- `{ userId: 1, createdAt: -1 }`
- `{ path: 1, createdAt: -1 }`
- `{ createdAt: 1 }` with `expireAfterSeconds: 7776000` (90 days TTL)

90-day retention is sufficient — the platform displays 30-day trends. TTL gives a buffer for month-boundary queries.

### 1.2 New collection: `visitor_identities`

Links anonymous visitors to accounts upon login/registration. One document per unique visitor.

| Field | Type | Notes |
|-------|------|-------|
| `visitorId` | `string` | Unique index |
| `userId` | `string \| null` | Set on login/register, sparse index |
| `firstSeenAt` | `Date` | Set on first insert only |
| `lastSeenAt` | `Date` | Updated on each visit |

**Indexes:**
- `{ visitorId: 1 }` unique
- `{ userId: 1 }` sparse

No `totalVisits` counter — compute on-the-fly from `page_visits` aggregation to avoid drift.

### 1.3 New collection: `feedback`

Stores bug reports and feature requests from both logged-in users and anonymous visitors.

| Field | Type | Notes |
|-------|------|-------|
| `visitorId` | `string` | Always present (from cookie) |
| `userId` | `string \| null` | Present if logged in |
| `type` | `'bug' \| 'feature'` | |
| `title` | `string` | |
| `description` | `string` | Max 2000 chars |
| `url` | `string` | Page user was on when submitting |
| `status` | `string` | `'new' \| 'in_review' \| 'planned' \| 'resolved' \| 'closed'`, default `'new'` |
| `priority` | `string \| null` | `null \| 'low' \| 'medium' \| 'high'`, default `null` (admin sets on triage) |
| `recentTools` | `string[]` | Last 3 tool slugs auto-attached from `ToolUsage` by `visitorId` |
| `adminNotes` | `Array<{ text: string, adminId: string, createdAt: Date }>` | Default `[]`, admin adds during triage — `adminId` tracks which admin wrote the note |
| `userAgent` | `string` | |
| `createdAt` | `Date` | |
| `updatedAt` | `Date` | Auto-updated on every PATCH (status/priority/note change) |

**Indexes:**
- `{ status: 1, createdAt: -1 }`
- `{ type: 1, status: 1 }`
- `{ visitorId: 1 }`

### 1.4 Existing model change: `ToolUsage`

Add one field:

| Field | Type | Notes |
|-------|------|-------|
| `visitorId` | `string` | New — populated from cookie server-side |

**New index:** `{ visitorId: 1, createdAt: -1 }`

Existing records without `visitorId` are unaffected — queries that join on `visitorId` simply won't find them. New events populate the field going forward.

---

## 2. Visitor Tracking & Identity Linking

### 2.1 Cookie: `visitorId`

Set via the existing Next.js middleware at the **project root** (`middleware.ts`, NOT `src/middleware.ts`).

- **Value:** UUID v4
- **HttpOnly:** `true` (read server-side in API routes, no client JS access needed)
- **SameSite:** `lax`
- **Secure:** `true` in production
- **Max-Age:** 365 days
- **Path:** `/`

**Integration into existing middleware:** The project already has a `middleware.ts` at the root with its own matcher for auth protection. Do NOT replace the existing matcher or create a second middleware file (Next.js only supports one). Instead, add the `visitorId` cookie logic **inside** the existing middleware function body:

```ts
// Inside the existing middleware function, before the auth logic:
const visitorId = request.cookies.get('visitorId')?.value;
if (!visitorId) {
  // Generate UUID and set on the response
  const newId = crypto.randomUUID();
  response.cookies.set('visitorId', newId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 365 * 24 * 60 * 60,
    path: '/',
  });
}
```

The existing matcher already covers page routes. The cookie-setting logic is a simple conditional that runs before the auth checks — it does not interfere with them.

### 2.2 Page visit tracking: `<AnalyticsProvider>`

A client component placed in the root layout (inside `<AuthProvider>` so it can access auth state). It:

1. Reads `pathname` via `usePathname()`
2. On mount and on every pathname change, sends `POST /api/analytics/visit` with `{ path, referrer, userAgent }`
3. The API route reads `visitorId` from `request.cookies`, reads `userId` from session (if logged in), and writes to `page_visits`
4. Also upserts `visitor_identities`: sets `lastSeenAt` to now, `firstSeenAt` only on insert

Fire-and-forget — the POST does not block navigation. Errors are silently caught.

**Client-side debounce:** The provider debounces visit tracking to max 1 event per second. Rapid client-side navigations (e.g., programmatic redirects) do not generate multiple writes.

### 2.3 Identity linking on login/register

No separate `/api/analytics/identify` endpoint. Instead, the existing login and register API routes are modified to:

1. Read `visitorId` from the cookie store (using the existing cookie-reading pattern in each route — e.g. `const cookieStore = await cookies(); cookieStore.get('visitorId')` from `next/headers`, matching how the auth routes already read cookies)
2. If present, upsert `visitor_identities`: set `userId` to the authenticated user's ID, update `lastSeenAt`

This is inline in the auth flow — no separate client call, no race condition, no risk of the browser closing before the identify fires.

### 2.4 All tool-tracking routes — add `visitorId`

Multiple routes write to `ToolUsage`. **All** of them must read `visitorId` from the request cookie and store it:

- `src/app/api/analytics/track/route.ts` — general analytics tracking
- `src/app/api/tools/usage/track/route.ts` — tool usage tracking
- `src/app/api/tools/[slug]/track-usage/route.ts` — per-tool tracking
- `src/app/api/tools/swot-analysis/track-usage/route.ts` — SWOT-specific tracking

If only one route gets the `visitorId` injection, the `recentTools` query on feedback submissions (Section 3.4) will miss tools tracked through other routes. Consider creating a shared utility function (e.g. `getVisitorId(request)`) that all routes call, to avoid duplicating cookie-reading logic.

### 2.5 Privacy

No IP addresses stored in any collection. `userAgent` is stored for device-type analytics and feedback debugging context. Cookie is first-party, `HttpOnly`, and contains only a random UUID — no PII.

---

## 3. Feedback Widget

### 3.1 Component structure

```
src/components/feedback/
  FeedbackWidget.tsx    (~40 lines — floating button + popover toggle)
  FeedbackForm.tsx      (~70 lines — form content)
```

### 3.2 Floating button

Fixed position, bottom-right corner. Shows a small "Feedback" button with a message icon. Clicking toggles a popover above it.

### 3.3 Form (same for logged-in and anonymous)

| Element | Details |
|---------|---------|
| Type toggle | Two buttons: "Bug" / "Feature Request" — toggle style, default "Bug" |
| Title | Text input, required, max 100 chars |
| Description | Textarea, 3 rows, required, max 2000 chars |
| Submit | Button, shows loading spinner during submission |
| Error | Inline error message below submit if the POST fails |

On successful submit: close popover, show brief success toast.

### 3.4 Auto-attached fields (server-side)

The `POST /api/feedback` route reads from the request:
- `visitorId` — from cookie
- `userId` — from session (null if anonymous)
- `url` — from request body (set client-side from `window.location.href`)
- `userAgent` — from request headers
- `recentTools` — queries `ToolUsage` by `visitorId`, takes last 3 distinct `toolSlug` values

### 3.5 Placement

Rendered in the dashboard layout (`src/app/dashboard/layout.tsx`), the main public layout, and the admin layout (`src/app/admin/layout.tsx`) — admin users may also want to submit feedback. **Excluded** from auth pages (login, register, forgot-password) — the widget component checks the pathname and returns null for `/sign-in`, `/sign-up`, `/forgot-password` routes.

### 3.6 API

**`POST /api/feedback`** — public (no auth required, anonymous visitors can submit)
- **Rate limited:** max 5 submissions per `visitorId` per hour. Use the existing `src/lib/rateLimiter.ts` or `src/lib/enhancedRateLimiter.ts` utilities.
- Validates: `type` is `'bug'` or `'feature'`, `title` non-empty (max 100), `description` non-empty (max 2000)
- Reads `visitorId` from cookie, `userId` from session
- Queries last 3 `recentTools` from `ToolUsage` by `visitorId`. **Note:** `recentTools` will be empty for visitors whose tool usage predates the `visitorId` migration — this is expected and resolves itself as new events accumulate.
- Inserts into `feedback` collection with `status: 'new'`, `priority: null`
- Returns `{ success: true }`

---

## 4. Admin Feedback Inbox

### 4.1 Component structure

```
src/app/admin/feedback/
  page.tsx                        (~20 lines — server wrapper with Suspense)
src/components/admin/feedback/
  FeedbackInbox.tsx               (~70 lines — table + pagination)
  FeedbackFilters.tsx             (~40 lines — filter bar)
  FeedbackDetailModal.tsx         (~80 lines — detail view + admin actions)
  FeedbackStatsCard.tsx           (~40 lines — summary card for admin dashboard)
```

### 4.2 FeedbackStatsCard

Displayed on the main admin dashboard (`/admin`). Shows:
- Count of new bugs
- Count of new feature requests
- Last submitted timestamp
- Link to full inbox

Fetches its own data from `GET /api/admin/feedback/stats` — decoupled from the existing `/api/admin/stats` route.

### 4.3 FeedbackInbox

Table columns:
- Type (bug/feature icon + label)
- Title
- Submitted by (username or "Anonymous")
- Page URL
- Status badge (color-coded)
- Date (relative time)

Click a row → opens `FeedbackDetailModal`.

### 4.4 FeedbackFilters

Filter bar above the table:
- Type: All / Bugs / Features
- Status: All / New / In Review / Planned / Resolved / Closed
- Date range (optional)

### 4.5 FeedbackDetailModal

Shows:
- Full title + description
- Auto-attached context: page URL, recent tools used, user agent
- Submitter info: if logged-in → link to user profile in `/admin/users`; if anonymous → shows "Anonymous visitor"
- Admin actions:
  - Status dropdown (change status)
  - Priority dropdown (set priority)
  - Add note (text input + add button → appends to `adminNotes` array)
- Notes history displayed in reverse-chronological order

### 4.6 Navigation

Add "Feedback" item to `src/components/admin/sidebar/admin-nav-config.ts`, placed after "Contact" in the navigation group. Icon: `MessageSquare` from Lucide.

### 4.7 API routes

**`GET /api/admin/feedback/stats`** — `withAdminAuth`
- Returns `{ newBugs: number, newFeatures: number, lastSubmittedAt: Date | null }`

**`GET /api/admin/feedback`** — `withAdminAuth`
- Query params: `type`, `status`, `page`, `limit` (default 20)
- Returns paginated list with total count

**`PATCH /api/admin/feedback/[id]`** — `withAdminAuth`
- Body: `{ status?, priority?, note? }`
- If `note` provided, pushes `{ text: note, adminId: <from session>, createdAt: new Date() }` to `adminNotes`
- Sets `updatedAt` to `new Date()` on every PATCH
- Returns updated feedback document

---

## 5. Analytics — Platform Metrics

### 5.1 Component structure

```
src/app/admin/analytics/
  page.tsx                        (~20 lines — server wrapper)
src/components/admin/analytics/
  AnalyticsOverview.tsx           (~80 lines — visitor cards + active user cards)
  ToolUsageChart.tsx              (~70 lines — top tools bar chart + 30-day trend line)
  TrafficChart.tsx                (~70 lines — page views over time + top 10 pages list)
```

### 5.2 What's displayed

**Visitor overview:**
- Total unique visitors (count of `visitor_identities` documents)
- Anonymous vs logged-in ratio (where `userId` is null vs non-null)
- New visitors this week / this month

**Active users:**
- DAU: distinct `userId` (non-null) in `page_visits` for today
- WAU: distinct `userId` in `page_visits` for last 7 days
- MAU: distinct `userId` in `page_visits` for last 30 days

**Tool usage:**
- Top 10 tools by usage count (from `ToolUsage` aggregation, last 30 days)
- 30-day usage trend line

**Traffic:**
- Page views per day over last 30 days (from `page_visits` count by day)
- Top 10 most visited pages

### 5.3 API routes (all `withAdminAuth`, fetched in parallel by the frontend)

**`GET /api/admin/analytics/visitors`**
- Aggregates `visitor_identities` for totals, anonymous ratio
- Filters by `firstSeenAt` for new visitor counts

**`GET /api/admin/analytics/active-users`**
- Aggregates `page_visits` with distinct `userId` for DAU/WAU/MAU
- Only counts non-null `userId`

**`GET /api/admin/analytics/traffic`**
- Aggregates `page_visits` grouped by day (last 30 days) for chart
- Aggregates by `path` for top 10 pages

**`GET /api/admin/analytics/tools`**
- Aggregates `ToolUsage` grouped by `toolSlug` (last 30 days) for top tools
- Daily counts for trend line

### 5.4 Charting library

Not prescribed in this spec. Implementation plan will check `package.json` for existing charting dependencies. If none, `recharts` is the recommended lightweight option for Next.js.

### 5.5 Replacing mock data

The existing `/api/admin/stats` and `/api/admin/dashboard/stats` routes have extensive mock data. They remain as-is for v1 — the new analytics endpoints provide real data on the redesigned analytics page. These legacy stats routes can be cleaned up incrementally in a follow-up.

---

## 6. Per-User Activity Reports

### 6.1 Component

```
src/components/admin/
  UserActivityModal.tsx           (~80 lines)
```

Opened via a "View Activity" button added to the existing `UserDetailModal`. This is a separate modal — no tab retrofit needed on UserDetailModal.

### 6.2 What's displayed

- **Last active:** `lastSeenAt` from `visitor_identities`
- **Total visits:** count from `page_visits` where `userId` matches
- **Tools used:** aggregation from `ToolUsage` grouped by `toolSlug` with count, sorted by frequency
- **Recent pages:** last 20 entries from `page_visits`
- **Feedback submitted:** count from `feedback` where `userId` matches + link to filtered inbox view
- **Pre-login activity:** if `visitor_identities` has a `visitorId` for this user, also include `page_visits` and `ToolUsage` entries where `visitorId` matches but `userId` is null (these are the anonymous visits before the user registered). This is a simple union — anonymous events and logged-in events are separate documents, no deduplication needed.

### 6.3 API

**`GET /api/admin/users/[id]/activity`** — `withAdminAuth`

1. Looks up `visitor_identities` by `userId` to get `visitorId`
2. Queries `page_visits` with `$or: [{ userId }, { visitorId, userId: null }]`
3. Queries `ToolUsage` with same `$or` pattern
4. Queries `feedback` by `userId` for count
5. Returns combined payload

---

## 7. File Map Summary

| File | Action | Section |
|------|--------|---------|
| `src/models/PageVisitModel.ts` | Create | 1.1 |
| `src/models/VisitorIdentityModel.ts` | Create | 1.2 |
| `src/models/FeedbackModel.ts` | Create | 1.3 |
| `src/models/ToolUsageModel.ts` | Modify (add `visitorId`) | 1.4 |
| `middleware.ts` (project root) | Modify (add `visitorId` cookie) | 2.1 |
| `src/components/AnalyticsProvider.tsx` | Create (matches `AuthProvider.tsx` location) | 2.2 |
| `src/app/api/analytics/visit/route.ts` | Create | 2.2 |
| `src/app/api/auth/login/route.ts` (or equivalent) | Modify (identity linking) | 2.3 |
| `src/app/api/auth/register/route.ts` | Modify (identity linking) | 2.3 |
| `src/app/api/analytics/track/route.ts` | Modify (add `visitorId`) | 2.4 |
| `src/app/api/tools/usage/track/route.ts` | Modify (add `visitorId`) | 2.4 |
| `src/app/api/tools/[slug]/track-usage/route.ts` | Modify (add `visitorId`) | 2.4 |
| `src/app/api/tools/swot-analysis/track-usage/route.ts` | Modify (add `visitorId`) | 2.4 |
| `src/components/feedback/FeedbackWidget.tsx` | Create | 3.1 |
| `src/components/feedback/FeedbackForm.tsx` | Create | 3.1 |
| `src/app/layout.tsx` | Modify (add `AnalyticsProvider` + `FeedbackWidget`) | 2.2, 3.5 |
| `src/app/api/feedback/route.ts` | Create | 3.6 |
| `src/app/admin/feedback/page.tsx` | Create | 4.1 |
| `src/components/admin/feedback/FeedbackInbox.tsx` | Create | 4.1 |
| `src/components/admin/feedback/FeedbackFilters.tsx` | Create | 4.1 |
| `src/components/admin/feedback/FeedbackDetailModal.tsx` | Create | 4.1 |
| `src/components/admin/feedback/FeedbackStatsCard.tsx` | Create | 4.1 |
| `src/components/admin/sidebar/admin-nav-config.ts` | Modify (add Feedback nav) | 4.6 |
| `src/app/api/admin/feedback/stats/route.ts` | Create | 4.7 |
| `src/app/api/admin/feedback/route.ts` | Create | 4.7 |
| `src/app/api/admin/feedback/[id]/route.ts` | Create | 4.7 |
| `src/app/admin/analytics/page.tsx` | Modify | 5.1 |
| `src/components/admin/analytics/AnalyticsOverview.tsx` | Create | 5.1 |
| `src/components/admin/analytics/ToolUsageChart.tsx` | Create | 5.1 |
| `src/components/admin/analytics/TrafficChart.tsx` | Create | 5.1 |
| `src/app/api/admin/analytics/visitors/route.ts` | Create | 5.3 |
| `src/app/api/admin/analytics/active-users/route.ts` | Create | 5.3 |
| `src/app/api/admin/analytics/traffic/route.ts` | Create | 5.3 |
| `src/app/api/admin/analytics/tools/route.ts` | Create | 5.3 |
| `src/components/admin/UserActivityModal.tsx` | Create | 6.1 |
| `src/components/admin/UserDetailModal.tsx` | Modify (add "View Activity" button) | 6.1 |
| `src/app/api/admin/users/[id]/activity/route.ts` | Create | 6.3 |
| `src/components/admin/AdminDashboard.tsx` | Modify (add FeedbackStatsCard) | 4.2 |

**Total:** 22 new files, 13 modified files
