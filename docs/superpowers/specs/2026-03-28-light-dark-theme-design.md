# Light & Dark Theme System — Design Spec

**Date:** 2026-03-28
**Scope:** Full application — Public pages, Dashboard, Admin panel
**Approach:** Token-first migration with expanded CSS variable system

---

## 1. Overview

Add a complete, consistent light/dark theme system across all three UI surfaces (public, dashboard, admin). The app already has partial dark mode infrastructure — a custom `useTheme()` hook, 12 CSS variable tokens in `:root`/`.dark`, and ~1,571 scattered `dark:` classes. This spec expands the token vocabulary, adds a theme toggle component, prevents flash-of-wrong-theme, and migrates hardcoded colors to tokens in prioritized waves.

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dark aesthetic | Slate Dark (`slate-900`/`slate-950`) | Matches existing `.dark` tokens, professional, pairs with blue-600 primary |
| Toggle UI | Dropdown (icon button → menu) | Compact in header, shows all 3 options (Light/Dark/System) explicitly |
| Toggle placement | Per-area headers (Navbar, DashboardHeader, AdminHeader) | Accessible in every context, all share same `useTheme()` hook + localStorage |
| Migration strategy | Expand tokens + migrate in waves | Shippable at every stage, clean architecture, future-proof |
| Theme library | Keep custom `useTheme()` hook | Already works, no unnecessary dependency |
| Color reference syntax | `bg-[var(--color-surface)]` | Existing pattern in codebase, works in Tailwind v4, no rename needed |

---

## 2. Expanded Token System

### Existing Tokens (unchanged)

| Token | Light | Dark |
|-------|-------|------|
| `--color-primary` | `#2563EB` | `#3B82F6` |
| `--color-primary-hover` | `#1D4ED8` | `#2563EB` |
| `--color-accent` | `#EA580C` | `#F97316` |
| `--color-accent-hover` | `#C2410C` | `#EA580C` |
| `--color-surface` | `#FFFFFF` | `#0F172A` |
| `--color-background` | `#F8FAFC` | `#020617` |
| `--color-text-primary` | `#1E293B` | `#F1F5F9` |
| `--color-text-secondary` | `#64748B` | `#94A3B8` |
| `--color-border` | `#E2E8F0` | `#334155` |
| `--color-muted` | `#E9EFF8` | `#1A1E2F` |
| `--color-muted-foreground` | `#64748B` | `#94A3B8` |
| `--color-destructive` | `#DC2626` | `#EF4444` |
| `--color-ring` | `#2563EB` | `#3B82F6` |

### New Tokens

