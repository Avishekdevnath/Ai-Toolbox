# Light & Dark Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete, consistent light/dark theme with smooth transitions across all three UI surfaces (public, dashboard, admin).

**Architecture:** Expand the existing CSS variable token system from 13 to 26 tokens in `globals.css`. Add a `ThemeDropdown` component to all three area headers. Migrate hardcoded Tailwind colors to token references in four prioritized waves: layouts → UI primitives → pages → admin/cleanup.

**Tech Stack:** Tailwind CSS v4, CSS custom properties, React hooks, Lucide icons, Recharts, Monaco Editor

**Spec:** `docs/superpowers/specs/2026-03-28-light-dark-theme-design.md`

---

## Wave 1 — Infrastructure + Layouts

### Task 1: Expand CSS Token System

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add new tokens to `:root`**

Add these 13 new tokens after the existing `--color-ring` line in the `:root` block:

```css
/* Light mode color tokens */
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-accent: #EA580C;
  --color-accent-hover: #C2410C;
  --color-surface: #FFFFFF;
  --color-background: #F8FAFC;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
  --color-muted: #E9EFF8;
  --color-muted-foreground: #64748B;
  --color-destructive: #DC2626;
  --color-ring: #2563EB;
  --color-surface-secondary: #F8FAFC;
  --color-surface-tertiary: #F1F5F9;
  --color-border-subtle: #F1F5F9;
  --color-text-muted: #94A3B8;
  --color-text-inverse: #FFFFFF;
  --color-success: #16A34A;
  --color-success-muted: #F0FDF4;
  --color-warning: #D97706;
  --color-warning-muted: #FFFBEB;
  --color-destructive-muted: #FEF2F2;
  --color-primary-muted: #EFF6FF;
  --color-overlay: rgba(0,0,0,0.5);
  --color-shadow: rgba(0,0,0,0.08);
}
```

- [ ] **Step 2: Add matching dark tokens to `.dark`**

Replace the entire `.dark` block with:

```css
/* Dark mode color tokens */
.dark {
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-accent: #F97316;
  --color-accent-hover: #EA580C;
  --color-surface: #0F172A;
  --color-background: #020617;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-border: #334155;
  --color-muted: #1A1E2F;
  --color-muted-foreground: #94A3B8;
  --color-destructive: #EF4444;
  --color-ring: #3B82F6;
  --color-surface-secondary: #1E293B;
  --color-surface-tertiary: #263044;
  --color-border-subtle: #1E293B;
  --color-text-muted: #718096;
  --color-text-inverse: #FFFFFF;
  --color-success: #22C55E;
  --color-success-muted: #0D2818;
  --color-warning: #FBBF24;
  --color-warning-muted: #1F1A0A;
  --color-destructive-muted: #2D0F0F;
  --color-primary-muted: #0C2340;
  --color-overlay: rgba(0,0,0,0.7);
  --color-shadow: rgba(0,0,0,0.4);
}
```

- [ ] **Step 3: Add theme transition class, scrollbar styles, and print override**

Add these blocks after the `body { ... }` rule and before the `.html2canvas-bw` rule:

```css
/* Theme transition — applied temporarily on toggle, removed after 300ms */
html.theme-transition,
html.theme-transition *,
html.theme-transition *::before,
html.theme-transition *::after {
  transition: background-color 200ms ease, color 150ms ease, border-color 200ms ease !important;
}

/* Dark mode scrollbar */
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

/* Print — force light mode */
@media print {
  html.dark {
    color-scheme: light;
    --color-surface: #FFFFFF;
    --color-background: #FFFFFF;
    --color-text-primary: #1E293B;
    --color-text-secondary: #64748B;
    --color-border: #E2E8F0;
  }
}
```

- [ ] **Step 4: Verify the file loads without errors**

