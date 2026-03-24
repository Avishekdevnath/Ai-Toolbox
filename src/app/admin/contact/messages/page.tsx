'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Eye, Archive, CheckCircle2, RefreshCw, Reply, X } from 'lucide-react';

type Status = 'new' | 'read' | 'archived';
interface ContactMessage { _id: string; name: string; email: string; phone?: string; subject: string; message: string; status: Status; createdAt: string; }

const statusBadge = (s: Status) => {
  const map = { new: 'bg-blue-50 text-blue-700', read: 'bg-slate-100 text-slate-500', archived: 'bg-amber-50 text-amber-600' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[s]}`}>{s}</span>;
};

const selectCls = 'border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none';

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<Status | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = status ? `/api/contact/messages?status=${status}` : '/api/contact/messages';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) { const data = await res.json(); setMessages(data?.data || []); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q));
  }, [messages, search]);

  const setStatusFor = async (id: string, ns: Status) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/contact/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: ns }) });
      if (res.ok) setMessages(prev => prev.map(m => m._id === id ? { ...m, status: ns } : m));
    } finally { setUpdatingId(null); }
  };

  const stats = useMemo(() => ({
    total: messages.length,
    newCount: messages.filter(m => m.status === 'new').length,
    readCount: messages.filter(m => m.status === 'read').length,
    archivedCount: messages.filter(m => m.status === 'archived').length,
  }), [messages]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Contact Messages</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">View and manage incoming contact form submissions</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Mail, color: 'text-slate-700' },
          { label: 'New', value: stats.newCount, icon: Mail, color: 'text-blue-600' },
          { label: 'Read', value: stats.readCount, icon: CheckCircle2, color: 'text-slate-500' },
          { label: 'Archived', value: stats.archivedCount, icon: Archive, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{label}</p>
              <p className={`text-2xl font-bold tabular-nums mt-1 ${color}`}>{value}</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg"><Icon className="w-4 h-4 text-orange-400" /></div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <select value={status} onChange={e => setStatus(e.target.value as Status | '')} className={selectCls}>
            <option value="">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none w-full sm:w-56" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Date', 'From', 'Subject', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wide text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                    {new Date(m.createdAt).toLocaleDateString()}
                    <div className="text-[11px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{m.name}</div>
                    <div className="text-slate-400">{m.email}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-700">{m.subject}</div>
                    <div className="text-slate-400 line-clamp-1">{m.message.length > 80 ? m.message.slice(0, 80) + '...' : m.message}</div>
                  </td>
                  <td className="py-3 px-4">{statusBadge(m.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setSelected(m)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"><Eye className="w-3 h-3" /> View</button>
                      {m.status === 'new' && <button onClick={() => setStatusFor(m._id, 'read')} disabled={updatingId === m._id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"><CheckCircle2 className="w-3 h-3" /> Read</button>}
                      <button onClick={() => setStatusFor(m._id, 'archived')} disabled={updatingId === m._id} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"><Archive className="w-3 h-3" /> Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-[13px] text-slate-400">No messages found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-semibold text-slate-800">Message Details</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">From</p><p className="text-[13px] font-medium text-slate-800">{selected.name}</p><p className="text-[13px] text-slate-500">{selected.email}</p>{selected.phone && <p className="text-[13px] text-slate-500">{selected.phone}</p>}</div>
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">Subject</p><p className="text-[13px] font-medium text-slate-800">{selected.subject}</p></div>
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">Message</p><div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[13px] text-slate-700 whitespace-pre-wrap">{selected.message}</div></div>
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">Received</p><p className="text-[13px] text-slate-600">{new Date(selected.createdAt).toLocaleString()}</p></div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject}`)} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors"><Reply className="w-3.5 h-3.5" /> Reply</button>
              {selected.status === 'new' && <button onClick={() => { setStatusFor(selected._id, 'read'); setSelected(null); }} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3 py-2 rounded-lg transition-colors"><CheckCircle2 className="w-3.5 h-3.5" /> Mark Read</button>}
              <button onClick={() => { setStatusFor(selected._id, 'archived'); setSelected(null); }} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors"><Archive className="w-3.5 h-3.5" /> Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