| Token | Purpose | Light | Dark |
|-------|---------|-------|------|
| `--color-surface-secondary` | Nested cards, table rows, inner panels | `#F8FAFC` | `#1E293B` |
| `--color-surface-tertiary` | Hover rows, subtle highlights, skeleton loaders | `#F1F5F9` | `#263044` |
| `--color-border-subtle` | Dividers, separators (lighter than main border) | `#F1F5F9` | `#1E293B` |
| `--color-text-muted` | Timestamps, hints, placeholders | `#94A3B8` | `#718096` |
| `--color-text-inverse` | Text on primary-colored backgrounds | `#FFFFFF` | `#FFFFFF` |
| `--color-success` | Success states, confirmations | `#16A34A` | `#22C55E` |
| `--color-success-muted` | Success background tints | `#F0FDF4` | `#0D2818` |
| `--color-warning` | Warning states | `#D97706` | `#FBBF24` |
| `--color-warning-muted` | Warning background tints | `#FFFBEB` | `#1F1A0A` |
| `--color-destructive-muted` | Error/danger background tints | `#FEF2F2` | `#2D0F0F` |
| `--color-primary-muted` | Primary tint backgrounds (badges, highlights) | `#EFF6FF` | `#0C2340` |
| `--color-overlay` | Modal/dialog backdrops | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` |
| `--color-shadow` | Box shadow color | `rgba(0,0,0,0.08)` | `rgba(0,0,0,0.4)` |

**Total:** 26 tokens (13 existing + 13 new)

### Token-to-Pattern Mapping

How hardcoded Tailwind classes map to tokens:

| Hardcoded Pattern | Replacement Token |
|-------------------|-------------------|
| `bg-white` | `bg-[var(--color-surface)]` |
| `bg-slate-50` | `bg-[var(--color-surface-secondary)]` or `bg-[var(--color-background)]` |
| `bg-slate-100` | `bg-[var(--color-surface-tertiary)]` |
| `text-slate-800`, `text-slate-900` | `text-[var(--color-text-primary)]` |
| `text-slate-600`, `text-slate-500` | `text-[var(--color-text-secondary)]` |
| `text-slate-400` | `text-[var(--color-text-muted)]` |
| `border-slate-200` | `border-[var(--color-border)]` |
| `border-slate-100` | `border-[var(--color-border-subtle)]` |
| `bg-blue-50` | `bg-[var(--color-primary-muted)]` |
| `bg-red-50` | `bg-[var(--color-destructive-muted)]` |
| `bg-green-50` | `bg-[var(--color-success-muted)]` |
| `bg-amber-50` | `bg-[var(--color-warning-muted)]` |
| `bg-violet-50`, `bg-rose-50` (decorative) | `bg-violet-500/10`, `bg-rose-500/10` (opacity-based) |

### Decorative Accent Colors

Components like QuoteCard use decorative color tints (`bg-blue-50`, `bg-violet-50`, `bg-rose-50`, `bg-amber-50`). These are NOT semantic tokens — they are intentional design choices per-component.

**Strategy:** Replace with opacity-based equivalents that work on any background:
- `bg-blue-50` → `bg-blue-500/10`
- `bg-violet-50` → `bg-violet-500/10`
- `bg-rose-50` → `bg-rose-500/10`
- `bg-amber-50` → `bg-amber-500/10`
- `bg-emerald-50` → `bg-emerald-500/10`

Opacity-based colors naturally adapt — 10% blue on white looks light blue, 10% blue on dark slate looks muted navy.

---

## 3. ThemeDropdown Component

**File:** `src/components/ui/ThemeDropdown.tsx`

### Behavior
- Renders an icon button: `Sun` (light), `Moon` (dark), `Monitor` (system) from Lucide
- Click toggles a dropdown with three options, each showing icon + label
- Active option highlighted with `--color-primary-muted` background + check mark
- Dropdown styled with token classes (auto-themed)
- Closes on outside click (useRef + mousedown listener) or Escape key
- Calls `setTheme()` from existing `useTheme()` hook
- Adds `theme-transition` class to `<html>` on toggle, removes after 300ms

### Props
```typescript
interface ThemeDropdownProps {
  className?: string;  // For positioning in different headers
}
```

### Placement
| Area | Location | Position |
|------|----------|----------|
| Public Navbar | `src/components/Navbar.tsx` | Right side, before sign-in/auth buttons |
| Dashboard Header | `src/components/dashboard/DashboardHeader.tsx` | Right side, before user avatar/menu |
| Admin Header | `src/components/admin/AdminHeader.tsx` | Right side, before admin avatar/menu |

---

## 4. Flash-of-Wrong-Theme Prevention

### CSS Flash Prevention

Add a blocking inline script in `src/app/layout.tsx` between `<html>` and `<body>`. Next.js App Router allows an explicit `<head>` that merges with the auto-generated one:

```tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: `
      (function(){
        try {
          var t = localStorage.getItem('theme');
          var d = document.documentElement;
          if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
            d.classList.add('dark');
          } else {
            d.classList.remove('dark');
          }
        } catch(e){}
      })()
    `}} />
  </head>
  <body>...</body>