Run: `npx tsc --noEmit 2>&1 | head -5`
Expected: No new errors (pre-existing errors OK).

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): expand CSS token system to 26 tokens with dark mode, scrollbar, print, transition"
```

---

### Task 2: Add `mounted` Guard to `useTheme` Hook

**Files:**
- Modify: `src/hooks/useTheme.ts`

- [ ] **Step 1: Rewrite `useTheme.ts` with `mounted` state**

Replace the entire file with:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const resolveTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') return getSystemTheme();
    return currentTheme;
  }, [getSystemTheme]);

  // Apply resolved theme to document
  useEffect(() => {
    const newResolvedTheme = resolveTheme(theme);
    setResolvedTheme(newResolvedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newResolvedTheme);
  }, [theme, resolveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setResolvedTheme(getSystemTheme());
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getSystemTheme]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme, mounted };
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit 2>&1 | grep useTheme`
Expected: No errors referencing `useTheme`.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useTheme.ts
git commit -m "feat(theme): add mounted guard to useTheme hook for SSR-safe rendering"
```

---

### Task 3: Add Flash-Prevention Script to Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add `<head>` with inline theme script**

In `src/app/layout.tsx`, add a `<head>` block between `<html>` and `<body>`:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})()` }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <GlobalNotificationProvider>
            <AnalyticsProvider>
              {children}
              {/* <FeedbackWidget /> */}
            </AnalyticsProvider>
          </GlobalNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

Leave all imports, metadata, and the `inter` font unchanged.

- [ ] **Step 2: Verify build doesn't break**

Run: `npx tsc --noEmit 2>&1 | grep layout`
Expected: No new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(theme): add flash-prevention script to root layout"
```

---

### Task 4: Create ThemeDropdown Component

**Files:**
- Create: `src/components/ui/ThemeDropdown.tsx`

- [ ] **Step 1: Create `ThemeDropdown.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

interface ThemeDropdownProps {
  className?: string;
}

