'use client';

import { useTheme } from './useTheme';

export interface ChartColors {
  grid: string;
  text: string;
  tooltip: { bg: string; border: string; text: string };
  series: string[];
}

export function useChartColors(): ChartColors {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  return {
    grid: dark ? '#1E293B' : '#f1f5f9',
    text: dark ? '#94A3B8' : '#64748B',
    tooltip: {
      bg: dark ? '#1E293B' : '#ffffff',
      border: dark ? '#334155' : '#e2e8f0',
      text: dark ? '#F1F5F9' : '#1E293B',
    },
    series: ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626'],
  };
}
