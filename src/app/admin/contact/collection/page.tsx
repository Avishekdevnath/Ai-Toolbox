'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Database, Mail, Phone, RefreshCw, Download, Eye, X } from 'lucide-react';

interface ContactSubmission {
  _id: string; name: string; email: string; phone?: string;
  source: 'contact_form' | 'newsletter' | 'other'; submittedAt: string;
  metadata?: { userAgent?: string; ipAddress?: string; referrer?: string };
}

const sourceBadge = (source: string) => {
  const map: Record<string, string> = { contact_form: 'bg-blue-50 text-blue-700', newsletter: 'bg-green-50 text-green-700', other: 'bg-slate-100 text-slate-500' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[source] || 'bg-slate-100 text-slate-500'}`}>{source.replace('_', ' ')}</span>;
};

export default function ContactCollectionPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/collection', { cache: 'no-store' });
      if (res.ok) { const data = await res.json(); setSubmissions(data?.data || []); }
    } catch (e) { console.error('Failed to load submissions:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSubmissions(); }, []);

  const filtered = useMemo(() => {
    let f = submissions;
    if (search.trim()) { const q = search.toLowerCase(); f = f.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone && s.phone.toLowerCase().includes(q))); }
    if (sourceFilter) f = f.filter(s => s.source === sourceFilter);
    return f;
  }, [submissions, search, sourceFilter]);

  const stats = useMemo(() => ({
    total: submissions.length,
    withEmail: submissions.filter(s => s.email).length,
    withPhone: submissions.filter(s => s.phone).length,
    fromContactForm: submissions.filter(s => s.source === 'contact_form').length,
    fromNewsletter: submissions.filter(s => s.source === 'newsletter').length,
  }), [submissions]);

  const exportCSV = () => {
    const csv = [['Name', 'Email', 'Phone', 'Source', 'Submitted At'].join(','), ...filtered.map(s => [`"${s.name}"`, `"${s.email}"`, `"${s.phone || ''}"`, `"${s.source}"`, `"${new Date(s.submittedAt).toLocaleString()}"`].join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `contact-collection-${new Date().toISOString().split('T')[0]}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Contact Collection</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Browse and export collected contact submissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSubmissions} disabled={loading} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={exportCSV} disabled={filtered.length === 0} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Database, color: 'text-slate-700' },
          { label: 'With Email', value: stats.withEmail, icon: Mail, color: 'text-blue-600' },
          { label: 'With Phone', value: stats.withPhone, icon: Phone, color: 'text-green-600' },
          { label: 'Contact Form', value: stats.fromContactForm, icon: Mail, color: 'text-violet-600' },
          { label: 'Newsletter', value: stats.fromNewsletter, icon: Database, color: 'text-orange-500' },
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
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none">
            <option value="">All Sources</option>
            <option value="contact_form">Contact Form</option>
            <option value="newsletter">Newsletter</option>
            <option value="other">Other</option>
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..." className="border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none w-full sm:w-64" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Phone', 'Source', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wide text-slate-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors align-top">
                  <td className="py-3 px-4 font-medium text-slate-800">{s.name}</td>
                  <td className="py-3 px-4"><a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">{s.email}</a></td>
                  <td className="py-3 px-4">{s.phone ? <a href={`tel:${s.phone}`} className="text-green-600 hover:underline">{s.phone}</a> : <span className="text-slate-300">—</span>}</td>
                  <td className="py-3 px-4">{sourceBadge(s.source)}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{new Date(s.submittedAt).toLocaleDateString()}<div className="text-[11px] text-slate-400">{new Date(s.submittedAt).toLocaleTimeString()}</div></td>
                  <td className="py-3 px-4"><button onClick={() => setSelected(s)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"><Eye className="w-3 h-3" /> Details</button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-[13px] text-slate-400">No submissions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-semibold text-slate-800">Submission Details</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              {[{ label: 'Name', value: selected.name }, { label: 'Email', value: selected.email, href: `mailto:${selected.email}` }, ...(selected.phone ? [{ label: 'Phone', value: selected.phone, href: `tel:${selected.phone}` }] : []), { label: 'Submitted', value: new Date(selected.submittedAt).toLocaleString() }].map(({ label, value, href }: any) => (
                <div key={label}>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">{label}</p>
                  {href ? <a href={href} className="text-[13px] text-blue-600 hover:underline">{value}</a> : <p className="text-[13px] text-slate-700">{value}</p>}
                </div>
              ))}
              <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-0.5">Source</p>{sourceBadge(selected.source)}</div>
              {selected.metadata && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-1">Metadata</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[12px] text-slate-600 space-y-1">
                    {selected.metadata.userAgent && <p><strong>User Agent:</strong> {selected.metadata.userAgent}</p>}
                    {selected.metadata.ipAddress && <p><strong>IP:</strong> {selected.metadata.ipAddress}</p>}
                    {selected.metadata.referrer && <p><strong>Referrer:</strong> {selected.metadata.referrer}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => window.open(`mailto:${selected.email}`)} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors"><Mail className="w-3.5 h-3.5" /> Email</button>
              {selected.phone && <button onClick={() => window.open(`tel:${selected.phone}`)} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors"><Phone className="w-3.5 h-3.5" /> Call</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
