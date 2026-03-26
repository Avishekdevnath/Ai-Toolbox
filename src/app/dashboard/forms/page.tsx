"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileBarChart, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, FileText, FileEdit, MessageSquare } from "lucide-react";
import FormsTable from "@/components/dashboard/forms/FormsTable";
import { useFormsData } from "@/components/dashboard/forms/useFormsData";
import FormsStatChips from "@/components/forms/FormsStatChips";

export default function FormsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const {
    forms,
    loading,
    total,
    pageCount,
    error,
    notice,
    clearError,
    clearNotice,
    fetchForms,
    deleteForm,
    publishForm,
    unpublishForm,
    duplicateForm,
    copyShareLink,
  } = useFormsData({ searchTerm, statusFilter, typeFilter, page, pageSize });

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => clearNotice(), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notice, clearNotice]);

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Forms</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Create, manage and analyze your forms</p>
        </div>
        <Link href="/dashboard/forms/create" className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={15} /> Create Form
        </Link>
      </div>

      {!loading && (
        <FormsStatChips stats={[
          { icon: FileText, value: total, label: 'Total Forms' },
          { icon: CheckCircle2, value: forms.filter(f => f.status === 'published').length, label: 'Published' },
          { icon: FileEdit, value: forms.filter(f => f.status === 'draft').length, label: 'Drafts' },
          { icon: MessageSquare, value: forms.reduce((acc, f) => acc + (f.responseCount ?? 0), 0), label: 'Responses' },
        ]} />
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search forms..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="survey">Survey</option>
            <option value="quiz">Quiz</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center gap-2 text-[12px] text-emerald-800">
          <CheckCircle2 size={14} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-center justify-between gap-2 text-[12px] text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="text-[11px] font-medium px-2 py-1 rounded-md hover:bg-red-100">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-[13px] text-slate-500">Loading forms...</p>
          </div>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-blue-500" />
          </div>
          <h3 className="text-[15px] font-semibold text-slate-800 mb-1">
            {searchInput || statusFilter !== 'all' || typeFilter !== 'all' ? 'No results found' : 'No forms yet'}
          </h3>
          <p className="text-[13px] text-slate-400 mb-6 max-w-xs mx-auto">
            {searchInput || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first form to start collecting responses'}
          </p>
          {!searchInput && statusFilter === 'all' && typeFilter === 'all' && (
            <Link href="/dashboard/forms/create" className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Create Form
            </Link>
          )}
        </div>
      ) : (
        <>
          <FormsTable forms={forms} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} rowStartIndex={(page - 1) * pageSize}
          onDelete={deleteForm} onPublish={publishForm} onUnpublish={unpublishForm} onDuplicate={duplicateForm} onCopyLink={copyShareLink} />
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-slate-500">Showing <span className="font-semibold text-slate-700">{startItem}</span>–<span className="font-semibold text-slate-700">{endItem}</span> of <span className="font-semibold text-slate-700">{total}</span> forms</p>
            <div className="inline-flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-3 rounded-md border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-[12px] text-slate-600 min-w-20 text-center">Page {page} / {pageCount}</span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="h-8 px-3 rounded-md border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
