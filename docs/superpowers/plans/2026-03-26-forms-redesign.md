# Forms E2E Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Forms feature end-to-end — list, three-panel builder, public responder (modes B & C), responses, and analytics pages — without breaking existing API routes or data.

**Architecture:** New builder components live in `src/components/forms/builder/`, public form renderers in `src/components/forms/public/`, and response UI in `src/components/forms/responses/`. All existing API routes remain untouched. The only data change is adding `displayMode` to the form settings schema with an application-level default.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Shadcn/ui, Framer Motion 12, Recharts, Lucide React, @hello-pangea/dnd (drag-and-drop within canvas), Jest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-26-forms-redesign.md`

---

## File Map

### New Files
```
src/components/forms/
  FormsStatChips.tsx              — reusable stat chips (list + responses pages)

src/components/forms/builder/
  FormBuilderLayout.tsx           — three-panel shell + top bar
  FieldPalette.tsx                — left panel Add tab
  FieldNavigator.tsx              — left panel Fields tab (navigator)
  BuilderCanvas.tsx               — center panel with drag-to-reorder
  FieldConfig.tsx                 — right panel Field tab
  FormSettingsPanel.tsx           — right panel Settings tab
  FieldPreview.tsx                — non-interactive field preview inside canvas

src/components/forms/public/
  PublicFormShell.tsx             — responder page wrapper (reads displayMode)
  FormModeB.tsx                   — all-on-one-page renderer
  FormModeC.tsx                   — paginated sections renderer
  FormField.tsx                   — single field renderer (shared by B and C)
  QuizEndScreen.tsx               — quiz score reveal screen

src/components/forms/responses/
  ResponseSlideOver.tsx           — desktop slide-over / mobile bottom sheet
```

### Modified Files
```
src/app/dashboard/forms/[id]/edit/page.tsx      — replace with FormBuilderLayout
src/app/dashboard/forms/page.tsx                — add FormsStatChips + polish
src/app/dashboard/forms/[id]/responses/page.tsx — full redesign
src/app/dashboard/forms/[id]/analytics/page.tsx — full redesign
src/app/f/[id]/page.tsx                         — use PublicFormShell
src/components/dashboard/forms/FormsTable.tsx   — style upgrade + type badges
src/components/forms/IdentityGate.tsx           — restyle
src/components/forms/AnalyticsTabs.tsx          — restructure into 3 tabs
src/components/forms/AIInsights.tsx             — restyle card wrapper
```

### Types File (new)
```
src/types/forms.ts   — shared TypeScript interfaces for forms feature
```

---

## Task 1: Shared Types + `displayMode` Schema

**Files:**
- Create: `src/types/forms.ts`
- Modify: `src/app/dashboard/forms/[id]/edit/page.tsx` (FormSettingsState type only)
- Modify: `src/app/api/forms/[id]/route.ts` (add displayMode default on read)

- [ ] **Step 1: Create shared types file**

```typescript
// src/types/forms.ts
export type DisplayMode = 'all' | 'paginated' | 'one-at-a-time';

export type FormType = 'general' | 'survey' | 'quiz' | 'attendance';

export interface IdentitySchema {
  requireName: boolean;
  requireEmail: boolean;
  requireStudentId: boolean;
}

export interface FormSettings {
  isPublic: boolean;
  allowMultipleSubmissions: boolean;
  allowAnonymous: boolean;
  identitySchema: IdentitySchema;
  startAt: string | null;
  endAt: string | null;
  timer: { enabled: boolean; minutes: number };
  displayMode: DisplayMode;
}

export interface FormField {
  id: string;
  label: string;
  type: 'short_text' | 'long_text' | 'number' | 'email' | 'date' | 'time' |
        'dropdown' | 'radio' | 'checkbox' | 'section';
  required: boolean;
  options: string[];
  placeholder: string;
  helpText: string;
  quiz: {
    points: number;
    correctOptions: string[];
    explanation: string;
  };
}

export interface FormSchema {
  _id: string;
  title: string;
  description: string;
  type: FormType;
  status: 'draft' | 'published' | 'archived';
  slug: string;
  fields: FormField[];
  settings: FormSettings;
  responseCount?: number;
  createdAt: string;
  updatedAt?: string;
}
```

- [ ] **Step 2: Add displayMode default in API route**

Open `src/app/api/forms/[id]/route.ts`. Find the GET handler where form data is returned. Add a default for `displayMode` so existing records without it return `'all'`:

```typescript
// Inside the GET handler, after fetching form from DB:
const formData = {
  ...form,
  settings: {
    ...form.settings,
    displayMode: form.settings?.displayMode ?? 'all',
  },
};
// return formData instead of form
```

- [ ] **Step 3: Update FormSettingsState in builder page**

In `src/app/dashboard/forms/[id]/edit/page.tsx`, add `displayMode` to `FormSettingsState`:

```typescript
type FormSettingsState = {
  // ...existing fields...
  displayMode: 'all' | 'paginated' | 'one-at-a-time';
};

const defaultFormSettings: FormSettingsState = {
  // ...existing defaults...
  displayMode: 'all',
};
```

- [ ] **Step 4: Verify build passes**

```bash
cd "w:/My Work/Software Development Project/Ai Projects/ai-toolbox"
npx tsc --noEmit
```
Expected: no new type errors

- [ ] **Step 5: Commit**

```bash
git add src/types/forms.ts src/app/api/forms/[id]/route.ts src/app/dashboard/forms/[id]/edit/page.tsx
git commit -m "feat: add displayMode to form settings schema with 'all' default"
```

---

## Task 2: `FormsStatChips` Component

**Files:**
- Create: `src/components/forms/FormsStatChips.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/components/forms/FormsStatChips.tsx
"use client";
import { LucideIcon } from 'lucide-react';

