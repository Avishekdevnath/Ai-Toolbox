# Forms Dashboard Stabilization Spec

## Document Info
- **Feature:** `/dashboard/forms` ecosystem (list, create, edit, responses, analytics)
- **Author:** Copilot (GPT-5.3-Codex)
- **Date:** 2026-03-25
- **Status:** Proposed

## 1) Problem Statement
The forms feature works functionally in many paths, but has critical reliability and UX consistency issues that create user confusion and increase regression risk.

### Primary pain points
1. Session/auth inconsistencies in some API routes (analytics cookie mismatch).
2. Incomplete user journeys at scale (no pagination in main dashboard list).
3. Divergent implementations (`/create` vs `/new`, multiple list UIs).
4. Inconsistent state/feedback patterns (`alert/confirm/prompt`, weak async states).
5. Unclear and partially mismatched domain semantics (status options include `unpublished` while model uses `draft|published|archived`).
6. Insufficient automated E2E + integration test coverage for key forms flows.

## 2) Goals
1. Make forms flows reliable for all user paths (create, edit, publish, delete/archive, responses, analytics, export).
2. Align domain model + UI behavior across all forms pages.
3. Improve UX quality (clear feedback, consistent design language, resilient async behavior).
4. Add test safety nets for core high-risk journeys.

## 3) Non-Goals
1. Full redesign of forms product UX from scratch.
2. New form field types or major schema expansions.
3. Backend architecture rewrite.

## 4) Scope
### In Scope
- `/dashboard/forms`
- `/dashboard/forms/create` and `/dashboard/forms/new`
- `/dashboard/forms/[id]/edit`
- `/dashboard/forms/[id]/responses`
- `/dashboard/forms/[id]/analytics`
- API routes under `/api/forms/**`

### Out of Scope
- Public form filling page redesign (`/f/:slug`) beyond compatibility checks.

## 5) Current Gaps to Fix

## 5.1 Critical E2E Gaps
1. **Analytics API auth cookie mismatch**
   - `src/app/api/forms/[id]/analytics/route.ts` uses `auth_token`; system standard is `user_session`.
2. **Main list pagination missing**
   - List API paginates, UI does not expose page/offset controls.
3. **Status semantics mismatch**
   - Create flow includes `unpublished`, model enum does not.
4. **N+1 response count behavior**
   - List API already returns counts; client refetches per-row counts.
5. **Concurrent fetch race risk in filters/search**
   - No debouncing or request cancellation.
6. **Duplicate route architecture (`create` vs `new`)**
   - Two creation experiences diverging in behavior and maintainability.

## 5.2 UX Gaps
1. Native browser dialogs (`alert`, `confirm`, `prompt`) used in primary actions.
2. Inconsistent visual system across forms pages.
3. Weak save confidence (no autosave or “last saved” feedback).
4. No unsaved-changes protection before navigation.
5. Uneven accessibility semantics for icon-only controls and row menus.

## 6) Requirements

## 6.1 Functional Requirements
- FR-1: Analytics API must authenticate using `user_session` like other forms APIs.
- FR-2: Main forms dashboard must support page navigation with server-driven pagination.
- FR-3: Forms status values must be unified and enforced (`draft|published|archived`).
- FR-4: Forms creation must use one canonical route/flow; alternate path redirects to canonical.
- FR-5: Delete/archive/publish/duplicate/copy-link actions must provide clear in-app feedback (toast/dialog).
- FR-6: Search and filters must avoid stale response rendering (debounce + abort previous requests).
- FR-7: Row count refresh should avoid N+1 by default and leverage list payload counts.

## 6.2 UX Requirements
- UX-1: Consistent page header hierarchy and action placement across list/create/edit/responses.
- UX-2: Replace blocking browser dialogs with app-native components.
- UX-3: Save workflow must show status (`saving`, `saved`, `failed`) and timestamp.
- UX-4: Unsaved changes warning on route leave/close for create/edit.
- UX-5: Empty/error states must include recovery actions (retry, clear filters, create form).

## 6.3 Accessibility Requirements
- A11Y-1: Every icon-only button has `aria-label`.
- A11Y-2: Menus and dialogs are keyboard navigable, with Escape to close and focus return.
- A11Y-3: Inputs and filters use proper labels and focus-visible styles.

## 7) Technical Approach

### 7.1 Data/State
- Introduce canonical query state for forms list:
  - `q`, `status`, `type`, `limit`, `offset` (or `page`).
- Add debounce for `q` updates (250–400ms).
- Cancel in-flight list requests on state changes via `AbortController`.

### 7.2 Routing
- Define canonical create route: **`/dashboard/forms/create`** (or `/new`, choose one).
- Non-canonical route performs hard redirect to canonical to prevent drift.

### 7.3 API consistency
- Use one auth cookie standard: `user_session`.
- Standardize API success/error response shape for forms endpoints.

### 7.4 UX components
- Use app toast system for success/error info.
- Use dialog component for destructive confirmations.
- Add persistent save state indicator in builder/editor header.

## 8) Acceptance Criteria
1. Logged-in user can access forms analytics without unauthorized error caused by token-name mismatch.
2. Forms list supports paging and can navigate >20 items predictably.
3. Status values are consistent across model/API/UI; no orphan `unpublished` state appears.
4. Create route is singular and stable; old route redirects correctly.
5. No browser-native blocking dialogs in forms dashboard flows.
6. Search/filter interactions do not show stale results after rapid typing.
7. Response counts come from list payload by default; no visible per-row loading jitter on initial render.
8. Unsaved changes warning appears when leaving create/edit with dirty state.
9. Icon actions are accessible via screen readers and keyboard.

## 9) Test Strategy

### 9.1 Integration/API Tests
- `/api/forms/[id]/analytics` auth with valid `user_session`.
- Status transition tests: draft→published→archived.
- Pagination tests: limit/offset boundaries and total integrity.

### 9.2 E2E tests (Playwright)
1. Forms list loads and paginates.
2. Search/filter updates list correctly and deterministically under rapid input.
3. Create form happy path and redirect to edit.
4. Edit + unsaved changes warning.
5. Publish/unpublish/delete actions with dialog + toast feedback.
6. Responses export flow (csv/excel/json-based pdf path).
7. Analytics page authorized access and rendering.

### 9.3 Accessibility checks
- Keyboard-only navigation through list action menus and dialogs.
- Basic label and aria smoke checks for action controls.

## 10) Risks & Mitigations
- **Risk:** Refactor introduces regressions in legacy forms pages.
  - **Mitigation:** Route-level feature flags and phased rollout.
- **Risk:** Debounce/cancellation may break expected immediate behavior.
  - **Mitigation:** Keep debounce short and show “searching…” state.
- **Risk:** Create-flow unification affects bookmarks/links.
  - **Mitigation:** Permanent redirects from deprecated route.

## 11) Rollout
1. Ship auth + status + route canonicalization first.
2. Ship list pagination + fetch resilience.
3. Ship UX upgrades (dialogs/toasts/save-state/unsaved warning).
4. Ship test suite and enforce in CI.

## 12) Definition of Done
- All acceptance criteria pass.
- E2E suite green on core forms journeys.
- No critical UX blockers in manual smoke test.
- Team agrees canonical route and status semantics are documented and adopted.
