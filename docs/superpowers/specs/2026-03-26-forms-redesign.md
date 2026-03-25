# Forms Feature — E2E UI/UX Redesign Spec

**Date:** 2026-03-26
**Status:** Approved for implementation
**Scope:** Forms feature only — builder, list, responses, analytics, public responder page

---

## 1. Design Direction

**Option B — Clean Light + Dark Adaptive**

**Dashboard shell (verified from source):**
- Sidebar: `bg-slate-900` (dark) — already exists, not touched
- Content area wrapper: `bg-slate-50` — this wraps ALL dashboard pages including forms

**Forms dashboard pages (`/dashboard/forms/**`):**
- Match the existing content area: `bg-slate-50` base, white (`bg-white`) cards with `border-slate-200` borders
- Visual quality comes from design polish — blue accents, better typography, stats bar, three-panel builder — NOT a dark background
- Making forms pages dark (slate-900) would create a dark island inside a light shell — wrong

**Public responder page (`/f/[id]`):**
- Pure white (`bg-white`) background, centered card, no dashboard chrome, maximum readability

**Shared:**
- Design tokens: Plus Jakarta Sans, blue primary (#2563EB), orange accent (#EA580C)
- Shadcn/ui components throughout, Lucide icons
- All interactive transitions use Framer Motion with 200ms ease-out unless stated otherwise (slide-overs from right, bottom sheets from bottom, panel appearances)
- Layout: shared dashboard sidebar always visible (no focused workspace mode)
- Navigation: full page navigation between list → detail

---

## 2. Pages in Scope

| Page | Route | Change |
|------|--------|--------|
| Forms List | `/dashboard/forms` | Redesign — upgraded table, stats bar, better empty state |
| Form Builder | `/dashboard/forms/[id]/edit` | Redesign — three-panel layout |
| Form Create | `/dashboard/forms/create` | Redirect to builder (no change) |
| Responses | `/dashboard/forms/[id]/responses` | Redesign — sub-nav, slide-over detail, bulk actions |
| Analytics | `/dashboard/forms/[id]/analytics` | Redesign — tabbed sections |
| Public Form | `/f/[id]` | Redesign — three display modes, identity gate |

No new routes added. No existing routes removed.

---

## 3. Forms List Page (`/dashboard/forms`)

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header: "Forms" + subtitle + "New Form" CTA (blue)  │
├─────────────────────────────────────────────────────┤
│ Stats bar: [Total] [Published] [Draft] [Responses↑] │
├─────────────────────────────────────────────────────┤
│ Filter row: [Search input] [Status ▼] [Type ▼]      │
├─────────────────────────────────────────────────────┤
│ Toast: success/error notices (auto-dismiss 3.2s)    │
├─────────────────────────────────────────────────────┤
│ Forms table (upgraded, not replaced)                │
│ ─────────────────────────────────────────────────── │
│ Pagination bar                                      │
└─────────────────────────────────────────────────────┘
```

### Stats Bar
- 4 inline stat chips: **Total Forms · Published · Drafts · Responses This Week**
- Each chip: icon + number + label, subtle border, white background
- Derived from existing API data — no new endpoints needed

### Forms Table (Upgraded)
- Keep existing `FormsTable` component, upgrade styling only
- Each row: Form title · Type badge (colored) · Status badge · Response count · Last updated · `⋯` action menu
- Type badges: General (slate) · Survey (purple) · Quiz (orange) · Attendance (green)
- Status badges: Draft (yellow) · Published (blue) · Archived (gray)
- Row hover: subtle blue-left border highlight
- `⋯` menu actions: Edit · Responses · Analytics · Duplicate · Copy Link · Delete
- Row click → navigates to builder

### Page States
- **Loading:** centered spinner + "Loading forms..." text inside a white card (current behavior, keep)
- **Empty (no forms exist):** illustrated empty state — SVG icon, "No forms yet" heading, "Create your first form" CTA (primary blue button)
- **Empty (search/filter has no results):** same illustrated state with "No results found" heading, "Try adjusting your search or filters" subtext, no CTA button
- **Error:** red banner with error message + Dismiss button (current behavior, keep)

### Mobile
- Stats bar: 2×2 grid instead of 4-inline
- Filter row: search full width, dropdowns below in a row
- Table: horizontal scroll or simplified card-per-row fallback

---

## 4. Form Builder (`/dashboard/forms/[id]/edit`)

### Top Bar
```
[← Forms]  [Form Title — editable inline]  [type badge]
                    [Edit · Responses · Analytics]  [Preview] [Save] [Publish]
```
- `Edit · Responses · Analytics` sub-nav lives **inside the top bar** (right of form title, left of action buttons)
- `Save` = blue primary button, shows spinner while saving. On save failure: button resets to "Save", red toast appears ("Failed to save — try again")
- `Publish/Unpublish` = outline button, toggles form status
- `Preview` = opens public form in new tab (`/f/[id]`)
- Form title: click-to-edit inline input, auto-saves on blur

### Sub-Navigation Consistency
- **Builder page:** `Edit · Responses · Analytics` tabs live inside the top bar (space-efficient, keeps three panels full height)
- **Responses and Analytics pages:** sub-nav renders as a dedicated tab row **below** the page header (these pages are single-column, not three-panel; a tab row is more readable)
- This is an intentional layout difference, not an inconsistency

### Builder Page States
- **Loading (form fetch):** three-panel shell renders immediately; center canvas shows 3 skeleton field cards while data loads
- **Fetch error (404 / 500):** center canvas shows error state — "Couldn't load this form" + "Retry" button + "← Back to Forms" link. Left and right panels are hidden.
- **Save failure:** Save button resets to normal state + red toast at top right: "Failed to save. Try again." Toast auto-dismisses after 4 seconds.

### Three-Panel Layout (Desktop ≥ 768px)

```
┌──────────────┬────────────────────────┬──────────────────┐
│ LEFT 240px   │ CENTER flex-1          │ RIGHT 300px      │
│              │                        │                  │
│ [Add][Fields]│ ┌──────────────────┐   │ [Field][Settings]│
│              │ │ Form Title       │   │                  │
│ Add tab:     │ │ Description      │   │ Field tab:       │
│ ─────────    │ │ ──────────────── │   │ (active when     │
│ Basic        │ │ □ Field 1        │   │  field selected) │
│  Short Text  │ │ □ Field 2        │   │  Label           │
│  Paragraph   │ │ □ Field 3 ◄─ ●  │   │  Placeholder     │
│  Number      │ │ + Add Field      │   │  Help Text       │
│  Email       │ └──────────────────┘   │  Required toggle │
│              │  max-width 680px       │  Options editor  │
│ Choice       │  centered, white card  │  Quiz config     │
│  Dropdown    │  soft shadow           │                  │
│  Multi Choice│                        │ Settings tab:    │
│  Checkboxes  │                        │  General         │
│              │                        │  Identity Gate   │
│ Date & Time  │                        │  Schedule        │
│  Date        │                        │  Display Mode    │
│  Time        │                        │                  │
│              │                        │                  │
│ Fields tab:  │                        │                  │
│ ─────────    │                        │                  │
│ 1. Field 1   │                        │                  │
│ 2. Field 2   │                        │                  │
│ 3. Field 3 ● │                        │                  │
└──────────────┴────────────────────────┴─────────────────-┘
```

### Left Panel — Two Tabs

**`Add` tab (Field Palette):**
- Field types grouped: `Basic` · `Choice` · `Date & Time`
- Each type: small icon + label, click to add at bottom of canvas
- **Phase 1:** click to add at bottom only. Drag-and-drop from palette to canvas position is **Phase 2**.

**`Fields` tab (Navigator):**
- Ordered list of all fields in the form
- Each item: field number + truncated label + field type icon
- Click → jumps canvas scroll to that field + selects it (populates right panel Field tab)
- Active field highlighted with blue left accent
- Useful for long forms with 10+ fields

### Center Canvas
- White card, max-width 680px, centered, soft shadow
- Form title (large, editable) + description (editable) at top
- Each field card:
  - Drag handle (left, visible on hover) — reorders within canvas (Phase 1: drag within canvas is supported; drag from palette is Phase 2)
  - Field label (editable inline)
  - Field preview (actual input/dropdown/radio/etc — non-interactive)
  - On hover: duplicate icon + delete icon (top right of card)
  - Active field: blue left border (3px)
- Click field → selects it, switches right panel to `Field` tab
- `+ Add Field` button at bottom of field list
- Section Break field renders as a full-width horizontal divider with editable label

### Right Panel — Two Tabs

**`Field` tab:**
- Disabled/grayed when no field selected — shows placeholder: "Select a field to configure"
- Clicking a field auto-switches to this tab
- Fields shown contextually by field type:
  - All types: Label · Placeholder · Help Text · Required (toggle)
  - Choice types (dropdown/radio/checkbox): Options editor (add/remove/reorder options)
  - Quiz form type: Correct Answer selector · Points value · Explanation text
  - Section Break: Section label only

**`Settings` tab (Form Settings — always accessible):**

- **General:**
  - Form title · Description · Slug (editable)
  - Form type selector — allowed values: `General` · `Survey` · `Quiz` · `Attendance`
  - If user switches away from `Quiz` type and quiz-specific data exists (correct answers, point values), show a confirmation dialog: "Switching form type will clear quiz settings. Continue?" with Cancel / Confirm buttons.
- **Identity Gate:** toggles for Require Name · Require Email · Require Student ID
- **Schedule:** Start date/time · End date/time (optional)
- **Display Mode:** Radio selector:
  - `All on one page` (Mode B) — default
  - `Paginated sections` (Mode C)
  - `One at a time` (Mode A) — shown with "Coming soon" badge, disabled/unselectable in Phase 1
- **Share:** Read-only share URL input + Copy button

### Mobile (< 768px)
- Top bar: simplified — title + Save button only; sub-nav (`Edit · Responses · Analytics`) and other actions collapse to a `⋯` menu
- Three bottom tabs replace panels (sticky, 48px height, icon + label):
  - `Canvas` (default) — full screen canvas
  - `Fields` — **two sub-tabs within this tab:** `Add` (field palette) and `Navigator` (field list). Rendered as a small toggle/pill switcher at the top of the panel, not a full tab bar. Default to `Add`.
  - `Config` — right panel content: Field config when a field is selected; Form settings otherwise (same context-aware logic as desktop)

---

## 5. Public Form Responder Page (`/f/[id]`)

### Light-mode, clean design. High contrast, accessible.

### Identity Gate Screen (if enabled)
- Shown before the form loads
- Centered card, max-width 480px, white, soft shadow
- Form title visible at top (so responder knows what they're filling)
- Only required fields shown (Name · Email · Student ID — per settings)
- "Start Form →" CTA in blue
- Small privacy note below CTA: "Your info is only shared with the form owner"
- No sidebar, no dashboard chrome — clean standalone page

### Display Mode B — All on One Page (Default / Phase 1)
- Centered card, max-width 640px, white background, padding 32px
- Form title (h1) + description at top
- All fields stacked, generous spacing (24px between fields)
- Sticky progress bar at top: thin blue bar showing % completion (calculated as filled required fields / total required fields)
- Single `Submit` button at bottom (blue, full width on mobile)
- Field error states: red border + inline error message below field, shown on blur and on submit attempt

### Display Mode C — Paginated Sections (Phase 1)
- Same centered card as Mode B
- Fields grouped by Section Break fields — one section per page
- Pressing `Next →` **validates the current section first**: if required fields are empty or invalid, inline errors display and navigation is blocked
- `Next →` and `← Back` navigation buttons
- Step indicator: "Step 2 of 4" with dot progress indicator
- Smooth fade transition between sections (Framer Motion, 200ms)
- Final section: Submit button replaces Next

### Display Mode A — One at a Time (Phase 2)
- Full viewport height per question
- Large question text (2xl), single input centered below
- `Enter ↵` or `→` button to advance
- Smooth slide-up transition between questions (Framer Motion)
- Thin progress bar at top
- **Ships as disabled in Phase 1** — builder shows the option with "Coming soon" badge, cannot be selected

### Quiz End Screen
- Score reveal: "You scored 18/25 (72%)"
- Breakdown: correct vs. incorrect per question
- Option to retake (if multiple submissions allowed)
- Share score button (Web Share API)

### Shared Across All Modes
- Form title in `<title>` tag (SEO)
- Inline validation on blur (not on submit only)
- Red border + message below field for errors
- Mobile: full width, 44px minimum tap targets, keyboard-aware scroll

---

## 6. Responses Page (`/dashboard/forms/[id]/responses`)

### Layout
```
┌──────────────────────────────────────────────────┐
│ [← Forms]  Form Title                            │
├──────────────────────────────────────────────────┤
│ [Edit] [Responses ●] [Analytics]  (tab row)      │
├──────────────────────────────────────────────────┤
│ Stats: [Total] [Today] [Completion Rate]         │
├──────────────────────────────────────────────────┤
│ [Search] [Date range filter]  [Export CSV]       │
├──────────────────────────────────────────────────┤
│ Responses table                                  │
│  Checkbox │ Name/Email │ Date │ Status │ Score   │
│  ─────────────────────────────────────────────── │
│  Bulk actions bar (appears when rows selected)   │
├──────────────────────────────────────────────────┤
│ Pagination                                       │
└──────────────────────────────────────────────────┘
```
- Sub-nav (`Edit · Responses · Analytics`) renders as a **dedicated tab row below the form title header** (different from builder, which embeds sub-nav in the top bar — intentional)
- `Responses` tab underlined/active in blue
- Score column: only visible if form type = quiz

### Page States
- **Loading:** skeleton table rows (5 rows with pulsing gray blocks)
- **Empty (zero responses, new form):** centered empty state inside table area — "No responses yet" + "Share your form to start collecting responses" + Copy Link button
- **Empty (search/filter has no results):** "No responses match your filters" + "Clear filters" button
- **Error (API failure):** red banner at top of table area + "Retry" button

### Response Detail (Slide-Over)
- Click any row → opens slide-over panel from right (desktop, 400px wide, Framer Motion slide from right, 200ms)
- Slide-over header: respondent name/email + submission date/time
- For quiz forms: score display in header ("18/25 · 72%") + pass/fail badge
- Body: full response field-by-field — field label above, answer below, alternating light background per field
- Close: `✕` button top-right, or press `Escape`, or click backdrop
- Mobile: bottom sheet (slides up from bottom) instead of side slide-over

### Bulk Actions Bar
- Appears above table when ≥1 row selected (Framer Motion slide-down from top, 150ms)
- Actions: `Export selected (CSV)` · `Delete selected`
- Shows count: "3 responses selected"
- Selecting all: checkbox in table header selects current page

---

## 7. Analytics Page (`/dashboard/forms/[id]/analytics`)

### Layout
```
┌──────────────────────────────────────────────────┐
│ [← Forms]  Form Title                            │
├──────────────────────────────────────────────────┤
│ [Edit] [Responses] [Analytics ●]  (tab row)      │
├──────────────────────────────────────────────────┤
│ [Overview] [Fields] [AI Insights]  (inner tabs)  │
├──────────────────────────────────────────────────┤
│ Tab content (see below)                          │
└──────────────────────────────────────────────────┘
```
- Sub-nav is a dedicated tab row (same as Responses page)

### Overview Tab

**Loading state:** 4 skeleton stat cards (pulsing) + placeholder chart area with spinner

**Empty state (zero responses):** stat cards show 0 values; chart area shows "No data yet — share your form to start collecting responses"

**Content:**
- 4 stat cards (bento grid, 2×2): Total Responses · Avg Completion Time · Completion Rate · Drop-off Rate
- Response timeline chart: line chart, responses per day (last 30 days), Recharts

### Fields Tab

**Loading state:** skeleton accordion rows

**Empty state (zero responses):** "No response data yet" message

**Content:**
- Collapsible accordion per field (collapsed by default)
- Each field accordion header: field label + response count
- Expanded: answer breakdown
  - Choice fields (dropdown/radio/checkbox): horizontal bar chart of option frequency
  - Text fields: most common responses list (top 10)
  - Number fields: min/max/average
  - Date fields: distribution chart
- If a field has zero responses: accordion expands to show "No answers for this field yet"

### AI Insights Tab

**Before "Generate" is clicked:** centered card with "Generate AI Insights" button + description: "Analyze response patterns and get AI-powered recommendations"

**Loading (AI call in progress):** spinner + "Analyzing responses..." text

**Error (AI call fails):** "Failed to generate insights" + "Try again" button

**Success:** bullet point insights about response patterns, styled as a card

**Quiz Leaderboard** (only if form type = quiz):
- Ranked table: Rank · Name · Score · Time taken
- Shown below AI insights card
- Empty state: "No completed quiz submissions yet"

---

## 8. Component Architecture

### New / Heavily Modified Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `FormBuilderLayout` | `components/forms/builder/` | Three-panel shell, top bar |
| `FieldPalette` | `components/forms/builder/` | Left panel Add tab |
| `FieldNavigator` | `components/forms/builder/` | Left panel Fields tab |
| `BuilderCanvas` | `components/forms/builder/` | Center panel |
| `FieldConfig` | `components/forms/builder/` | Right panel Field tab |
| `FormSettingsPanel` | `components/forms/builder/` | Right panel Settings tab |
| `PublicFormShell` | `components/forms/public/` | Responder page wrapper |
| `IdentityGate` | `components/forms/public/` | Gate screen (exists, restyled) |
| `FormModeB` | `components/forms/public/` | All-on-one-page renderer |
| `FormModeC` | `components/forms/public/` | Paginated sections renderer |
| `ResponseSlideOver` | `components/forms/responses/` | Response detail panel (desktop slide-over / mobile bottom sheet) |
| `FormsStatChips` | `components/forms/` | Configurable stat chips — accepts `stats: { icon, value, label }[]` prop. Used on list page (4 chips), responses page (3 chips). Analytics page uses its own bento cards inside the Overview tab, not this component. |

### Preserved Components (style updates only)
- `FormsTable` — keep logic, update styles
- `AIInsights` — keep logic, restyle card wrapper
- `QuizResults` — keep logic, restyle
- `useFormsData` hook — no changes
- All API routes — no changes

---

## 9. Data & API

### Existing Endpoints (unchanged routes)
- `GET /api/forms` — list with status/type filters
- `GET /api/forms/[id]` — form detail for builder
- `PUT /api/forms/[id]` — save form (fields + settings)
- `GET /api/forms/[id]/responses` — responses table
- `GET /api/forms/[id]/analytics` — analytics data
- `GET /api/forms/[id]/ai-insights` — AI insights

### Schema Addition — `displayMode`
A new `displayMode` field is added to the form settings schema. This is a **schema migration**, not a new endpoint.

- **Type:** `'all' | 'paginated' | 'one-at-a-time'`
- **Default value:** `'all'`
- **Existing records:** must be backfilled with `'all'` as default (migration script or application-level default on read)
- **TypeScript types:** update `FormSettingsState` type in the builder and any shared form type definitions to include `displayMode`
- **API contract:** `PUT /api/forms/[id]` payload and `GET /api/forms/[id]` response both need to include `displayMode` in the settings object

---

## 10. Phasing

### Phase 1 (This implementation)
- Forms list upgrade (stats bar, table polish, empty state)
- Three-panel builder (all panels, both tabs per panel)
- Display Mode B (all on one page) — public form
- Display Mode C (paginated sections) — public form
- Identity gate redesign
- Responses page (slide-over detail, bulk actions)
- Analytics page (3 tabs)
- Drag-and-drop **within canvas** (reorder fields by dragging)

### Phase 2 (Future)
- Display Mode A (one at a time, Typeform style)
- Drag-and-drop **from palette to canvas position** (Phase 1 = click to add at bottom only)
- Form branding customization (logo, colors)

---

## 11. Mobile Breakpoints

| Breakpoint | Behavior |
|-----------|---------|
| < 640px (sm) | Single column everything, bottom sheet modals |
| 640–768px | Partial — filters in row, table scrollable |
| ≥ 768px (md) | Three-panel builder, slide-over responses |
| ≥ 1280px (xl) | Comfortable panel widths, no overflow |

---

## 12. Design Tokens (from existing globals.css)

```css
/* Use existing tokens — no new tokens needed */
--color-primary: #2563EB;
--color-primary-hover: #1D4ED8;
--color-accent: #EA580C;
--color-surface: #FFFFFF;
--color-background: #F8FAFC;
--color-text-primary: #1E293B;
--color-text-secondary: #64748B;
--color-border: #E2E8F0;

/* Dashboard dark base */
--dashboard-bg: theme(colors.slate.900);
--dashboard-surface: theme(colors.slate.800);
```

---

## 13. Success Criteria

- [ ] Forms list loads with stats bar (4 chips) and upgraded table
- [ ] Forms list empty state renders correctly for both "no forms" and "no results" cases
- [ ] Three-panel builder renders correctly on desktop (≥ 768px)
- [ ] Left panel tab switching (Add ↔ Fields/Navigator) works
- [ ] Right panel tab switching (Field ↔ Settings) works
- [ ] Clicking a field selects it and populates right Field tab
- [ ] Switching form type to/from Quiz shows confirmation dialog when quiz data exists
- [ ] `displayMode` setting saves and persists correctly
- [ ] Builder loading skeleton renders while form data fetches
- [ ] Builder fetch error state renders with Retry button
- [ ] Builder save failure shows red toast
- [ ] Public form renders in Mode B (all on page) with progress bar
- [ ] Public form renders in Mode C (paginated sections) with section validation on Next
- [ ] Identity gate screen shows when enabled, with form title visible
- [ ] Quiz end screen shows score breakdown
- [ ] Responses page loading skeleton renders
- [ ] Responses page empty state renders for zero responses
- [ ] Response slide-over opens on row click (desktop) and bottom sheet (mobile)
- [ ] Quiz response slide-over shows score in header
- [ ] Bulk actions bar appears when rows are selected
- [ ] Analytics Overview tab renders stat cards and timeline chart
- [ ] Analytics Fields tab renders accordion with per-field breakdowns
- [ ] Analytics AI Insights tab: Generate button → loading → results flow works
- [ ] Analytics AI Insights tab: error state shows with retry
- [ ] Analytics empty states render correctly when zero responses exist
- [ ] All pages responsive at 375px (mobile) and 1440px (desktop)
- [ ] No existing API endpoints broken
- [ ] `displayMode` field backfill default (`'all'`) works on existing form records
- [ ] Dashboard forms pages use bg-slate-50 base consistent with dashboard shell
- [ ] Public form page uses pure white bg with no dashboard chrome
