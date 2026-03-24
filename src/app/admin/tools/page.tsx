'use client';

import { useEffect, useState } from 'react';
import { Wrench, CheckCircle, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { aiTools, utilityTools } from '@/data/tools';

const allTools = [...aiTools, ...utilityTools];

interface ToolSetting {
  slug: string;
  isActive: boolean;
}

export default function AdminToolsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tools/settings');
      if (res.ok) {
        const { settings: rows } = await res.json();
        const map: Record<string, boolean> = {};
        rows.forEach((r: ToolSetting) => { map[r.slug] = r.isActive; });
        setSettings(map);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (slug: string, current: boolean) => {
    setToggling(slug);
    try {
      await fetch(`/api/admin/tools/${slug}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, isActive: !current }),
      });
      setSettings((prev) => ({ ...prev, [slug]: !current }));
    } finally {
      setToggling(null);
    }
  };

  const isActive = (slug: string) => settings[slug] !== false; // default active
  const activeCount = allTools.filter((t) => isActive(t.id)).length;
  const totalUsage = allTools.reduce((s, t) => s + (t.recentUsage ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Tools Management</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Activate or deactivate tools for public access.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tools', value: allTools.length, icon: Wrench },
          { label: 'Active (Public)', value: activeCount, icon: CheckCircle },
          { label: 'Total Recent Usage', value: totalUsage, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 relative">
            <span className="absolute top-4 right-4 p-1.5 bg-blue-50 rounded-lg">
              <Icon className="h-4 w-4 text-blue-600" />
            </span>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</p>
            <p className="text-2xl font-bold tabular-nums text-slate-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Tools Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
          <Wrench className="h-4 w-4 text-slate-400" />
          <h2 className="text-[13px] font-semibold text-slate-700">All Tools</h2>
          <span className="ml-auto text-[12px] text-slate-400">Toggle to control public visibility</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Tool</th>
                  <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Category</th>
                  <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Recent Usage</th>
                  <th className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium">Status</th>
                  <th className="px-5 py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-medium text-right">Public Access</th>
                </tr>
              </thead>
              <tbody>
                {allTools.map((tool) => {
                  const active = isActive(tool.id);
                  const busy = toggling === tool.id;
                  return (
                    <tr key={tool.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-700">{tool.name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{tool.description}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-500">{tool.category}</td>
                      <td className="px-5 py-3 text-slate-500 tabular-nums">{tool.recentUsage ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => toggle(tool.id, active)}
                          disabled={busy}
                          aria-label={active ? 'Deactivate tool' : 'Activate tool'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
                          {busy && <Loader2 className="absolute inset-0 m-auto w-3.5 h-3.5 animate-spin text-white" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
