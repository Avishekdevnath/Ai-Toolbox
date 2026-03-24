"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileBarChart } from "lucide-react";
import FormsTable from "@/components/dashboard/forms/FormsTable";
import { useFormsData } from "@/components/dashboard/forms/useFormsData";

export default function FormsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { forms, loading, syncingCounts, fetchForms, deleteForm, publishForm, unpublishForm, duplicateForm, copyShareLink } =
    useFormsData({ searchTerm, statusFilter, typeFilter });

  useEffect(() => { fetchForms(); }, [searchTerm, statusFilter, typeFilter]);

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

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search forms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
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

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-[13px] text-slate-500">Loading forms...</p>
          </div>
        </div>
      ) : forms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileBarChart size={22} className="text-blue-600" />
          </div>
          <h3 className="text-[13px] font-semibold text-slate-800 mb-1">No forms found</h3>
          <p className="text-[12px] text-slate-400 mb-5">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? "Try adjusting your search or filters" : "Get started by creating your first form"}
          </p>
          <Link href="/dashboard/forms/create" className="inline-flex items-center gap-1.5 h-9 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Create Form
          </Link>
        </div>
      ) : (
        <FormsTable forms={forms} syncingCounts={syncingCounts} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId}
          onDelete={deleteForm} onPublish={publishForm} onUnpublish={unpublishForm} onDuplicate={duplicateForm} onCopyLink={copyShareLink} />
      )}
    </div>
  );
}
