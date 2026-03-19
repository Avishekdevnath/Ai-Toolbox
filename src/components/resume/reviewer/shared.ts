import { ClipboardCheck, ScanSearch, TrendingUp } from 'lucide-react';

export const experienceLevels = ['entry-level', 'mid-level', 'senior-level', 'executive'];

export const intakeHighlights = [
  {
    icon: ClipboardCheck,
    title: 'Recruiter signal check',
    description: 'See what is immediately clear, missing, or weak in the first scan.',
  },
  {
    icon: ScanSearch,
    title: 'ATS coverage',
    description: 'Spot keyword gaps before your resume gets filtered out.',
  },
  {
    icon: TrendingUp,
    title: 'Priority fixes',
    description: 'Get the highest-impact edits in the order worth making them.',
  },
];

export const allowedFileTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/tiff',
];

export const selectClassName =
  'h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]';

export function formatExperienceLabel(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getVerdict(score: number) {
  if (score >= 85) {
    return {
      label: 'Strong shortlist potential',
      tone: 'text-emerald-300',
      badgeClass: 'bg-emerald-500/15 text-emerald-200',
    };
  }

  if (score >= 70) {
    return {
      label: 'Competitive with targeted edits',
      tone: 'text-amber-200',
      badgeClass: 'bg-amber-500/15 text-amber-100',
    };
  }

  return {
    label: 'Needs stronger recruiter proof',
    tone: 'text-rose-200',
    badgeClass: 'bg-rose-500/15 text-rose-100',
  };
}