export default function ThemeDropdown({ className }: ThemeDropdownProps) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (value: Theme) => {
    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transition');
    setTheme(value);
    setOpen(false);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  // SSR placeholder — render a static button to avoid layout shift
  const ActiveIcon = !mounted
    ? Sun
    : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        aria-label="Toggle theme"
      >
        <ActiveIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg z-50 overflow-hidden">
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-[13px] transition-colors ${
                theme === value
                  ? 'bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">{label}</span>
              {theme === value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit 2>&1 | grep ThemeDropdown`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ThemeDropdown.tsx
git commit -m "feat(theme): create ThemeDropdown component with light/dark/system options"
```

---

### Task 5: Add ThemeDropdown to Public Navbar

**Files:**
- Modify: `src/components/Navbar.tsx`

The Navbar already uses token classes (`var(--color-*)`) throughout — no color migration needed. Just add the toggle.

- [ ] **Step 1: Import ThemeDropdown**

Add this import at the top of `src/components/Navbar.tsx`:

```typescript
import ThemeDropdown from '@/components/ui/ThemeDropdown';
```

- [ ] **Step 2: Add ThemeDropdown to desktop actions**

In the desktop actions area (the `<div className="hidden md:flex items-center gap-3">` block), add `<ThemeDropdown />` as the first child, before the auth conditional:

```tsx
<div className="hidden md:flex items-center gap-3">
  <ThemeDropdown />
  {isAuthenticated ? (
    // ... existing dropdown menu ...
```

- [ ] **Step 3: Add ThemeDropdown to mobile menu**

In the mobile menu, add `<ThemeDropdown />` inside the top nav section, after the last nav link but before the border-t divider:

```tsx
{isAuthenticated && (
  <Link href={dashHref} className={`block px-3 py-2 rounded-lg ${lnk(dashActive)}`} onClick={close}>Dashboard</Link>
)}
<div className="py-2">
  <ThemeDropdown />
</div>
<div className="pt-3 mt-2 border-t border-[var(--color-border)] space-y-1">
```

- [ ] **Step 4: Verify the page renders**

Open `http://localhost:3000` — theme toggle should appear in the navbar. Clicking it should open the dropdown with Light/Dark/System options. Selecting Dark should switch the page background.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(theme): add ThemeDropdown to public Navbar"
```

---

### Task 6: Migrate Dashboard Layout + Header + Add Toggle

**Files:**
- Modify: `src/components/dashboard/DashboardLayoutClient.tsx`
- Modify: `src/components/dashboard/DashboardHeader.tsx`

- [ ] **Step 1: Migrate DashboardLayoutClient**

In `src/components/dashboard/DashboardLayoutClient.tsx`, replace:

```tsx
<div className="flex h-screen w-screen overflow-hidden bg-slate-50">
```

With:

```tsx
<div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)]">
```

- [ ] **Step 2: Migrate DashboardHeader colors**

In `src/components/dashboard/DashboardHeader.tsx`, add the import:

```typescript
import ThemeDropdown from '@/components/ui/ThemeDropdown';
```

Replace the header element:

```tsx
<header className="h-12 flex items-center justify-between px-4 gap-3 bg-white border-b border-slate-200 flex-shrink-0">
```

With:

```tsx
<header className="h-12 flex items-center justify-between px-4 gap-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex-shrink-0">
```

Replace the mobile menu button class:

```tsx
className="lg:hidden w-8 h-8 text-slate-500"
```

With:

```tsx
className="lg:hidden w-8 h-8 text-[var(--color-text-secondary)]"
```

Add `<ThemeDropdown />` before `<HeaderActions />`:

```tsx
<div className="flex items-center gap-2 md:justify-self-end">
  <ThemeDropdown />
  <HeaderActions />
</div>
```

Note: If `HeaderActions` is already wrapped in a `<div>`, place `<ThemeDropdown />` next to it inside the right-side container.

- [ ] **Step 3: Verify dashboard renders**

Open `http://localhost:3000/dashboard` — the layout background and header should respond to theme toggle.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/DashboardLayoutClient.tsx src/components/dashboard/DashboardHeader.tsx
git commit -m "feat(theme): migrate dashboard layout/header to tokens, add ThemeDropdown"
```

---

### Task 7: Migrate Dashboard Sidebar

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx`

The sidebar uses `bg-slate-900` — this is an intentionally dark sidebar that works in both themes. The overlay needs token migration.

- [ ] **Step 1: Migrate overlay color**

In `src/components/dashboard/DashboardSidebar.tsx`, replace:

```tsx
className="fixed inset-0 z-20 bg-black/50 lg:hidden"
```

With:

```tsx
className="fixed inset-0 z-20 lg:hidden"
style={{ backgroundColor: 'var(--color-overlay)' }}
```

Note: The sidebar `bg-slate-900` stays as-is — dark sidebars are intentional and look correct in both themes.

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/DashboardSidebar.tsx
git commit -m "feat(theme): migrate dashboard sidebar overlay to token"
```

---

### Task 8: Migrate Admin Layout + Header + Add Toggle

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/components/admin/AdminHeader.tsx`

- [ ] **Step 1: Migrate admin layout background**

In `src/app/admin/layout.tsx`, replace:

```tsx
<div className="flex h-screen w-screen overflow-hidden bg-slate-50">
```

With:

```tsx
<div className="flex h-screen w-screen overflow-hidden bg-[var(--color-background)]">
```

- [ ] **Step 2: Migrate AdminHeader colors and add ThemeDropdown**

In `src/components/admin/AdminHeader.tsx`, add the import:

```typescript
import ThemeDropdown from '@/components/ui/ThemeDropdown';
```

Replace the header element's class:

```tsx
className="h-12 flex-shrink-0 flex items-center justify-between px-5 bg-white border-b border-slate-200 gap-4"
```

With:

```tsx
className="h-12 flex-shrink-0 flex items-center justify-between px-5 bg-[var(--color-surface)] border-b border-[var(--color-border)] gap-4"
```

Replace the search input container and input:

```tsx
<Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
<input
  type="search"
  placeholder="Search admin panel…"
  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-slate-100 border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
/>
```

With:

```tsx
<Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--color-text-muted)] pointer-events-none" />
<input
  type="search"
  placeholder="Search admin panel…"
  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-[var(--color-surface-tertiary)] border border-[var(--color-border)] rounded-lg placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
/>
```

Replace all notification/profile dropdown hardcoded colors. The pattern is the same throughout — apply this mapping to every class in the file:

| Find | Replace |
|------|---------|
| `text-slate-400` | `text-[var(--color-text-muted)]` |
| `text-slate-500` | `text-[var(--color-text-secondary)]` |
| `text-slate-600` | `text-[var(--color-text-secondary)]` |
| `text-slate-700` | `text-[var(--color-text-primary)]` |
| `bg-white` | `bg-[var(--color-surface)]` |
| `bg-slate-50` | `bg-[var(--color-surface-secondary)]` |
| `bg-slate-100` | `bg-[var(--color-surface-tertiary)]` |
| `border-slate-200` | `border-[var(--color-border)]` |
| `border-slate-100` | `border-[var(--color-border-subtle)]` |
| `hover:bg-slate-100` | `hover:bg-[var(--color-surface-tertiary)]` |
| `hover:bg-slate-50` | `hover:bg-[var(--color-surface-secondary)]` |
| `text-red-500` | `text-[var(--color-destructive)]` |
| `hover:bg-red-50` | `hover:bg-[var(--color-destructive-muted)]` |
| `hover:text-blue-700` | `hover:text-[var(--color-primary-hover)]` |
| `text-blue-500` | `text-[var(--color-primary)]` |
| `text-yellow-500` | `text-[var(--color-warning)]` |

Add `<ThemeDropdown />` before the notifications button in the actions area:

```tsx
<div className="flex items-center gap-2 ml-auto">
  <ThemeDropdown />
  {/* Notifications */}
  <div className="relative" ref={notifRef}>
```

- [ ] **Step 3: Verify admin panel renders**

Open `http://localhost:3000/admin` — header, search bar, dropdowns should all respond to theme toggle.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/components/admin/AdminHeader.tsx
git commit -m "feat(theme): migrate admin layout/header to tokens, add ThemeDropdown"
```

---

### Task 9: Wave 1 Verification + Build Check

- [ ] **Step 1: Visual verification**

Test all three areas:
1. `http://localhost:3000` — Public navbar has toggle, page background switches
2. `http://localhost:3000/dashboard` — Dashboard header has toggle, layout background + header switch
3. `http://localhost:3000/admin` — Admin header has toggle, header + search + dropdowns switch

Verify:
- Toggle persists across page navigation (localStorage)
- System option follows OS preference
- Smooth 200ms transition on toggle
- No flash of wrong theme on page refresh

- [ ] **Step 2: Run build check**

Run: `npx tsc --noEmit 2>&1 | grep -E "ThemeDropdown|useTheme|globals|layout" | head -10`
Expected: No new errors.

- [ ] **Step 3: Commit any fixes**

If any issues found, fix and commit with message: `fix(theme): wave 1 corrections`

---

## Wave 2 — UI Primitives Audit

### Task 10: Audit and Fix UI Primitives

**Files:**
- Modify: All files in `src/components/ui/` that have hardcoded colors

Most UI primitives already use `var(--color-*)` tokens (Button, Card, Input confirmed). This task audits each file and fixes any that don't.

- [ ] **Step 1: Find all hardcoded color references in UI components**

Run:
```bash
grep -rn "bg-white\|bg-slate\|bg-gray\|text-slate\|text-gray\|border-slate\|border-gray" src/components/ui/ --include="*.tsx" | grep -v "node_modules"
```

For each match, apply the token mapping from the spec (Section 2, Token-to-Pattern Mapping).

- [ ] **Step 2: Update Loader.tsx skeleton colors**

In `src/components/ui/Loader.tsx`, replace all instances of:
- `bg-slate-100` → `bg-[var(--color-surface-tertiary)]`
- `bg-slate-200` → `bg-[var(--color-border)]`
- `border-slate-200` → `border-[var(--color-border)]`
- `text-slate-*` → appropriate `text-[var(--color-text-*)]` token

- [ ] **Step 3: Verify primitives render in both themes**

Toggle theme and check a page that uses various UI primitives (e.g., the dashboard forms page with tables, buttons, inputs).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/
git commit -m "feat(theme): audit and migrate UI primitives to tokens"
```

---

## Wave 3 — High-Traffic Pages

### Task 11: Create `useChartColors` Hook

**Files:**
- Create: `src/hooks/useChartColors.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useTheme } from '@/hooks/useTheme';

