'use client';

import { useEffect, useState, useMemo } from 'react';
import { MessageSquare, Bug, Lightbulb, RefreshCw, X, ChevronDown } from 'lucide-react';

type FeedbackType = 'bug' | 'feature';
type FeedbackStatus = 'new' | 'in_review' | 'planned' | 'resolved' | 'closed';
type Priority = 'low' | 'medium' | 'high' | null;

interface FeedbackItem {
  _id: string;
  type: FeedbackType;
  title: string;
  description: string;
  url: string | null;
  status: FeedbackStatus;
  priority: Priority;
  userId: string | null;
  visitorId: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  planned: 'Planned',
  resolved: 'Resolved',
  closed: 'Closed',
};

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  new: 'bg-blue-50 text-blue-700',
  in_review: 'bg-amber-50 text-amber-700',
  planned: 'bg-purple-50 text-purple-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-slate-100 text-slate-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
};

const selectCls = 'border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none';

function StatusBadge({ status }: { status: FeedbackStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (!priority) return null;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${PRIORITY_COLORS[priority]}`}>
      {priority}
    </span>
  );
}

interface DetailModalProps {
  item: FeedbackItem;
  onClose: () => void;
  onUpdate: (id: string, patch: { status?: FeedbackStatus; priority?: Priority }) => void;
}

function DetailModal({ item, onClose, onUpdate }: DetailModalProps) {
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [priority, setPriority] = useState<Priority>(item.priority);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/admin/feedback/${item._id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, priority }),
      });
      onUpdate(item._id, { status, priority });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {item.type === 'bug'
              ? <Bug className="w-4 h-4 text-red-500" />
              : <Lightbulb className="w-4 h-4 text-amber-500" />
            }
            <span className="text-sm font-semibold text-slate-800">{item.title}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{item.description}</p>

          {item.url && (
            <div className="text-xs text-slate-400">
              Page: <span className="text-slate-600">{item.url}</span>
            </div>
          )}

          <div className="text-xs text-slate-400">
            Submitted: {new Date(item.createdAt).toLocaleString()}
            {item.userId && <span className="ml-3">User ID: {item.userId}</span>}
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)} className={selectCls}>
                {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Priority</label>
              <select value={priority ?? ''} onChange={(e) => setPriority((e.target.value || null) as Priority)} className={selectCls}>
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FeedbackType | ''>('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('new');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/feedback?${params}`);
      const data = await res.json();
      setItems(data.feedback ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [items, search]);

  function handleUpdate(id: string, patch: { status?: FeedbackStatus; priority?: Priority }) {
    setItems((prev) => prev.map((i) => i._id === id ? { ...i, ...patch } : i));
  }

  const bugCount = items.filter((i) => i.type === 'bug').length;
  const featureCount = items.filter((i) => i.type === 'feature').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Feedback Inbox</h1>
          <p className="text-sm text-slate-500 mt-0.5">User-submitted bug reports and feature requests</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: items.length, color: 'text-slate-700' },
          { label: 'Bug Reports', value: bugCount, color: 'text-red-600' },
          { label: 'Feature Requests', value: featureCount, color: 'text-blue-600' },
          { label: 'New', value: items.filter((i) => i.status === 'new').length, color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search feedback…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none w-52"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as FeedbackType | '')} className={selectCls}>
          <option value="">All Types</option>
          <option value="bug">Bug Reports</option>
          <option value="feature">Feature Requests</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | '')} className={selectCls}>
          <option value="">All Statuses</option>
          {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-sm text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <span className="text-sm">No feedback found</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Page</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Priority</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => setSelected(item)}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    {item.type === 'bug'
                      ? <Bug className="w-4 h-4 text-red-500" />
                      : <Lightbulb className="w-4 h-4 text-amber-500" />
                    }
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="font-medium text-slate-800 truncate block">{item.title}</span>
                    <span className="text-xs text-slate-400 truncate block">{item.description}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-400 text-xs max-w-[160px] truncate">
                    {item.url ?? '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><PriorityBadge priority={item.priority} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
