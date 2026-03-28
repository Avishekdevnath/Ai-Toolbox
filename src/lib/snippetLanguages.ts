export const languages = [
  'javascript',
  'typescript',
  'python',
  'go',
  'java',
  'c',
  'cpp',
  'ruby',
  'rust',
  'html',
  'css',
  'json',
  'bash',
  'sql',
  'markdown',
];

export const LANG_COLORS: Record<string, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  typescript: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  python:     'bg-green-500/20 text-green-300 border border-green-500/30',
  go:         'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  java:       'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  c:          'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  cpp:        'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  ruby:       'bg-red-500/20 text-red-300 border border-red-500/30',
  rust:       'bg-orange-600/20 text-orange-300 border border-orange-600/30',
  html:       'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  css:        'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  json:       'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  bash:       'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  sql:        'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  markdown:   'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
};

const DEFAULT_LANG_COLOR = 'bg-gray-700/50 text-gray-400 border border-gray-600/30';

export function getLangColor(lang: string): string {
  return LANG_COLORS[lang.toLowerCase()] ?? DEFAULT_LANG_COLOR;
}