export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    grid: isDark ? '#334155' : '#E2E8F0',
    text: isDark ? '#94A3B8' : '#64748B',
    tooltip: {
      bg: isDark ? '#1E293B' : '#FFFFFF',
      border: isDark ? '#334155' : '#E2E8F0',
      text: isDark ? '#F1F5F9' : '#1E293B',
    },
    primary: isDark ? '#3B82F6' : '#2563EB',
    secondary: isDark ? '#22C55E' : '#16A34A',
    tertiary: isDark ? '#FBBF24' : '#D97706',
    area: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.08)',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useChartColors.ts
git commit -m "feat(theme): create useChartColors hook for Recharts dark mode"
```

---

### Task 12: Migrate Recharts Components

**Files:**
- Modify: All Recharts chart components (find with `grep -rl "recharts" src/components/ --include="*.tsx"`)

- [ ] **Step 1: Find all Recharts usage**

Run:
```bash
grep -rl "from 'recharts'" src/components/ src/app/ --include="*.tsx"
```

- [ ] **Step 2: For each chart component, import and apply `useChartColors`**

Pattern to apply in each file:

```tsx
import { useChartColors } from '@/hooks/useChartColors';

// Inside the component:
const chartColors = useChartColors();

// Replace hardcoded colors in Recharts components:
<CartesianGrid stroke={chartColors.grid} />
<XAxis tick={{ fill: chartColors.text }} />
<YAxis tick={{ fill: chartColors.text }} />
<Tooltip
  contentStyle={{
    backgroundColor: chartColors.tooltip.bg,
    border: `1px solid ${chartColors.tooltip.border}`,
    color: chartColors.tooltip.text,
    borderRadius: '8px',
  }}
