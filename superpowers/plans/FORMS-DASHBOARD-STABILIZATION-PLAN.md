# Forms Dashboard Stabilization Plan

## Objective
Execute the Forms Dashboard stabilization spec in controlled phases, minimizing production risk while rapidly improving reliability and UX.

## Delivery Strategy
- **Approach:** 4 phases, each independently shippable.
- **Cadence:** Small PRs, each with explicit acceptance checks.
- **Quality gate:** No phase closes without tests + manual smoke checklist.

---

## Phase 0 — Alignment & Baseline (0.5 day)

### Tasks
1. Confirm canonical create route (`/dashboard/forms/create` recommended).
2. Confirm status vocabulary (`draft|published|archived`).
3. Create baseline bug board and map each bug to spec IDs.
4. Capture baseline metrics:
   - time-to-list-render
   - average network calls on forms list load
   - known failure rates (analytics unauthorized, stale search results)

### Exit Criteria
- Team sign-off on route + status decisions.
- Baseline metrics logged.

---

## Phase 1 — Correctness Hotfixes (1–1.5 days)

### Tasks
1. Fix analytics cookie mismatch (`auth_token` → `user_session`).
2. Remove unsupported `unpublished` from all UI/state paths.
3. Canonicalize create route:
   - keep one implementation
   - redirect deprecated route to canonical.
4. Normalize API error handling for forms endpoints where inconsistent.

### Validation
- Manual: create/edit/analytics access works for authenticated users.
- Tests: add/adjust API tests for analytics auth and status transitions.

### Exit Criteria
- No auth mismatch errors in analytics.
- No orphan status values generated.
- Single create path in production.

---

## Phase 2 — List Reliability & Performance (1.5–2 days)

### Tasks
1. Add pagination controls on `/dashboard/forms` (page + page size).
2. Wire query state to API (`limit`, `offset`/`page`) and preserve in URL params.
3. Add debounce (250–400ms) for search.
4. Add `AbortController` to cancel stale list requests.
5. Remove redundant N+1 count fetch on initial load (use API payload counts).

### Validation
- Manual:
  - navigate to page 2+ successfully
  - rapid typing does not show stale data
  - no spinner flicker from per-row count refetch.
- Tests:
  - integration test for pagination params
  - E2E for search/filter stability under rapid input.

### Exit Criteria
- List remains stable under rapid user input.
- Server pagination fully functional.
- Initial list load network calls reduced.

---

## Phase 3 — UX System Upgrade (2–3 days)

### Tasks
1. Replace `alert/confirm/prompt` with:
   - app-native toast notifications
   - confirmation dialog for destructive actions.
2. Add save-state banner/badge in create/edit:
   - saving / saved / failed + last-saved timestamp.
3. Add unsaved-changes protection in create/edit:
   - before route transition
   - browser tab close warning.
4. Improve empty/error states with recovery actions:
   - retry
   - clear filters
   - create form.
5. Accessibility pass:
   - aria-label on icon-only buttons
   - menu keyboard interactions + focus return.

### Validation
- UX QA pass (desktop + mobile breakpoints).
- Keyboard-only smoke test.

### Exit Criteria
- No browser-native blocking dialogs remain in forms dashboard flows.
- Save confidence and unsaved warnings visible in editor flows.

---

## Phase 4 — Test Hardening & CI Guardrails (1.5–2 days)

### Tasks
1. Add E2E suite for core journeys:
   - list + filters + pagination
   - create + edit + publish/unpublish
   - delete/archive flow
   - responses export
   - analytics load.
2. Add API integration tests for forms routes (auth + status + pagination).
3. Add regression checklist to PR template for forms changes.
4. Enable test run in CI with required status check.

### Exit Criteria
- E2E and API suites pass in CI.
- Regression checklist in place and used.

---

## Work Breakdown (Suggested Owners)
- **Frontend Owner:** list pagination/search resilience, dialogs/toasts, save-state, unsaved warning.
- **Backend Owner:** auth cookie consistency, API response normalization, status semantics.
- **QA Owner:** E2E scenarios, accessibility and smoke matrix.

---

## Risks + Contingencies
1. **Legacy route dependence**
   - Mitigation: redirect + telemetry on deprecated route hits.
2. **Behavior changes for users with many forms**
   - Mitigation: clear pagination UX and defaults.
3. **Schedule pressure**
   - Mitigation: ship Phase 1+2 first (highest reliability ROI).

---

## Milestones
- **M1:** Phase 1 complete (correctness hotfixes)
- **M2:** Phase 2 complete (list reliability/perf)
- **M3:** Phase 3 complete (UX parity)
- **M4:** Phase 4 complete (test/CI hardening)

---

## Definition of Success
1. No critical auth/route/status regressions in forms module.
2. Forms list scales beyond first 20 records with deterministic UX.
3. Users receive modern, clear, non-blocking feedback for all actions.
4. Core forms journeys are protected by repeatable E2E coverage.