</html>
```

This reads localStorage synchronously before paint. The existing `suppressHydrationWarning` on `<html>` prevents React hydration mismatch warnings.

### JS-Conditional Rendering Guard

The `useTheme()` hook initializes with `resolvedTheme='light'` on server. Components that branch on `resolvedTheme` in JS (Monaco editor theme, Recharts colors) will flash light→dark on first load.

**Fix:** Add a `mounted` state guard to `useTheme()`:

```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
// Export mounted so consumers can defer rendering
return { theme, resolvedTheme, setTheme, toggleTheme, mounted };
```

Components that need JS-level theme branching (Monaco, Recharts) should:
1. Check `mounted` before rendering
2. Show a skeleton/placeholder until `mounted === true`
3. Then render with the correct `resolvedTheme`

This prevents the flash for JS-conditional rendering. CSS-based theming (token classes) is handled by the inline script and doesn't need this guard.

---

## 5. Theme Transition Animation

Add to `globals.css`:

```css
html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition: background-color 200ms ease, color 150ms ease, border-color 200ms ease !important;
}
```

The `ThemeDropdown` component manages this class:
1. Add `theme-transition` to `document.documentElement`
2. Apply theme change
3. Remove class after 300ms via `setTimeout`

This ensures smooth transitions on manual toggle but NO animation on initial page load or navigation.

---

## 6. Scrollbar Styling

Add to `globals.css`:

```css
.dark {
  scrollbar-color: #334155 transparent;
}