/>
<Bar fill={chartColors.primary} />
<Area stroke={chartColors.primary} fill={chartColors.area} />
```

- [ ] **Step 3: Verify charts render in both themes**

Open a page with charts (e.g., `/admin/analytics` or `/dashboard/forms/[id]/analytics`). Toggle theme — charts should have matching grid lines, text, tooltips.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(theme): apply useChartColors to all Recharts components"
```

---

### Task 13: Sync Monaco Editor Theme

**Files:**
- Modify: `src/components/snippets/MonacoEditor.tsx`

- [ ] **Step 1: Import useTheme and apply mounted guard**

In `src/components/snippets/MonacoEditor.tsx`, add:

```typescript
import { useTheme } from '@/hooks/useTheme';
```

Inside the component, add:

```typescript
const { resolvedTheme, mounted } = useTheme();
```

For the Monaco `theme` prop, use:

```tsx
theme={mounted ? (resolvedTheme === 'dark' ? 'vs-dark' : 'vs') : 'vs'}
```

The `mounted` guard ensures the editor doesn't flash the wrong theme on initial load. Before `mounted` is true, it defaults to `'vs'` (light) which matches the inline script's initial state for most users. The flash-prevention script handles the CSS; this handles the Monaco-specific JS theme.

- [ ] **Step 2: Verify snippet editor theme syncs**

Open the snippet editor page. Toggle theme — Monaco should switch between light and dark.

- [ ] **Step 3: Commit**

```bash
git add src/components/snippets/MonacoEditor.tsx
git commit -m "feat(theme): sync Monaco editor theme with app theme"
```

---

### Task 14: Migrate Landing Page Components

**Files:**
- Modify: All files in `src/components/landing/`

- [ ] **Step 1: Find all hardcoded colors**

Run:
```bash
grep -rn "bg-white\|bg-slate\|text-slate\|border-slate\|bg-gray\|text-gray\|border-gray" src/components/landing/ --include="*.tsx"
```

- [ ] **Step 2: Apply token mapping to each file**

Use the same mapping as Task 8 Step 2. Key patterns in landing pages:

| Find | Replace |
|------|---------|
| `bg-white` | `bg-[var(--color-surface)]` |
| `bg-slate-50` | `bg-[var(--color-background)]` |
| `bg-slate-100` | `bg-[var(--color-surface-tertiary)]` |
| `text-slate-900`, `text-slate-800` | `text-[var(--color-text-primary)]` |
| `text-slate-600`, `text-slate-500` | `text-[var(--color-text-secondary)]` |
| `text-slate-400` | `text-[var(--color-text-muted)]` |
| `border-slate-200` | `border-[var(--color-border)]` |
| `border-slate-100` | `border-[var(--color-border-subtle)]` |

Leave `color-mix(in srgb, var(--color-primary) 8%, transparent)` patterns as-is — they already reference tokens and work in both themes.