interface StatChip {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

interface FormsStatChipsProps {
  stats: StatChip[];
}

export default function FormsStatChips({ stats }: FormsStatChipsProps) {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 flex-1"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800 leading-none">{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/FormsStatChips.tsx
git commit -m "feat: add FormsStatChips shared component"
```

---

## Task 3: Forms List Page Upgrade

**Files:**
- Modify: `src/app/dashboard/forms/page.tsx`
- Modify: `src/components/dashboard/forms/FormsTable.tsx`

- [ ] **Step 1: Upgrade FormsTable — type badges + row styling**

In `src/components/dashboard/forms/FormsTable.tsx`, replace the plain type cell with a colored badge. Add `TYPE_BADGE_STYLES` and update the type column and `StatusBadge`:

```tsx
const TYPE_LABELS: Record<string, string> = {
  general: 'General', survey: 'Survey', quiz: 'Quiz', attendance: 'Attendance',
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  general: 'bg-slate-100 text-slate-600',
  survey: 'bg-purple-50 text-purple-700',
  quiz: 'bg-orange-50 text-orange-700',
  attendance: 'bg-green-50 text-green-700',
};

// Replace the type <td>:
<td className="px-4 py-3 hidden sm:table-cell">
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_BADGE_STYLES[form.type] ?? 'bg-slate-100 text-slate-600'}`}>
    {TYPE_LABELS[form.type] ?? form.type}
  </span>
</td>
```

Update `StatusBadge` to use yellow for draft:
```tsx
function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700">
      <CheckCircle size={10} />Published
    </span>
  );
  if (status === 'archived') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500">
      <XCircle size={10} />Archived
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-yellow-50 text-yellow-700">
      Draft
    </span>
  );
}
```

Add row hover with blue-left border on `<tr>`:
```tsx
<tr key={form._id} className="hover:bg-blue-50/30 border-l-2 border-l-transparent hover:border-l-blue-500 transition-colors cursor-pointer">
```

Add Edit + Responses links to the action menu (currently missing Responses and Analytics links):
```tsx
// In ActionMenu, add before Delete:
<Link href={`/dashboard/forms/${form._id}/responses`} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
  <FileBarChart size={14} />Responses
</Link>
<Link href={`/dashboard/forms/${form._id}/analytics`} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
  <BarChart2 size={14} />Analytics
</Link>
```

- [ ] **Step 2: Upgrade Forms list page — stats bar + empty states**

In `src/app/dashboard/forms/page.tsx`:

Add imports:
```tsx
import { FileText, CheckCircle2 as CheckCircle, FileEdit, MessageSquare } from 'lucide-react';
import FormsStatChips from '@/components/forms/FormsStatChips';
```

Compute stats from existing `forms` + `total` data. Add below the header, above filter row:
```tsx
{!loading && (
  <FormsStatChips stats={[
    { icon: FileText, value: total, label: 'Total Forms' },
    { icon: CheckCircle, value: forms.filter(f => f.status === 'published').length, label: 'Published' },
    { icon: FileEdit, value: forms.filter(f => f.status === 'draft').length, label: 'Drafts' },
    { icon: MessageSquare, value: forms.reduce((acc, f) => acc + (f.responseCount ?? 0), 0), label: 'Responses' },
  ]} />
)}
```

Replace the empty state inside the `forms.length === 0` branch:
```tsx
<div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
    <FileText size={28} className="text-blue-500" />
  </div>
  <h3 className="text-[15px] font-semibold text-slate-800 mb-1">
    {searchInput || statusFilter !== 'all' || typeFilter !== 'all' ? 'No results found' : 'No forms yet'}
  </h3>
  <p className="text-[13px] text-slate-400 mb-6 max-w-xs mx-auto">
    {searchInput || statusFilter !== 'all' || typeFilter !== 'all'
      ? 'Try adjusting your search or filters'
      : 'Create your first form to start collecting responses'}
  </p>
  {!searchInput && statusFilter === 'all' && typeFilter === 'all' && (
    <Link href="/dashboard/forms/create" className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors">
      <Plus size={15} /> Create Form
    </Link>
  )}
</div>
```

- [ ] **Step 3: Verify page renders correctly**

Start dev server and navigate to `/dashboard/forms`. Confirm:
- Stats bar shows 4 chips
- Table has colored type badges and yellow draft badge
- Empty state shows the illustrated card (create a filter that returns no results to test)

```bash
npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/forms/page.tsx src/components/dashboard/forms/FormsTable.tsx
git commit -m "feat: upgrade forms list — stats bar, type badges, improved empty states"
```

---

## Task 4: Form Builder — Three-Panel Shell + Top Bar

**Files:**
- Create: `src/components/forms/builder/FormBuilderLayout.tsx`
- Modify: `src/app/dashboard/forms/[id]/edit/page.tsx`

- [ ] **Step 1: Create `FormBuilderLayout`**

This is the shell only — accepts slots for left/center/right panels and renders the top bar.

```tsx
// src/components/forms/builder/FormBuilderLayout.tsx
"use client";
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Save, Loader2, MoreHorizontal } from 'lucide-react';
import { FormType } from '@/types/forms';

interface FormBuilderLayoutProps {
  formId: string;
  formTitle: string;
  formType: FormType;
  formStatus: string;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublishToggle: () => void;
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
  // Mobile bottom tab content
  mobileFieldsPanel: ReactNode;
  mobileConfigPanel: ReactNode;
}

const TYPE_BADGE: Record<string, string> = {
  general: 'bg-slate-100 text-slate-600',
  survey: 'bg-purple-50 text-purple-700',
  quiz: 'bg-orange-50 text-orange-700',
  attendance: 'bg-green-50 text-green-700',
};

type MobileTab = 'canvas' | 'fields' | 'config';

export default function FormBuilderLayout({
  formId, formTitle, formType, formStatus, saving,
  onTitleChange, onSave, onPublishToggle,
  leftPanel, centerPanel, rightPanel,
  mobileFieldsPanel, mobileConfigPanel,
}: FormBuilderLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 shrink-0 flex-wrap gap-y-2">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/dashboard/forms" className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <input
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="font-semibold text-slate-800 text-[15px] bg-transparent border-none outline-none focus:ring-0 truncate min-w-0 flex-1"
            placeholder="Untitled Form"
          />
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_BADGE[formType] ?? 'bg-slate-100 text-slate-600'}`}>
            {formType}
          </span>
        </div>

        {/* Center: sub-nav (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { label: 'Edit', href: `/dashboard/forms/${formId}/edit` },
            { label: 'Responses', href: `/dashboard/forms/${formId}/responses` },
            { label: 'Analytics', href: `/dashboard/forms/${formId}/analytics` },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3 py-1 rounded-md text-[13px] font-medium transition-colors ${
                item.label === 'Edit'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/f/${formId}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-[13px] text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Eye size={13} /> Preview
          </Link>
          <button
            onClick={onPublishToggle}
            className="hidden sm:inline-flex h-8 px-3 text-[13px] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
          >
            {formStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
          {/* Mobile overflow menu */}
          <button className="md:hidden p-1.5 text-slate-500 hover:text-slate-700">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Three-panel body (desktop) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
          {leftPanel}
        </div>

        {/* Center panel */}
        <div className={`flex-1 overflow-y-auto bg-slate-50 ${mobileTab !== 'canvas' ? 'hidden md:block' : ''}`}>
          {centerPanel}
        </div>

        {/* Right panel */}
        <div className="hidden md:flex flex-col w-[300px] shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          {rightPanel}
        </div>

        {/* Mobile: Fields panel */}
        {mobileTab === 'fields' && (
          <div className="flex-1 overflow-y-auto bg-white md:hidden">
            {mobileFieldsPanel}
          </div>
        )}

