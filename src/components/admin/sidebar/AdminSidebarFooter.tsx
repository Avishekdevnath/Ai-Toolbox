import { LogOut } from 'lucide-react';

interface Props {
  email?: string;
  name?: string;
  onLogout: () => void;
}

export function AdminSidebarFooter({ email, name, onLogout }: Props) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : (email ?? 'A').slice(0, 2).toUpperCase();

  return (
    <div className="px-3 py-3 border-t border-slate-700/60 flex-shrink-0">
      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-[var(--color-text-primary)] font-medium truncate leading-tight">{name || email || 'Admin'}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] leading-tight mt-0.5">Administrator</p>
        </div>
        <button
          onClick={onLogout}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded-md transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