- [ ] **Step 3: Verify landing page in both themes**

Open `http://localhost:3000` — hero, features, testimonials, footer sections should all render correctly in dark mode.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/
git commit -m "feat(theme): migrate landing page components to tokens"
```

---

### Task 15: Migrate Tool Pages + Decorative Accents

**Files:**
- Modify: Components in `src/components/tools/`

- [ ] **Step 1: Find all hardcoded colors in tool components**

Run:
```bash
grep -rn "bg-white\|bg-slate\|text-slate\|border-slate\|bg-blue-50\|bg-violet-50\|bg-rose-50\|bg-amber-50\|bg-emerald-50\|bg-green-50\|bg-red-50" src/components/tools/ --include="*.tsx"
```

- [ ] **Step 2: Apply token mapping for semantic colors**

Same mapping as previous tasks.

- [ ] **Step 3: Migrate decorative accent tints to opacity-based**

For QuoteCard and similar components with decorative colored backgrounds:

| Find | Replace |
|------|---------|
| `bg-blue-50` (decorative) | `bg-blue-500/10` |
| `bg-violet-50` | `bg-violet-500/10` |
| `bg-rose-50` | `bg-rose-500/10` |
| `bg-amber-50` | `bg-amber-500/10` |
| `bg-emerald-50` | `bg-emerald-500/10` |
| `from-blue-50` (gradient) | `from-blue-500/10` |
| `from-violet-50` | `from-violet-500/10` |
| `from-rose-50` | `from-rose-500/10` |
| `from-emerald-50` | `from-emerald-500/10` |
| `from-amber-50` | `from-amber-500/10` |

For semantic status colors:

| Find | Replace |
|------|---------|
| `bg-blue-50` (semantic, e.g., info banner) | `bg-[var(--color-primary-muted)]` |
| `bg-red-50` (error) | `bg-[var(--color-destructive-muted)]` |
| `bg-green-50` (success) | `bg-[var(--color-success-muted)]` |
| `bg-amber-50` (warning) | `bg-[var(--color-warning-muted)]` |

Use judgment: if the color is decorative/accent → opacity-based. If it conveys meaning (status) → semantic token.

- [ ] **Step 4: Fix html-to-image captured elements**

In `src/components/tools/quote-generator/QuoteCard.tsx`, ensure the `ref` element (the downloadable area) has an explicit background that resolves correctly:

```tsx
<div ref={contentRef} className="bg-[var(--color-surface)] px-6 pt-6 pb-4">
```

Also pass the resolved background color to `toPng`:

```tsx
const { resolvedTheme } = useTheme();
const handleDownload = async () => {
  if (!contentRef.current) return;
  const dataUrl = await toPng(contentRef.current, {
    backgroundColor: resolvedTheme === 'dark' ? '#0F172A' : '#FFFFFF',
    pixelRatio: 2,
  });
  // ...
};
```

Import `useTheme` at the top of the file:

```typescript
import { useTheme } from '@/hooks/useTheme';
```

- [ ] **Step 5: Verify tools in both themes**

Check: Quote Generator, Word Counter, URL Shortener, Snippet Editor. All should render correctly with proper contrast in both themes.

- [ ] **Step 6: Commit**

```bash
git add src/components/tools/
git commit -m "feat(theme): migrate tool pages to tokens, decorative accents to opacity-based"
```

---

### Task 16: Migrate Auth, Forms, and Dashboard Content Pages

**Files:**
- Modify: Components in `src/components/forms/`, `src/app/sign-in/`, `src/app/sign-up/`, `src/app/forgot-password/`, `src/components/dashboard/` (content components, not layout)

- [ ] **Step 1: Find all hardcoded colors**

Run:
```bash
grep -rn "bg-white\|bg-slate\|text-slate\|border-slate" src/components/forms/ src/components/dashboard/ --include="*.tsx" | wc -l
grep -rn "bg-white\|bg-slate\|text-slate\|border-slate" src/app/sign-in/ src/app/sign-up/ src/app/forgot-password/ --include="*.tsx" | wc -l
```

- [ ] **Step 2: Apply token mapping**

Same mapping as all previous tasks. Work through each file systematically.

- [ ] **Step 3: Verify forms and auth pages**

Check: Forms list, Form builder, Sign-in, Sign-up pages in both themes.

- [ ] **Step 4: Commit**

```bash
git add src/components/forms/ src/components/dashboard/ src/app/sign-in/ src/app/sign-up/ src/app/forgot-password/
git commit -m "feat(theme): migrate forms, auth, and dashboard content pages to tokens"
```

---

## Wave 4 — Admin + Cleanup

### Task 17: Migrate Admin Components

**Files:**
- Modify: Components in `src/components/admin/` (excluding AdminHeader, already done)
- Modify: `src/app/admin/AdminLayoutClient.tsx`

- [ ] **Step 1: Migrate AdminLayoutClient**

`src/app/admin/AdminLayoutClient.tsx` uses extensive `dark:` paired classes. Replace the entire component's color approach with tokens:

Replace:
```tsx
<div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
```
With:
```tsx
<div className="min-h-screen flex bg-[var(--color-background)]">
```

Replace all paired `dark:` classes throughout the file with single token classes using the standard mapping. Remove all `dark:` prefixed classes.

- [ ] **Step 2: Migrate remaining admin components**

Run:
```bash
grep -rn "bg-white\|bg-slate\|text-slate\|border-slate\|bg-gray\|text-gray\|border-gray\|dark:" src/components/admin/ --include="*.tsx" | grep -v AdminHeader
```

Apply token mapping to each file: `AdminDashboard.tsx`, `AdminSidebarNavItem.tsx`, `AdminSidebarFooter.tsx`, `AdminSidebarLogo.tsx`, and any chart/analytics components.

- [ ] **Step 3: Verify admin panel**

Open `http://localhost:3000/admin` — all pages should render correctly in both themes.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ src/app/admin/
git commit -m "feat(theme): migrate admin components to tokens, remove paired dark: classes"
```

---

### Task 18: SVG Audit + Final Cleanup

**Files:**
- Audit: All SVG files and inline SVGs

- [ ] **Step 1: Find hardcoded SVG fills**

Run:
```bash
grep -rn 'fill="#\|stroke="#' src/ --include="*.tsx" --include="*.svg" | grep -v node_modules | grep -v "currentColor"
```

For any matches, change `fill="#hex"` to `fill="currentColor"` (inherits from text color token).

- [ ] **Step 2: Remove orphaned `dark:` classes**

Run:
```bash
grep -rn "dark:" src/components/ src/app/ --include="*.tsx" | grep -v node_modules | grep -v "\.test\." | wc -l
```

For files already migrated to tokens, remove any remaining `dark:` classes that are now redundant. The token system handles both themes automatically.

- [ ] **Step 3: WCAG contrast verification**

Manually check these critical pairings in dark mode:
- `--color-text-primary` (#F1F5F9) on `--color-surface` (#0F172A) — should be ~15:1
- `--color-text-secondary` (#94A3B8) on `--color-surface` (#0F172A) — should be ~6:1
- `--color-text-muted` (#718096) on `--color-surface` (#0F172A) — should be ~4.2:1
- `--color-primary` (#3B82F6) on `--color-surface` (#0F172A) — should be ~5:1
- `--color-destructive` (#EF4444) on `--color-surface` (#0F172A) — should be ~5:1

All should exceed 4.5:1 for WCAG AA.

- [ ] **Step 4: Final build check**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: No new errors from theme migration.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(theme): final cleanup — SVG audit, remove orphaned dark: classes, WCAG verification"
```

---

## Final Verification Checklist

After all tasks complete, verify these success criteria:

- [ ] Theme toggle appears in public Navbar, Dashboard header, Admin header
- [ ] Theme persists across navigation and page refresh
- [ ] System option follows OS preference changes in real-time
- [ ] No flash of wrong theme on any page load
- [ ] All layout backgrounds switch correctly
- [ ] All UI primitives (buttons, cards, inputs, modals) render with proper contrast
- [ ] Charts use dark-appropriate colors
- [ ] Monaco editor switches to `vs-dark`
- [ ] Decorative accent colors are visible in dark mode
- [ ] Smooth 200ms transition on manual theme toggle
- [ ] Print outputs in light mode
- [ ] No regression in existing light mode appearance