        {/* Mobile: Config panel */}
        {mobileTab === 'config' && (
          <div className="flex-1 overflow-y-auto bg-white md:hidden">
            {mobileConfigPanel}
          </div>
        )}
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden flex border-t border-slate-200 bg-white shrink-0" style={{ height: 48 }}>
        {(['canvas', 'fields', 'config'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 text-[12px] font-medium capitalize transition-colors ${
              mobileTab === tab ? 'text-blue-600 border-t-2 border-blue-600' : 'text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders by temporarily using it in the edit page**

In `src/app/dashboard/forms/[id]/edit/page.tsx`, import `FormBuilderLayout` at the top (don't wire it yet — just confirm no import errors):

```bash
npx tsc --noEmit
```
Expected: no errors on the new file.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/builder/FormBuilderLayout.tsx
git commit -m "feat: add FormBuilderLayout three-panel shell with top bar"
```

---

## Task 5: `FieldPalette` — Left Panel Add Tab

**Files:**
- Create: `src/components/forms/builder/FieldPalette.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/forms/builder/FieldPalette.tsx
"use client";
import {
  Type, AlignLeft, Hash, Mail, Calendar, Clock,
  ChevronDown, Circle, CheckSquare, Minus
} from 'lucide-react';
import { FormField } from '@/types/forms';

type FieldType = FormField['type'];

interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: React.ElementType;
}

const GROUPS: { label: string; items: FieldTypeOption[] }[] = [
  {
    label: 'Basic',
    items: [
      { type: 'short_text', label: 'Short Text', icon: Type },
      { type: 'long_text', label: 'Paragraph', icon: AlignLeft },
      { type: 'number', label: 'Number', icon: Hash },
      { type: 'email', label: 'Email', icon: Mail },
    ],
  },
  {
    label: 'Choice',
    items: [
      { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
      { type: 'radio', label: 'Multiple Choice', icon: Circle },
      { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
    ],
  },
  {
    label: 'Date & Time',
    items: [
      { type: 'date', label: 'Date', icon: Calendar },
      { type: 'time', label: 'Time', icon: Clock },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'section', label: 'Section Break', icon: Minus },
    ],
  },
];

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="p-3 space-y-4">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => onAddField(type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
              >
                <Icon size={14} className="shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/builder/FieldPalette.tsx
git commit -m "feat: add FieldPalette component for builder left panel"
```

---

## Task 6: `FieldNavigator` — Left Panel Fields Tab

**Files:**
- Create: `src/components/forms/builder/FieldNavigator.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/forms/builder/FieldNavigator.tsx
"use client";
import { Type, AlignLeft, Hash, Mail, Calendar, Clock, ChevronDown, Circle, CheckSquare, Minus } from 'lucide-react';
import { FormField } from '@/types/forms';

const TYPE_ICONS: Record<string, React.ElementType> = {
  short_text: Type, long_text: AlignLeft, number: Hash, email: Mail,
  date: Calendar, time: Clock, dropdown: ChevronDown,
  radio: Circle, checkbox: CheckSquare, section: Minus,
};

interface FieldNavigatorProps {
  fields: FormField[];
  activeFieldId: string | null;
  onSelectField: (fieldId: string) => void;
}

export default function FieldNavigator({ fields, activeFieldId, onSelectField }: FieldNavigatorProps) {
  if (fields.length === 0) {
    return (
      <div className="p-4 text-center text-[13px] text-slate-400 mt-8">
        No fields yet. Add fields using the Add tab.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-0.5">
      {fields.map((field, idx) => {
        const Icon = TYPE_ICONS[field.type] ?? Type;
        const isActive = field.id === activeFieldId;
        return (
          <button
            key={field.id}
            onClick={() => onSelectField(field.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-[11px] text-slate-400 w-4 shrink-0 tabular-nums">{idx + 1}</span>
            <Icon size={13} className="shrink-0" />
            <span className="truncate">{field.label || `(${field.type.replace('_', ' ')})`}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/builder/FieldNavigator.tsx
git commit -m "feat: add FieldNavigator component for builder left panel"
```

---

## Task 7: `FieldPreview` + `BuilderCanvas`

**Files:**
- Create: `src/components/forms/builder/FieldPreview.tsx`
- Create: `src/components/forms/builder/BuilderCanvas.tsx`

- [ ] **Step 1: Install drag-and-drop library if not present**

```bash
cd "w:/My Work/Software Development Project/Ai Projects/ai-toolbox"
npm list @hello-pangea/dnd 2>/dev/null || npm install @hello-pangea/dnd
```

- [ ] **Step 2: Create `FieldPreview`**

Non-interactive preview of a field inside the canvas card:

```tsx
// src/components/forms/builder/FieldPreview.tsx
import { FormField } from '@/types/forms';

export default function FieldPreview({ field }: { field: FormField }) {
  const base = "mt-1 w-full rounded-md border border-slate-200 bg-slate-50 text-[13px] text-slate-400 pointer-events-none";

  if (field.type === 'section') {
    return <hr className="mt-2 border-slate-200" />;
  }
  if (field.type === 'long_text') {
    return <textarea disabled placeholder={field.placeholder || 'Long answer text'} rows={3} className={`${base} px-3 py-2 resize-none`} />;
  }
  if (field.type === 'dropdown') {
    return (
      <select disabled className={`${base} px-3 py-2`}>
        <option>{field.placeholder || 'Select an option'}</option>
        {field.options.map((o, i) => <option key={i}>{o}</option>)}
      </select>
    );
  }
  if (field.type === 'radio') {
    return (
      <div className="mt-1 space-y-1.5">
        {(field.options.length ? field.options : ['Option 1']).map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
            <span className="text-[13px] text-slate-400">{o}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.type === 'checkbox') {
    return (
      <div className="mt-1 space-y-1.5">
        {(field.options.length ? field.options : ['Option 1']).map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-slate-300 shrink-0" />
            <span className="text-[13px] text-slate-400">{o}</span>
          </div>
        ))}
      </div>
    );
  }
  if (field.type === 'date') {
    return <input disabled type="date" className={`${base} px-3 py-2`} />;
  }
  if (field.type === 'time') {
    return <input disabled type="time" className={`${base} px-3 py-2`} />;
  }
  // Default: text-like inputs
  return (
    <input
      disabled
      type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
      placeholder={field.placeholder || 'Short answer'}
      className={`${base} px-3 py-2`}
    />
  );
}
```

- [ ] **Step 3: Create `BuilderCanvas`**

```tsx
// src/components/forms/builder/BuilderCanvas.tsx
"use client";
import { useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, Copy, Trash2, Plus } from 'lucide-react';
import { FormField } from '@/types/forms';
import FieldPreview from './FieldPreview';

interface BuilderCanvasProps {
  formTitle: string;
  formDescription: string;
  fields: FormField[];
  activeFieldId: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSelectField: (id: string) => void;
  onReorderFields: (fields: FormField[]) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onAddField: () => void;
}

export default function BuilderCanvas({
  formTitle, formDescription, fields, activeFieldId,
  onTitleChange, onDescriptionChange, onSelectField,
  onReorderFields, onDuplicateField, onDeleteField, onAddField,
}: BuilderCanvasProps) {

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(fields);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorderFields(reordered);
  };

  return (
    <div className="min-h-full py-8 px-4">
      <div className="max-w-[680px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Form header */}
        <div className="p-6 border-b border-slate-100">
          <input
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Form title"
            className="w-full text-xl font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300"
          />
          <textarea
            value={formDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Form description (optional)"
            rows={2}
            className="w-full mt-1 text-[13px] text-slate-500 bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-slate-300"
          />
        </div>

        {/* Fields */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="canvas-fields">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-slate-100">
                {fields.map((field, index) => {
                  const isActive = field.id === activeFieldId;
                  return (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => onSelectField(field.id)}
                          className={`relative group p-4 transition-colors cursor-pointer ${
                            isActive ? 'border-l-[3px] border-blue-500 bg-blue-50/30' : 'border-l-[3px] border-transparent hover:bg-slate-50'
                          } ${snapshot.isDragging ? 'shadow-lg rounded-lg bg-white' : ''}`}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={16} className="text-slate-400" />
                          </div>

                          {/* Field label */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-[13px] font-medium text-slate-700">
                                {field.label || <span className="text-slate-300 italic">Untitled field</span>}
                                {field.required && <span className="text-red-500 ml-0.5">*</span>}
                              </p>
                              {field.helpText && (
                                <p className="text-[11px] text-slate-400 mt-0.5">{field.helpText}</p>
                              )}
                              <FieldPreview field={field} />
                            </div>

                            {/* Hover actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); onDuplicateField(field.id); }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                                title="Duplicate"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteField(field.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add field button */}
        <div className="p-4">
          <button
            onClick={onAddField}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-[13px] text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-colors"
          >
            <Plus size={15} /> Add Field
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/builder/FieldPreview.tsx src/components/forms/builder/BuilderCanvas.tsx package.json package-lock.json
git commit -m "feat: add BuilderCanvas with drag-to-reorder and FieldPreview"
```

---

## Task 8: `FieldConfig` — Right Panel Field Tab

**Files:**
- Create: `src/components/forms/builder/FieldConfig.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/forms/builder/FieldConfig.tsx
"use client";
import { Plus, Trash2 } from 'lucide-react';
import { FormField, FormType } from '@/types/forms';

interface FieldConfigProps {
  field: FormField | null;
  formType: FormType;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
}

export default function FieldConfig({ field, formType, onUpdateField }: FieldConfigProps) {
  if (!field) {
    return (
      <div className="flex items-center justify-center h-48 text-[13px] text-slate-400 text-center px-6">
        Select a field in the canvas to configure it
      </div>
    );
  }

  const isChoice = ['dropdown', 'radio', 'checkbox'].includes(field.type);
  const isQuiz = formType === 'quiz';
  const isSection = field.type === 'section';

  const update = (updates: Partial<FormField>) => onUpdateField(field.id, updates);

  return (
    <div className="p-4 space-y-4">
      {/* Label */}
      {!isSection && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Label</label>
          <input
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Field label"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Section label */}
      {isSection && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Section Title</label>
          <input
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Section title"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Placeholder */}
      {!isSection && !isChoice && field.type !== 'date' && field.type !== 'time' && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Placeholder</label>
          <input
            value={field.placeholder}
            onChange={(e) => update({ placeholder: e.target.value })}
            placeholder="Placeholder text"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Help text */}
      {!isSection && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Help Text</label>
          <input
            value={field.helpText}
            onChange={(e) => update({ helpText: e.target.value })}
            placeholder="Optional helper text"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Required toggle */}
      {!isSection && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-slate-700">Required</p>
            <p className="text-[11px] text-slate-400">Respondents must answer this</p>
          </div>
          <button
            onClick={() => update({ required: !field.required })}
            className={`relative w-10 h-5.5 rounded-full transition-colors ${field.required ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      )}

      {/* Options editor (choice fields) */}
      {isChoice && (
        <div>
          <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Options</label>
          <div className="mt-2 space-y-1.5">
            {field.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const opts = [...field.options];
                    opts[idx] = e.target.value;
                    update({ options: opts });
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  onClick={() => update({ options: field.options.filter((_, i) => i !== idx) })}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => update({ options: [...field.options, `Option ${field.options.length + 1}`] })}
              className="flex items-center gap-1.5 text-[13px] text-blue-600 hover:text-blue-700 mt-1"
            >
              <Plus size={13} /> Add option
            </button>
          </div>
        </div>
      )}

      {/* Quiz config */}
      {isQuiz && !isSection && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Quiz Settings</p>
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Points</label>
            <input
              type="number"
              min={0}
              value={field.quiz.points}
              onChange={(e) => update({ quiz: { ...field.quiz, points: Number(e.target.value) } })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {isChoice && (
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Correct Answer(s)</label>
              <div className="mt-1 space-y-1">
                {field.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
                    <input
                      type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
                      checked={field.quiz.correctOptions.includes(opt)}
                      onChange={() => {
                        const current = field.quiz.correctOptions;
                        const next = field.type === 'checkbox'
                          ? current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt]
                          : [opt];
                        update({ quiz: { ...field.quiz, correctOptions: next } });
                      }}
                      className="rounded"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Explanation</label>
            <textarea
              value={field.quiz.explanation}
              onChange={(e) => update({ quiz: { ...field.quiz, explanation: e.target.value } })}
              placeholder="Shown after submission"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/builder/FieldConfig.tsx
git commit -m "feat: add FieldConfig right panel component"
```

---

## Task 9: `FormSettingsPanel` — Right Panel Settings Tab

**Files:**
- Create: `src/components/forms/builder/FormSettingsPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/forms/builder/FormSettingsPanel.tsx
"use client";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { FormSettings, FormType, DisplayMode } from '@/types/forms';

interface FormSettingsPanelProps {
  formId: string;
  formTitle: string;
  formDescription: string;
  formType: FormType;
  formSlug: string;
  settings: FormSettings;
  hasQuizData: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTypeChange: (type: FormType) => void;
  onSlugChange: (v: string) => void;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

const SHORT_BASE = process.env.NEXT_PUBLIC_SHORT_BASE_URL || '';

export default function FormSettingsPanel({
  formId, formTitle, formDescription, formType, formSlug,
  settings, hasQuizData,
  onTitleChange, onDescriptionChange, onTypeChange, onSlugChange, onSettingsChange,
}: FormSettingsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showTypeConfirm, setShowTypeConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<FormType | null>(null);

  const shareUrl = `${SHORT_BASE}/f/${formSlug || formId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTypeChange = (newType: FormType) => {
    if (formType === 'quiz' && hasQuizData && newType !== 'quiz') {
      setPendingType(newType);
      setShowTypeConfirm(true);
    } else {
      onTypeChange(newType);
    }
  };

  const confirmTypeChange = () => {
    if (pendingType) onTypeChange(pendingType);
    setShowTypeConfirm(false);
    setPendingType(null);
  };

  return (
    <div className="p-4 space-y-5 text-[13px]">
      {/* Type confirmation dialog */}
      {showTypeConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-1">Switch form type?</h3>
            <p className="text-[13px] text-slate-500 mb-4">Switching away from Quiz will clear all quiz settings (correct answers, points). This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowTypeConfirm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={confirmTypeChange} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* General */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">General</p>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-500">Form Title</label>
            <input value={formTitle} onChange={(e) => onTitleChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Description</label>
            <textarea value={formDescription} onChange={(e) => onDescriptionChange(e.target.value)}
              rows={2} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Form Type</label>
            <select value={formType} onChange={(e) => handleTypeChange(e.target.value as FormType)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="general">General</option>
              <option value="survey">Survey</option>
              <option value="quiz">Quiz</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Slug</label>
            <input value={formSlug} onChange={(e) => onSlugChange(e.target.value)}
              placeholder="my-form-slug"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
      </section>

      {/* Identity Gate */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Identity Gate</p>
        {([
          { key: 'requireName', label: 'Require Name' },
          { key: 'requireEmail', label: 'Require Email' },
          { key: 'requireStudentId', label: 'Require Student ID' },
        ] as const).map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-slate-700">{label}</span>
            <button
              onClick={() => onSettingsChange({ identitySchema: { ...settings.identitySchema, [key]: !settings.identitySchema[key] } })}
              className={`relative w-9 h-5 rounded-full transition-colors ${settings.identitySchema[key] ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.identitySchema[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </section>

      {/* Schedule */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Schedule</p>
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-slate-500">Start</label>
            <input type="datetime-local" value={settings.startAt ?? ''} onChange={(e) => onSettingsChange({ startAt: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500">End</label>
            <input type="datetime-local" value={settings.endAt ?? ''} onChange={(e) => onSettingsChange({ endAt: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
      </section>

      {/* Display Mode */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Display Mode</p>
        <div className="space-y-2">
          {([
            { value: 'all', label: 'All on one page', desc: 'All fields visible at once' },
            { value: 'paginated', label: 'Paginated sections', desc: 'One section at a time' },
            { value: 'one-at-a-time', label: 'One at a time', desc: 'Typeform style', comingSoon: true },
          ] as { value: DisplayMode; label: string; desc: string; comingSoon?: boolean }[]).map((mode) => (
            <label
              key={mode.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                settings.displayMode === mode.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
              } ${mode.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="displayMode"
                value={mode.value}
                checked={settings.displayMode === mode.value}
                disabled={mode.comingSoon}
                onChange={() => !mode.comingSoon && onSettingsChange({ displayMode: mode.value })}
                className="mt-0.5"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">{mode.label}</span>
                  {mode.comingSoon && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Coming soon</span>}
                </div>
                <p className="text-[11px] text-slate-400">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Share */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Share</p>
        <div className="flex gap-2">
          <input readOnly value={shareUrl} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-[12px] text-slate-500 bg-slate-50 font-mono truncate" />
          <button onClick={handleCopy} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/builder/FormSettingsPanel.tsx
git commit -m "feat: add FormSettingsPanel right panel with display mode + quiz type guard"
```

---

## Task 10: Wire Builder — Replace Edit Page

**Files:**
- Modify: `src/app/dashboard/forms/[id]/edit/page.tsx`

- [ ] **Step 1: Rewrite the edit page to use all builder components**

Replace the existing large inline JSX in `src/app/dashboard/forms/[id]/edit/page.tsx` with the new three-panel layout. Keep all existing state and API logic, just swap the render:

```tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner'; // or use a simple state toast

import { FormField, FormSettings, FormType, DisplayMode } from '@/types/forms';
import FormBuilderLayout from '@/components/forms/builder/FormBuilderLayout';
import FieldPalette from '@/components/forms/builder/FieldPalette';
import FieldNavigator from '@/components/forms/builder/FieldNavigator';
import BuilderCanvas from '@/components/forms/builder/BuilderCanvas';
import FieldConfig from '@/components/forms/builder/FieldConfig';
import FormSettingsPanel from '@/components/forms/builder/FormSettingsPanel';

// Keep existing createDefaultField, defaultFormSettings, withFormSettingsDefaults helpers

// Keep existing state declarations and API fetch/save logic unchanged

// Replace the return statement:
return (
  <FormBuilderLayout
    formId={formId}
    formTitle={formTitle}
    formType={formType as FormType}
    formStatus={formStatus}
    saving={saving}
    onTitleChange={setFormTitle}
    onSave={handleSave}
    onPublishToggle={handlePublishToggle}
    leftPanel={
      <LeftPanel
        fields={formFields}
        activeFieldId={activeField}
        onAddField={(type) => addField(type)}
        onSelectField={(id) => setActiveField(id)}
      />
    }
    centerPanel={
      loading ? <CanvasSkeleton /> : fetchError ? <CanvasError onRetry={fetchFormData} /> : (
        <BuilderCanvas
          formTitle={formTitle}
          formDescription={formDescription}
          fields={formFields}
          activeFieldId={activeField}
          onTitleChange={setFormTitle}
          onDescriptionChange={setFormDescription}
          onSelectField={(id) => { setActiveField(id); setRightTab('field'); }}
          onReorderFields={setFormFields}
          onDuplicateField={duplicateField}
          onDeleteField={deleteField}
          onAddField={() => addField('short_text')}
        />
      )
    }
    rightPanel={
      <RightPanel
        tab={rightTab}
        onTabChange={setRightTab}
        activeField={formFields.find(f => f.id === activeField) ?? null}
        formType={formType as FormType}
        formId={formId}
        formTitle={formTitle}
        formDescription={formDescription}
        formSlug={formSlug}
        settings={formSettings}
        hasQuizData={hasQuizData()}
        onUpdateField={updateField}
        onTitleChange={setFormTitle}
        onDescriptionChange={setFormDescription}
        onTypeChange={handleTypeChange}
        onSlugChange={setFormSlug}
        onSettingsChange={(updates) => setFormSettings(prev => ({ ...prev, ...updates }))}
      />
    }
    mobileFieldsPanel={/* same as leftPanel */}
    mobileConfigPanel={/* same as rightPanel */}
  />
);
```

Add small inline helper components at the bottom of the file:

```tsx
// Left panel with tab switcher
function LeftPanel({ fields, activeFieldId, onAddField, onSelectField }) {
  const [tab, setTab] = useState<'add' | 'fields'>('add');
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200 shrink-0">
        {(['add', 'fields'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[12px] font-medium capitalize transition-colors ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'add' ? 'Add' : 'Fields'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'add' ? <FieldPalette onAddField={onAddField} /> : <FieldNavigator fields={fields} activeFieldId={activeFieldId} onSelectField={onSelectField} />}
      </div>
    </div>
  );
}

// Right panel with tab switcher
interface RightPanelProps {
  tab: 'field' | 'settings';
  onTabChange: (t: 'field' | 'settings') => void;
  activeField: FormField | null;
  formType: FormType;
  formId: string;
  formTitle: string;
  formDescription: string;
  formSlug: string;
  settings: FormSettings;
  hasQuizData: boolean;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTypeChange: (t: FormType) => void;
  onSlugChange: (v: string) => void;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

function RightPanel({ tab, onTabChange, activeField, formType, onUpdateField, ...settingsProps }: RightPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200 shrink-0">
        {(['field', 'settings'] as const).map(t => (
          <button key={t} onClick={() => onTabChange(t)}
            className={`flex-1 py-2.5 text-[12px] font-medium capitalize transition-colors ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'field' ? 'Field' : 'Settings'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'field' ? (
          <FieldConfig field={activeField} formType={formType} onUpdateField={onUpdateField} />
        ) : (
          <FormSettingsPanel formType={formType} {...settingsProps} />
        )}
      </div>
    </div>
  );
}

// Loading skeleton
function CanvasSkeleton() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-[680px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-pulse">
        <div className="h-7 bg-slate-100 rounded-lg w-1/2" />
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
      </div>
    </div>
  );
}

// Error state
function CanvasError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-4">
      <p className="font-medium text-slate-700 mb-1">Couldn't load this form</p>
      <p className="text-[13px] text-slate-400 mb-4">Check your connection and try again</p>
      <div className="flex items-center gap-3">
        <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] hover:bg-blue-700">
          Retry
        </button>
        <Link href="/dashboard/forms" className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[13px] hover:bg-slate-50">
          ← Back to Forms
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `rightTab` state and `saveError` toast to existing state**

Add to existing state in edit page:
```tsx
const [rightTab, setRightTab] = useState<'field' | 'settings'>('settings');
const [fetchError, setFetchError] = useState(false);
const [saveToastVisible, setSaveToastVisible] = useState(false);
```

Update save handler to show toast on error:
```tsx
// In handleSave, on catch:
setSaveToastVisible(true);
setTimeout(() => setSaveToastVisible(false), 4000);
```

Add toast render inside return (positioned top-right):
```tsx
{saveToastVisible && (
  <div className="fixed top-4 right-4 z-50 bg-red-600 text-white text-[13px] px-4 py-2.5 rounded-xl shadow-lg">
    Failed to save. Try again.
  </div>
)}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/dashboard/forms/[any-id]/edit`. Confirm three-panel layout renders, field selection works, panels switch correctly.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/forms/[id]/edit/page.tsx
git commit -m "feat: rebuild form builder with three-panel layout"
```

---

## Task 11: Restyle `IdentityGate`

**Files:**
- Modify: `src/components/forms/IdentityGate.tsx`

- [ ] **Step 1: Read the existing file**

```bash
cat "src/components/forms/IdentityGate.tsx"
```

- [ ] **Step 2: Restyle to match spec**

The existing `IdentityGate` passes collected data to a callback. Add `identity` state and `handleSubmit` — keep any existing submission logic but adapt to the new `onComplete` prop pattern:

```tsx
interface IdentityGateProps {
  schema: FormSchema;
  onComplete: (data: Record<string, string>) => void;
}

export default function IdentityGate({ schema, onComplete }: IdentityGateProps) {
  const [identity, setIdentity] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const missing: string[] = [];
    if (schema.settings.identitySchema.requireName && !identity.name) missing.push('name');
    if (schema.settings.identitySchema.requireEmail && !identity.email) missing.push('email');
    if (schema.settings.identitySchema.requireStudentId && !identity.studentId) missing.push('studentId');
    if (missing.length > 0) { setErrors(missing); return; }
    onComplete(identity);
  };
  // ...
}
```

Replace only the JSX return to match the new design:

```tsx
return (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="w-full max-w-[480px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      {/* Form title */}
      <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Form</p>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">{formTitle}</h1>
      {formDescription && <p className="text-[13px] text-slate-500 mb-6">{formDescription}</p>}
      <hr className="border-slate-100 mb-6" />

      {/* Fields (only required ones per settings) */}
      <div className="space-y-4">
        {schema.settings.identitySchema.requireName && (
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={identity.name ?? ''} onChange={(e) => setIdentity(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
        )}
        {schema.settings.identitySchema.requireEmail && (
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input type="email" value={identity.email ?? ''} onChange={(e) => setIdentity(p => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
        )}
        {schema.settings.identitySchema.requireStudentId && (
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1">Student ID <span className="text-red-500">*</span></label>
            <input type="text" value={identity.studentId ?? ''} onChange={(e) => setIdentity(p => ({ ...p, studentId: e.target.value }))}
              placeholder="Your student ID"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 w-full h-11 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
        Start Form →
      </button>

      {/* Privacy note */}
      <p className="mt-3 text-center text-[11px] text-slate-400">
        Your info is only shared with the form owner
      </p>
    </div>
  </div>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/IdentityGate.tsx
git commit -m "feat: restyle IdentityGate for public form responder"
```

---

## Task 12: `FormField` + `FormModeB` — Public Form All-on-One-Page

**Files:**
- Create: `src/components/forms/public/FormField.tsx`
- Create: `src/components/forms/public/FormModeB.tsx`

- [ ] **Step 1: Create `FormField` — single field renderer for responders**

```tsx
// src/components/forms/public/FormField.tsx
"use client";
import { FormField as IFormField } from '@/types/forms';

interface Props {
  field: IFormField;
  value: string | string[];
  error?: string;
  onChange: (value: string | string[]) => void;
  onBlur?: () => void;
}

export default function FormField({ field, value, error, onChange, onBlur }: Props) {
  const inputClass = `w-full rounded-xl border px-4 py-3 text-[14px] text-slate-700 focus:outline-none focus:ring-2 transition-colors ${
    error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
  }`;

  if (field.type === 'section') {
    return (
      <div className="pt-6 pb-2">
        <h3 className="text-base font-semibold text-slate-700">{field.label}</h3>
        <hr className="mt-2 border-slate-200" />
      </div>
    );
  }

  const renderInput = () => {
    if (field.type === 'long_text') {
      return <textarea value={value as string} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
        placeholder={field.placeholder} rows={4} className={`${inputClass} resize-none`} />;
    }
    if (field.type === 'dropdown') {
      return (
        <select value={value as string} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={inputClass}>
          <option value="">Select an option</option>
          {field.options.map((o, i) => <option key={i} value={o}>{o}</option>)}
        </select>
      );
    }
    if (field.type === 'radio') {
      return (
        <div className="space-y-2 mt-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === o ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {value === o && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-[14px] text-slate-700">{o}</span>
              <input type="radio" className="sr-only" value={o} checked={value === o} onChange={() => onChange(o)} />
            </label>
          ))}
        </div>
      );
    }
    if (field.type === 'checkbox') {
      const checked = (value as string[]) || [];
      return (
        <div className="space-y-2 mt-1">
          {field.options.map((o, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked.includes(o) ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                {checked.includes(o) && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
              </div>
              <span className="text-[14px] text-slate-700">{o}</span>
              <input type="checkbox" className="sr-only" checked={checked.includes(o)}
                onChange={() => onChange(checked.includes(o) ? checked.filter(c => c !== o) : [...checked, o])} />
            </label>
          ))}
        </div>
      );
    }
    return (
      <input
        type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={inputClass}
      />
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[14px] font-medium text-slate-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.helpText && <p className="text-[12px] text-slate-400">{field.helpText}</p>}
      {renderInput()}
      {error && <p className="text-[12px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Create `FormModeB`**

```tsx
// src/components/forms/public/FormModeB.tsx
"use client";
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { FormSchema } from '@/types/forms';
import FormFieldComponent from './FormField';

interface QuizResult {
  score: number;
  maxScore: number;
  breakdown: { label: string; correct: boolean; explanation?: string }[];
}

interface FormModeBProps {
  schema: FormSchema;
  identityData: Record<string, string>;
  onSubmitSuccess: (responseId: string, quizResult?: QuizResult) => void;
}

export default function FormModeB({ schema, identityData, onSubmitSuccess }: FormModeBProps) {
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Progress: filled required fields / total required fields
  const requiredFields = schema.fields.filter(f => f.required && f.type !== 'section');
  const filledRequired = requiredFields.filter(f => {
    const v = values[f.id];
    return Array.isArray(v) ? v.length > 0 : !!v;
  });
  const progress = requiredFields.length === 0 ? 100 : Math.round((filledRequired.length / requiredFields.length) * 100);

  const validateField = (fieldId: string, value: string | string[]): string => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field || !field.required) return '';
    if (Array.isArray(value)) return value.length === 0 ? 'This field is required' : '';
    return !value ? 'This field is required' : '';
  };

  const handleBlur = (fieldId: string) => {
    const error = validateField(fieldId, values[fieldId] ?? '');
    setErrors(prev => ({ ...prev, [fieldId]: error }));
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const newErrors: Record<string, string> = {};
    schema.fields.forEach(f => {
      const error = validateField(f.id, values[f.id] ?? '');
      if (error) newErrors[f.id] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${schema._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: values, identity: identityData }),
      });
      const data = await res.json();
      if (data.success) {
        // API may return quiz result inline — pass it up if present
        const quizResult = data.quizResult ?? null;
        onSubmitSuccess(data.responseId ?? '', quizResult);
      } else {
        setSubmitError('Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add submitError state at top of component:
  // const [submitError, setSubmitError] = useState<string | null>(null);
  // Render below Submit button:
  // {submitError && <p className="mt-2 text-[13px] text-red-500 text-center">{submitError}</p>}

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-10 h-1 bg-slate-100">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-10">
        {/* Form header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800">{schema.title}</h1>
          {schema.description && <p className="mt-1.5 text-[14px] text-slate-500">{schema.description}</p>}
        </div>

        {/* Fields */}
        <div className="space-y-6">
          {schema.fields.map(field => (
            <FormFieldComponent
              key={field.id}
              field={field}
              value={values[field.id] ?? (field.type === 'checkbox' ? [] : '')}
              error={errors[field.id]}
              onChange={(v) => setValues(prev => ({ ...prev, [field.id]: v }))}
              onBlur={() => handleBlur(field.id)}
            />
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-8 w-full h-12 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 sm:w-auto sm:px-8"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Submit
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/public/FormField.tsx src/components/forms/public/FormModeB.tsx
git commit -m "feat: add FormModeB all-on-one-page public form renderer"
```

---

## Task 13: `FormModeC` — Paginated Sections

**Files:**
- Create: `src/components/forms/public/FormModeC.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/forms/public/FormModeC.tsx
"use client";
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormSchema, FormField } from '@/types/forms';
import FormFieldComponent from './FormField';

interface FormModeCProps {
  schema: FormSchema;
  identityData: Record<string, string>;
  onSubmitSuccess: (responseId: string) => void;
}

// Split fields into sections at each 'section' field
function splitIntoSections(fields: FormField[]): FormField[][] {
  const sections: FormField[][] = [[]];
  for (const field of fields) {
    if (field.type === 'section') {
      sections.push([field]);
    } else {
      sections[sections.length - 1].push(field);
    }
  }
  return sections.filter(s => s.length > 0);
}

export default function FormModeC({ schema, identityData, onSubmitSuccess }: FormModeCProps) {
  const sections = useMemo(() => splitIntoSections(schema.fields), [schema.fields]);
  const [currentSection, setCurrentSection] = useState(0);
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const isLast = currentSection === sections.length - 1;

  const validateSection = (): boolean => {
    const section = sections[currentSection];
    const newErrors: Record<string, string> = {};
    section.forEach(f => {
      if (!f.required || f.type === 'section') return;
      const v = values[f.id];
      if (Array.isArray(v) ? v.length === 0 : !v) {
        newErrors[f.id] = 'This field is required';
      }
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) return;
    setDirection(1);
    setCurrentSection(s => s + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentSection(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${schema._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: values, identity: identityData }),
      });
      const data = await res.json();
      if (data.success) onSubmitSuccess(data.responseId ?? '');
    } catch {
      // leave for retry
    } finally {
      setSubmitting(false);
    }
  };

  const section = sections[currentSection];

  return (
    <div className="min-h-screen bg-white">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 h-1 bg-slate-100">
        <div className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }} />
      </div>

      <div className="max-w-[640px] mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-slate-800">{schema.title}</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-[13px] text-slate-500">Step {currentSection + 1} of {sections.length}</span>
          <div className="flex gap-1 ml-2">
            {sections.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentSection ? 'w-6 bg-blue-600' : i < currentSection ? 'w-3 bg-blue-300' : 'w-3 bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {/* Section fields with fade transition */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSection}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {section.map(field => (
              <FormFieldComponent
                key={field.id}
                field={field}
                value={values[field.id] ?? (field.type === 'checkbox' ? [] : '')}
                error={errors[field.id]}
                onChange={(v) => setValues(prev => ({ ...prev, [field.id]: v }))}
                onBlur={() => {
                  if (field.required && field.type !== 'section') {
                    const v = values[field.id];
                    const error = (Array.isArray(v) ? v.length === 0 : !v) ? 'This field is required' : '';
                    setErrors(prev => ({ ...prev, [field.id]: error }));
                  }
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentSection === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Submit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/public/FormModeC.tsx
git commit -m "feat: add FormModeC paginated sections public form renderer"
```

---

## Task 14: `PublicFormShell` + Update `/f/[id]` Page

**Files:**
- Create: `src/components/forms/public/PublicFormShell.tsx`
- Create: `src/components/forms/public/QuizEndScreen.tsx`
- Modify: `src/app/f/[id]/page.tsx`

- [ ] **Step 1: Create `QuizEndScreen`**

```tsx
// src/components/forms/public/QuizEndScreen.tsx
"use client";
import { Share2, RotateCcw } from 'lucide-react';

interface QuizEndScreenProps {
  score: number;
  maxScore: number;
  breakdown: { label: string; correct: boolean; explanation?: string }[];
  allowRetake: boolean;
  onRetake: () => void;
}

export default function QuizEndScreen({ score, maxScore, breakdown, allowRetake, onRetake }: QuizEndScreenProps) {
  const pct = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

  const handleShare = () => {
    const text = `I scored ${score}/${maxScore} (${pct}%) on this quiz!`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-[480px] w-full text-center">
        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-blue-600">{pct}%</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-1">
          You scored {score}/{maxScore}
        </h2>
        <p className="text-[14px] text-slate-500 mb-8">
          {pct >= 70 ? 'Great job!' : pct >= 50 ? 'Good effort!' : 'Keep practising!'}
        </p>

        {/* Breakdown */}
        <div className="text-left space-y-2 mb-8">
          {breakdown.map((item, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${item.correct ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className={`text-lg ${item.correct ? 'text-green-500' : 'text-red-500'}`}>{item.correct ? '✓' : '✗'}</span>
              <div>
                <p className="text-[13px] font-medium text-slate-700">{item.label}</p>
                {item.explanation && <p className="text-[12px] text-slate-500 mt-0.5">{item.explanation}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          {allowRetake && (
            <button onClick={onRetake} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-[14px] text-slate-600 hover:bg-slate-50">
              <RotateCcw size={15} /> Retake
            </button>
          )}
          <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[14px] hover:bg-blue-700">
            <Share2 size={15} /> Share Score
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `PublicFormShell`**

```tsx
// src/components/forms/public/PublicFormShell.tsx
"use client";
import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { FormSchema } from '@/types/forms';
import IdentityGate from '@/components/forms/IdentityGate';
import FormModeB from './FormModeB';
import FormModeC from './FormModeC';
import QuizEndScreen from './QuizEndScreen';

interface PublicFormShellProps {
  schema: FormSchema;
}

type Stage = 'identity' | 'form' | 'quiz-end' | 'submitted';

export default function PublicFormShell({ schema }: PublicFormShellProps) {
  const [stage, setStage] = useState<Stage>(() => {
    const needsGate = schema.settings.identitySchema.requireName ||
      schema.settings.identitySchema.requireEmail ||
      schema.settings.identitySchema.requireStudentId;
    return needsGate ? 'identity' : 'form';
  });
  const [identityData, setIdentityData] = useState<Record<string, string>>({});
  const [responseId, setResponseId] = useState('');
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleIdentityComplete = (data: Record<string, string>) => {
    setIdentityData(data);
    setStage('form');
  };

  const handleSubmitSuccess = (id: string, result?: QuizResult) => {
    setResponseId(id);
    if (schema.type === 'quiz') {
      setQuizResult(result ?? null);
      setStage('quiz-end');
    } else {
      setStage('submitted');
    }
  };

  if (stage === 'identity') {
    return <IdentityGate schema={schema} onComplete={handleIdentityComplete} />;
  }

  if (stage === 'submitted') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Response submitted!</h2>
          <p className="text-[14px] text-slate-500">Thank you for completing this form.</p>
        </div>
      </div>
    );
  }

  if (stage === 'quiz-end') {
    return (
      <QuizEndScreen
        score={quizResult?.score ?? 0}
        maxScore={quizResult?.maxScore ?? 0}
        breakdown={quizResult?.breakdown ?? []}
        allowRetake={schema.settings.allowMultipleSubmissions}
        onRetake={() => { setStage('form'); setQuizResult(null); }}
      />
    );
  }

  const mode = schema.settings?.displayMode ?? 'all';

  if (mode === 'paginated') {
    return <FormModeC schema={schema} identityData={identityData} onSubmitSuccess={handleSubmitSuccess} />;
  }

  return <FormModeB schema={schema} identityData={identityData} onSubmitSuccess={handleSubmitSuccess} />;
}
```

- [ ] **Step 3: Update `/f/[id]/page.tsx`**

Replace `PublicFormRenderer` usage with `PublicFormShell`:

```tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import PublicFormShell from '@/components/forms/public/PublicFormShell';
import { FormSchema } from '@/types/forms';

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${formId}/schema`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? "This form doesn't exist or has been removed." : "This form is not currently available.");
        return res.json();
      })
      .then(data => {
        if (data.success && data.data) {
          setSchema({ ...data.data, settings: { displayMode: 'all', ...data.data.settings } });
        } else {
          setError(data.error || "Failed to load form");
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
    </div>
  );

  if (error || !schema) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <h2 className="font-semibold text-slate-800 mb-1">Form unavailable</h2>
        <p className="text-[14px] text-slate-500">{error}</p>
      </div>
    </div>
  );

  // Set document title via useEffect (client component — can't use metadata export)
  useEffect(() => {
    if (schema) document.title = schema.title;
  }, [schema]);

  return <PublicFormShell schema={schema} />;
}
```

- [ ] **Step 4: Verify in browser**

Navigate to `/f/[id]` for a published form. Confirm:
- Mode B renders (all fields on one page)
- Progress bar tracks filled required fields
- Submit works

- [ ] **Step 5: Commit**

```bash
git add src/components/forms/public/ src/app/f/[id]/page.tsx
git commit -m "feat: add PublicFormShell with mode B/C routing and quiz end screen"
```

---

## Task 15: `ResponseSlideOver`

**Files:**
- Create: `src/components/forms/responses/ResponseSlideOver.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/forms/responses/ResponseSlideOver.tsx
"use client";
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ResponseField {
  label: string;
  answer: string | string[];
}

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  respondentName?: string;
  respondentEmail?: string;
  submittedAt: string;
  fields: ResponseField[];
  isQuiz?: boolean;
  quizScore?: number;
  quizMaxScore?: number;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
}

export default function ResponseSlideOver({ open, onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore }: SlideOverProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />

          {/* Desktop: slide from right */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[400px] bg-white shadow-xl flex flex-col hidden md:flex"
          >
            <SlideOverContent {...{ onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore }} />
          </motion.div>

          {/* Mobile: slide from bottom */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col md:hidden"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <SlideOverContent {...{ onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SlideOverContent({ onClose, respondentName, respondentEmail, submittedAt, fields, isQuiz, quizScore, quizMaxScore }: Omit<SlideOverProps, 'open'>) {
  const pct = isQuiz && quizMaxScore ? Math.round(((quizScore ?? 0) / quizMaxScore) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100 shrink-0">
        <div>
          <p className="font-semibold text-slate-800">{respondentName || 'Anonymous'}</p>
          {respondentEmail && <p className="text-[12px] text-slate-400">{respondentEmail}</p>}
          <p className="text-[12px] text-slate-400 mt-0.5">{formatDate(submittedAt)}</p>
          {isQuiz && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[13px] font-medium text-slate-700">{quizScore}/{quizMaxScore} · {pct}%</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${pct >= 50 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {pct >= 50 ? 'Pass' : 'Fail'}
              </span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {fields.map((f, i) => (
          <div key={i} className={`px-3 py-3 rounded-lg ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
            <p className="text-[13px] text-slate-700">{Array.isArray(f.answer) ? f.answer.join(', ') : f.answer || '—'}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/forms/responses/ResponseSlideOver.tsx
git commit -m "feat: add ResponseSlideOver desktop slide-over and mobile bottom sheet"
```

---

## Task 16: Responses Page Redesign

**Files:**
- Modify: `src/app/dashboard/forms/[id]/responses/page.tsx`

- [ ] **Step 1: Read the full existing file**

Open `src/app/dashboard/forms/[id]/responses/page.tsx` — understand current state, API calls, and data shape.

- [ ] **Step 2: Add new state + derived values**

At the top of the `FormResponsesPage` component, add:

```tsx
import FormsStatChips from '@/components/forms/FormsStatChips';
import ResponseSlideOver from '@/components/forms/responses/ResponseSlideOver';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, CheckCircle, Edit3, BarChart, ArrowLeft, Download, Search } from 'lucide-react';

// New state (add alongside existing state):
const [selectedResponse, setSelectedResponse] = useState<any>(null);
const [selectedIds, setSelectedIds] = useState<string[]>([]);

// Derived stats (compute from existing `responses` array and `totalResponses`):
const today = new Date().toDateString();
const todayCount = responses.filter((r: any) => new Date(r.submittedAt).toDateString() === today).length;
// completionRate: assume all fetched responses are complete (or use existing logic if available)
const completionRate = totalResponses > 0 ? 100 : 0;

// Helper: map a response object to ResponseSlideOver props
const mapToSlideOver = (r: any) => ({
  respondentName: r.identity?.name ?? r.respondentName ?? undefined,
  respondentEmail: r.identity?.email ?? r.respondentEmail ?? undefined,
  submittedAt: r.submittedAt ?? r.createdAt,
  fields: form?.fields?.map((f: any) => ({
    label: f.label,
    answer: r.responses?.[f.id] ?? r.data?.[f.id] ?? '—',
  })) ?? [],
  isQuiz: form?.type === 'quiz',
  quizScore: r.quizResult?.score,
  quizMaxScore: r.quizResult?.maxScore,
});
```

- [ ] **Step 3: Replace the return JSX**

Replace the entire return statement with:

```tsx
return (
  <div className="space-y-4">
    {/* Page header */}
    <div>
      <Link href="/dashboard/forms" className="text-[12px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 mb-1">
        <ArrowLeft size={12} /> Forms
      </Link>
      <h1 className="text-[16px] font-semibold text-slate-800">{form?.title ?? 'Responses'}</h1>
    </div>

    {/* Sub-nav */}
    <div className="flex gap-1 border-b border-slate-200">
      {[
        { label: 'Edit', href: `/dashboard/forms/${formId}/edit`, icon: Edit3 },
        { label: 'Responses', href: `/dashboard/forms/${formId}/responses`, icon: MessageSquare, active: true },
        { label: 'Analytics', href: `/dashboard/forms/${formId}/analytics`, icon: BarChart },
      ].map(({ label, href, icon: Icon, active }) => (
        <Link key={label} href={href}
          className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Icon size={13} /> {label}
        </Link>
      ))}
    </div>

    {/* Stats chips */}
    <FormsStatChips stats={[
      { icon: MessageSquare, value: totalResponses, label: 'Total' },
      { icon: Calendar, value: todayCount, label: 'Today' },
      { icon: CheckCircle, value: `${completionRate}%`, label: 'Completion Rate' },
    ]} />

    {/* Toolbar */}
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search responses..."
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <button
        onClick={() => {/* existing export handler */}}
        className="flex items-center gap-1.5 h-9 px-3 border border-slate-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <Download size={13} /> Export CSV
      </button>
    </div>

    {/* Bulk actions bar */}
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-4 text-[13px]">
            <span className="text-blue-700 font-medium">{selectedIds.length} selected</span>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">Export selected</button>
            <button
              onClick={() => {/* delete selected — use existing delete handler per id */}}
              className="text-red-500 hover:text-red-700 transition-colors"
            >Delete selected</button>
            <button onClick={() => setSelectedIds([])} className="ml-auto text-slate-500 hover:text-slate-700">Clear</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Table / loading / error / empty states */}
    {loading ? (
      /* Skeleton: 5 pulsing rows */
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
            <div className="w-4 h-4 bg-slate-100 rounded" />
            <div className="h-3 bg-slate-100 rounded flex-1" />
            <div className="h-3 bg-slate-100 rounded w-24 hidden sm:block" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
        ))}
      </div>
    ) : error ? (
      /* Error banner */
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-[13px]">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
        <button onClick={() => {/* existing refresh/retry handler */}} className="text-red-600 font-medium hover:text-red-800">Retry</button>
      </div>
    ) : responses.length === 0 ? (
      /* Empty state */
      <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={24} className="text-blue-500" />
        </div>
        <h3 className="text-[14px] font-semibold text-slate-800 mb-1">
          {searchTerm ? 'No responses match your search' : 'No responses yet'}
        </h3>
        <p className="text-[13px] text-slate-400 mb-5">
          {searchTerm ? 'Try a different search term' : 'Share your form to start collecting responses'}
        </p>
        {!searchTerm && (
          <button
            onClick={() => {/* existing copy link handler */}}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Copy Share Link
          </button>
        )}
      </div>
    ) : (
      /* Responses table — wrap existing ResponsesTable/VirtualizedResponsesTable */
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="min-w-full text-[13px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedIds.length === responses.length}
                  onChange={(e) => setSelectedIds(e.target.checked ? responses.map((r: any) => r._id) : [])}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Respondent</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden sm:table-cell">Submitted</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Status</th>
              {form?.type === 'quiz' && (
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Score</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {responses.map((r: any) => (
              <tr
                key={r._id}
                onClick={() => setSelectedResponse(r)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(r._id)}
                    onChange={(e) => setSelectedIds(e.target.checked
                      ? [...selectedIds, r._id]
                      : selectedIds.filter(id => id !== r._id)
                    )}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-700">{r.identity?.name ?? r.respondentName ?? 'Anonymous'}</div>
                  {(r.identity?.email ?? r.respondentEmail) && (
                    <div className="text-[11px] text-slate-400">{r.identity?.email ?? r.respondentEmail}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(r.submittedAt ?? r.createdAt))}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium bg-green-50 text-green-700">Complete</span>
                </td>
                {form?.type === 'quiz' && (
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {r.quizResult ? `${r.quizResult.score}/${r.quizResult.maxScore}` : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Pagination — keep existing pagination UI, just restyle */}
    {!loading && responses.length > 0 && (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-[12px] text-slate-500">Showing responses</p>
        {/* Keep existing prev/next button logic here */}
      </div>
    )}

    {/* Slide-over */}
    <ResponseSlideOver
      open={!!selectedResponse}
      onClose={() => setSelectedResponse(null)}
      {...(selectedResponse ? mapToSlideOver(selectedResponse) : {
        submittedAt: '',
        fields: [],
      })}
    />
  </div>
);
```

- [ ] **Step 3: Verify in browser**

Navigate to `/dashboard/forms/[id]/responses`. Confirm slide-over opens on row click and closes on Escape/backdrop.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/forms/[id]/responses/page.tsx
git commit -m "feat: redesign responses page with slide-over, stats bar, sub-nav"
```

---

## Task 17: Analytics Page Redesign

**Files:**
- Modify: `src/app/dashboard/forms/[id]/analytics/page.tsx`
- Modify: `src/components/forms/AnalyticsTabs.tsx`

- [ ] **Step 1: Read existing `AnalyticsTabs.tsx`**

```bash
cat "src/components/forms/AnalyticsTabs.tsx"
```

Understand current tab structure and data fetching.

- [ ] **Step 2: Restructure into three tabs (Overview / Fields / AI Insights)**

In `src/components/forms/AnalyticsTabs.tsx`, ensure the three tabs match the spec:

**Overview tab:** 4 bento stat cards + Recharts line chart
**Fields tab:** accordion per field with answer breakdowns
**AI Insights tab:** Generate button → loading → results; quiz leaderboard if applicable

Keep existing data fetching hooks. Replace JSX structure to match the new tab layout.

- [ ] **Step 3: Redesign analytics page wrapper**

In `src/app/dashboard/forms/[id]/analytics/page.tsx`, add the page header with sub-nav (Edit · Responses · Analytics) and pass `formId` down:

```tsx
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Edit3, MessageSquare, BarChart, ArrowLeft } from 'lucide-react';
import AnalyticsTabs from '@/components/forms/AnalyticsTabs';
import connectDB from '@/lib/mongoose';
import Form from '@/models/Form';
import { notFound } from 'next/navigation';

export default async function FormAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  if (!token || !verifyAccessToken(token)) redirect('/sign-in');
  const { id } = await params;

  await connectDB();
  const form = await Form.findById(id).select('title').lean<{ title: string }>();
  if (!form) notFound();
  const formTitle = form.title;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/forms" className="text-[12px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 mb-1">
            <ArrowLeft size={12} /> Forms
          </Link>
          <h1 className="text-[16px] font-semibold text-slate-800">{formTitle}</h1>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { label: 'Edit', href: `/dashboard/forms/${id}/edit`, icon: Edit3 },
          { label: 'Responses', href: `/dashboard/forms/${id}/responses`, icon: MessageSquare },
          { label: 'Analytics', href: `/dashboard/forms/${id}/analytics`, icon: BarChart, active: true },
        ].map(({ label, href, icon: Icon, active }) => (
          <Link key={label} href={href}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Icon size={13} /> {label}
          </Link>
        ))}
      </div>

      <AnalyticsTabs formId={id} />
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

Navigate to `/dashboard/forms/[id]/analytics`. Confirm three inner tabs render, stat cards load, and AI Insights generate button works.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/forms/[id]/analytics/page.tsx src/components/forms/AnalyticsTabs.tsx
git commit -m "feat: redesign analytics page with sub-nav and three tabbed sections"
```

---

## Task 18: Final Check + TypeScript Build

- [ ] **Step 1: Run full TypeScript check**

```bash
cd "w:/My Work/Software Development Project/Ai Projects/ai-toolbox"
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 2: Verify all success criteria from spec**

Work through the checklist in `docs/superpowers/specs/2026-03-26-forms-redesign.md` Section 13. For each item, manually verify in the browser or mark it as not applicable.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: forms E2E redesign — all tasks complete"
```

---

## Quick Reference

**Dev server:** `npm run dev` → [http://localhost:3000](http://localhost:3000)

**Key routes to test:**
- `/dashboard/forms` — forms list
- `/dashboard/forms/[id]/edit` — three-panel builder
- `/dashboard/forms/[id]/responses` — responses with slide-over
- `/dashboard/forms/[id]/analytics` — analytics tabs
- `/f/[id]` — public form (test mode B and mode C)

**Spec:** `docs/superpowers/specs/2026-03-26-forms-redesign.md`

**New component locations:**
- Builder: `src/components/forms/builder/`
- Public form: `src/components/forms/public/`
- Responses: `src/components/forms/responses/`
