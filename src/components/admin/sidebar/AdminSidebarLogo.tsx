import { Shield } from 'lucide-react';

export function AdminSidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-700/60 flex-shrink-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 shadow-lg shadow-orange-500/30 flex-shrink-0">
        <Shield className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <span className="text-[15px] font-semibold text-white tracking-tight leading-none">Admin Panel</span>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-none">System Control</p>
      </div>
    </div>
  );
}
