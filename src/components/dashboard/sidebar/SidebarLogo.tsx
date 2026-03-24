import { Zap } from 'lucide-react';

export function SidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-700/60">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30 flex-shrink-0">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <span className="text-[15px] font-semibold text-white tracking-tight leading-none">AI Toolbox</span>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-none">Pro Dashboard</p>
      </div>
    </div>
  );
}
