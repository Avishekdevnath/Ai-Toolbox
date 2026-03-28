import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative hidden md:flex items-center w-full max-w-xs">
      <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--color-text-muted)] pointer-events-none" />
      <input
        type="search"
        placeholder="Search tools, history…"
        className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-[var(--color-muted)] border border-[var(--color-border)] rounded-lg placeholder:text-[var(--color-text-muted)] text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
      />
    </div>
  );
}