.dark ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.dark ::-webkit-scrollbar-track {
  background: transparent;
}
.dark ::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
```

---

## 7. Print Mode Override

Add to `globals.css`:

```css
@media print {
  html.dark {
    color-scheme: light;
  }
  /* Force light token values for print */
  html.dark {
    --color-surface: #FFFFFF;
    --color-background: #FFFFFF;
    --color-text-primary: #1E293B;
    --color-text-secondary: #64748B;
    --color-border: #E2E8F0;
  }
}
```

---

## 8. Recharts Dark Mode Integration

**File:** `src/hooks/useChartColors.ts`

```typescript
export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return {
    grid: isDark ? '#334155' : '#E2E8F0',
    text: isDark ? '#94A3B8' : '#64748B',
    tooltip: { bg: isDark ? '#1E293B' : '#FFFFFF', border: isDark ? '#334155' : '#E2E8F0' },
    primary: isDark ? '#3B82F6' : '#2563EB',
    secondary: isDark ? '#22C55E' : '#16A34A',
    tertiary: isDark ? '#FBBF24' : '#D97706',
    area: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.08)',
  };
}
```

Chart components read from this hook and pass colors as props to Recharts components (`stroke`, `fill`, `gridStroke`, tooltip styles).

---

## 9. Monaco Editor Theme Sync

In the snippet editor component, sync Monaco theme with app theme:

```typescript
const { resolvedTheme } = useTheme();
// Pass to Monaco
<MonacoEditor theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'} />
```

Monaco's built-in `vs-dark` theme provides a good default. No custom Monaco theme needed.

---

## 10. SVG Asset Audit

- **Lucide icons:** Use `currentColor` — safe, no changes needed
- **Custom SVGs:** Any with hardcoded `fill` or `stroke` hex values need migration to `fill="currentColor"` or CSS token references
- **Scope:** Audit in Wave 4, expected to be minimal since the app primarily uses Lucide

---

## 11. Migration Waves

### Wave 1 — Layouts + Navigation + Infrastructure

**Goal:** Toggle the theme and see all layout shells, navbars, sidebars, headers switch correctly.

**Files:**
- `src/app/globals.css` — Add 13 new tokens, scrollbar styles, theme-transition class, print override
- `src/app/layout.tsx` — Add flash-prevention script
- `src/components/ui/ThemeDropdown.tsx` — Create component
- `src/components/Navbar.tsx` — Add ThemeDropdown, migrate hardcoded colors to tokens
- `src/components/Footer.tsx` — Migrate hardcoded colors to tokens
- `src/components/dashboard/DashboardLayoutClient.tsx` — Migrate `bg-slate-50` etc. to tokens
- `src/components/dashboard/DashboardSidebar.tsx` — Migrate sidebar colors
- `src/components/dashboard/DashboardHeader.tsx` — Add ThemeDropdown, migrate colors
- `src/components/admin/AdminLayoutClient.tsx` — Replace `from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800` with `bg-[var(--color-background)]` (flat) or use CSS `background: linear-gradient(...)` referencing tokens via `var(--color-background)` and `var(--color-surface-secondary)` in a style prop
- `src/components/admin/AdminSidebar.tsx` — Migrate colors
- `src/components/admin/AdminHeader.tsx` — Add ThemeDropdown, migrate colors

**Deliverable:** All three UI surfaces have dark shells with themed nav/sidebar/header. Content areas may still be light.

### Wave 2 — UI Primitives Audit

**Goal:** Every reusable component in `src/components/ui/` renders correctly in both themes.

**Files:** All 22+ components in `src/components/ui/`:
- `Button`, `Card`, `Input`, `Modal`, `Dialog`, `Alert`, `Badge`, `Checkbox`, `Switch`, `Avatar`, `Dropdown Menu`, `Select`, `Tabs`, `Textarea`, `Table`, `Slider`, `Progress`, `Skeleton`, `Separator`, `Label`, `Loader`

**What to do:**
- Audit each — most already use `var(--color-*)` tokens
- Fix any that still use hardcoded colors
- Ensure focus rings, disabled states, hover states use tokens
- Update `Loader.tsx` skeleton colors: `bg-slate-100` → `bg-[var(--color-surface-tertiary)]`

**Deliverable:** All shared primitives are theme-aware.

### Wave 3 — High-Traffic Pages

**Goal:** All user-facing pages render correctly in dark mode.

**Scope:**
- Landing page sections (`src/components/landing/`)
- Tool pages: Quote Generator, Word Counter, Snippet Editor, URL Shortener
- Forms pages: FormsList, FormBuilder, form submission pages
- Dashboard content: forms list, analytics, responses
- Auth pages: sign-in, sign-up, forgot-password

**Specific integrations:**
- Monaco editor: sync theme via `useTheme()` → `vs-dark`/`vs`
- Recharts: create `useChartColors()` hook, apply to chart components
- Decorative accents: migrate `-50` shades to opacity-based (`-500/10`)
- `html-to-image` captures: ensure captured elements have explicit `bg-[var(--color-surface)]`

**Deliverable:** All public and dashboard pages fully themed.

### Wave 4 — Admin + Cleanup

**Goal:** Complete coverage. Clean architecture.

**Scope:**
- Admin panel components (`src/components/admin/`)
- Admin pages: analytics, user management, tool management
- SVG audit: fix any hardcoded fills
- Remaining `dark:` class cleanup — remove where tokens now handle it
- Final WCAG AA contrast audit (4.5:1 minimum)

**Deliverable:** 100% dark mode coverage. Token-only color architecture.

---

## 12. Files Summary

| File | Action | Wave |
|------|--------|------|
| `src/app/globals.css` | Expand tokens, add scrollbar/transition/print styles | 1 |
| `src/app/layout.tsx` | Add flash-prevention script | 1 |
| `src/components/ui/ThemeDropdown.tsx` | Create new | 1 |
| `src/hooks/useChartColors.ts` | Create new | 3 |
| `src/components/Navbar.tsx` | Add toggle + migrate colors | 1 |
| `src/components/Footer.tsx` | Migrate colors | 1 |
| `src/components/dashboard/DashboardLayoutClient.tsx` | Migrate colors | 1 |
| `src/components/dashboard/DashboardSidebar.tsx` | Migrate colors | 1 |
| `src/components/dashboard/DashboardHeader.tsx` | Add toggle + migrate colors | 1 |
| `src/components/admin/AdminLayoutClient.tsx` | Migrate colors | 1 |
| `src/components/admin/AdminSidebar.tsx` | Migrate colors | 1 |
| `src/components/admin/AdminHeader.tsx` | Add toggle + migrate colors | 1 |
| `src/components/ui/*.tsx` (22+ files) | Audit + fix token usage | 2 |
| `src/components/landing/*.tsx` | Migrate colors | 3 |
| `src/components/tools/**/*.tsx` | Migrate colors + decorative accents | 3 |
| `src/components/forms/**/*.tsx` | Migrate colors | 3 |
| `src/components/snippets/*.tsx` | Migrate colors + Monaco theme sync | 3 |
| `src/components/admin/*.tsx` | Migrate colors + SVG audit | 4 |

---

## 13. Success Criteria

- Theme toggle appears in all three area headers and persists across navigation/reload
- No flash of wrong theme on any page load
- All layout surfaces (backgrounds, sidebars, headers) switch correctly
- All UI primitives render with proper contrast in both themes
- Charts and Monaco editor respond to theme changes
- Decorative colors remain visually distinct in dark mode
- WCAG AA contrast (4.5:1) maintained in both themes
- No regression in existing light mode appearance
- Print always outputs in light mode
