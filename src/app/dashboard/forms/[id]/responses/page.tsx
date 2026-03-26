"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, Search, Edit3, MessageSquare, BarChart,
  AlertCircle, Calendar, CheckCircle, FileDown, FileText, FileSpreadsheet,
  FileBarChart, Filter, Trash2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FormsStatChips from '@/components/forms/FormsStatChips';
import { getShareBaseUrl } from '@/utils/url';
import ResponseSlideOver from '@/components/forms/responses/ResponseSlideOver';

interface FormData {
  _id: string;
  title: string;
  description?: string;
  type?: string;
  fields: { id: string; label: string; type: string }[];
}

interface ResponseItem {
  _id: string;
  submittedAt?: string;
  createdAt?: string;
  identity?: { name?: string; email?: string; studentId?: string };
  data?: Record<string, any>;
  responses?: Record<string, any>;
  quizResult?: { score: number; maxScore: number };
}

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const today = new Date().toDateString();
  const todayCount = responses.filter(r => new Date(r.submittedAt ?? r.createdAt ?? '').toDateString() === today).length;
  const completionRate = totalResponses > 0 ? 100 : 0;

  const mapToSlideOver = (r: ResponseItem) => ({
    respondentName: r.identity?.name ?? undefined,
    respondentEmail: r.identity?.email ?? undefined,
    submittedAt: r.submittedAt ?? r.createdAt ?? new Date().toISOString(),
    fields: form?.fields?.map(f => ({
      label: f.label,
      answer: r.responses?.[f.id] ?? r.data?.[f.id] ?? '—',
    })) ?? [],
    isQuiz: form?.type === 'quiz',
    quizScore: r.quizResult?.score,
    quizMaxScore: r.quizResult?.maxScore,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [formRes, respRes] = await Promise.all([
        fetch(`/api/forms/${formId}`),
        fetch(`/api/forms/${formId}/responses?page=${page}&limit=${pageSize}`),
      ]);
      const formData = await formRes.json();
      const respData = await respRes.json();
      if (formData.success) setForm(formData.data);
      if (respData.success) {
        setResponses(respData.data?.items ?? []);
        setTotalResponses(respData.data?.total ?? 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [formId, page]);

  const exportResponses = async (format: string) => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const qs = new URLSearchParams({ export: format });
      if (selectedIds.length > 0) qs.set('selectedIds', JSON.stringify(selectedIds));
      const res = await fetch(`/api/forms/${formId}/responses?${qs}`);
      if (!res.ok) throw new Error('Export failed');
      if (format === 'pdf') {
        const data = await res.json();
        const w = window.open('', '_blank');
        if (w) { w.document.write(`<pre>${JSON.stringify(data.data, null, 2)}</pre>`); w.print(); }
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form?.title ?? 'responses'}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const deleteResponse = async (id: string) => {
    if (!confirm('Delete this response?')) return;
    try {
      await fetch(`/api/forms/${formId}/responses/${id}`, { method: 'DELETE' });
      setResponses(prev => prev.filter(r => r._id !== id));
      setTotalResponses(prev => prev - 1);
    } catch {
      alert('Failed to delete response.');
    }
  };

  const filteredResponses = responses.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.identity?.name?.toLowerCase().includes(q) ||
      r.identity?.email?.toLowerCase().includes(q) ||
      JSON.stringify(r.data ?? r.responses ?? {}).toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredResponses.length ? [] : filteredResponses.map(r => r._id));
  };

  if (error) return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle size={18} className="text-red-500 shrink-0" />
        <p className="text-[13px] text-red-700">{error}</p>
        <Link href="/dashboard/forms" className="ml-auto text-[13px] text-slate-600 hover:underline">← Forms</Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <Link href="/dashboard/forms" className="text-[12px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 mb-1">
          <ArrowLeft size={12} /> Forms
        </Link>
        <h1 className="text-[16px] font-semibold text-slate-800">{form?.title ?? 'Responses'}</h1>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { label: 'Edit', href: `/dashboard/forms/${formId}/edit`, icon: Edit3 },
          { label: 'Responses', href: `/dashboard/forms/${formId}/responses`, icon: MessageSquare, active: true },
          { label: 'Analytics', href: `/dashboard/forms/${formId}/analytics`, icon: BarChart },
        ].map(({ label, href, icon: Icon, active }) => (
          <Link key={label} href={href}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${(active as boolean | undefined) ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Icon size={13} /> {label}
          </Link>
        ))}
      </div>

      {/* Stats */}
      {!loading && (
        <FormsStatChips stats={[
          { icon: MessageSquare, value: totalResponses, label: 'Total' },
          { icon: Calendar, value: todayCount, label: 'Today' },
          { icon: CheckCircle, value: `${completionRate}%`, label: 'Completion Rate' },
        ]} />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowExportMenu(v => !v)}
            disabled={isExporting}
            className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={14} /> Export <Filter size={11} />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1">
              {[
                { label: 'Download CSV', icon: FileDown, format: 'csv' },
                { label: 'Download Excel', icon: FileSpreadsheet, format: 'excel' },
                { label: 'Generate PDF', icon: FileText, format: 'pdf' },
              ].map(({ label, icon: Icon, format }) => (
                <button key={format} onClick={() => exportResponses(format)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
            <span className="text-[13px] text-blue-700 font-medium">{selectedIds.length} selected</span>
            <button onClick={() => exportResponses('csv')}
              className="ml-auto flex items-center gap-1.5 text-[13px] text-blue-700 hover:text-blue-900">
              <FileBarChart size={13} /> Export selected
            </button>
            <button onClick={() => setSelectedIds([])} className="text-[13px] text-slate-500 hover:text-slate-700">Clear</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="w-4 h-4 bg-slate-200 rounded" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-3 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-slate-400" />
            </div>
            <h3 className="text-[14px] font-semibold text-slate-700 mb-1">
              {searchTerm ? 'No results found' : 'No responses yet'}
            </h3>
            <p className="text-[13px] text-slate-400 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Share your form to start collecting responses'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  const origin = getShareBaseUrl();
                  navigator.clipboard.writeText(`${origin}/f/${formId}`);
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600 text-white text-[13px] rounded-lg hover:bg-blue-700"
              >
                Copy share link
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" checked={selectedIds.length === filteredResponses.length && filteredResponses.length > 0}
                    onChange={toggleSelectAll} className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Respondent</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden sm:table-cell">Submitted</th>
                {form?.type === 'quiz' && (
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden md:table-cell">Score</th>
                )}
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wide text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResponses.map(r => {
                const name = r.identity?.name;
                const email = r.identity?.email;
                const date = new Date(r.submittedAt ?? r.createdAt ?? '');
                const isSelected = selectedIds.includes(r._id);
                return (
                  <tr key={r._id}
                    onClick={() => setSelectedResponse(r)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected}
                        onChange={() => setSelectedIds(prev => isSelected ? prev.filter(i => i !== r._id) : [...prev, r._id])}
                        className="rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{name ?? 'Anonymous'}</p>
                      {email && <p className="text-[11px] text-slate-400">{email}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {form?.type === 'quiz' && (
                      <td className="px-4 py-3 hidden md:table-cell">
                        {r.quizResult ? (
                          <span className="font-medium text-slate-800">{r.quizResult.score}/{r.quizResult.maxScore}</span>
                        ) : '—'}
                      </td>
                    )}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => deleteResponse(r._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalResponses > pageSize && (
        <div className="flex items-center justify-between text-[13px] text-slate-500">
          <span>Showing {Math.min((page - 1) * pageSize + 1, totalResponses)}–{Math.min(page * pageSize, totalResponses)} of {totalResponses}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 px-3 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= totalResponses}
              className="h-8 px-3 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      )}

      {/* Slide-over */}
      <ResponseSlideOver
        open={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
        {...(selectedResponse ? mapToSlideOver(selectedResponse) : {
          submittedAt: '', fields: [],
        })}
      />
    </div>
  );
}
