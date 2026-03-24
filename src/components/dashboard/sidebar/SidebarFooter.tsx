import { Settings } from 'lucide-react';
import Link from 'next/link';

interface Props {
  email?: string;
  role?: string;
}

export function SidebarFooter({ email, role }: Props) {
  const initials = email ? email.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="px-3 py-3 border-t border-slate-700/60">
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-700/50 transition-colors group"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-slate-200 font-medium truncate leading-tight">{email ?? 'User'}</p>
          {role && (
            <p className="text-[10px] text-slate-500 capitalize leading-tight mt-0.5">{role}</p>
          )}
        </div>
        <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 transition-colors" />
      </Link>
    </div>
  );
}
