"use client";

import Link from "next/link";
import { Edit, FileBarChart, MoreVertical, Share2, Eye, Copy, Plus, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Form {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  slug: string;
  createdAt: string;
  responseCount?: number;
}

interface Props {
  forms: Form[];
  syncingCounts: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyLink: (id: string, slug: string) => void;
}

const TYPE_LABELS: Record<string, string> = { general: 'General', survey: 'Survey', quiz: 'Quiz', attendance: 'Attendance' };

function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-green-50 text-green-700"><CheckCircle size={10} />Published</span>;
  if (status === 'archived') return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-red-50 text-red-700"><XCircle size={10} />Archived</span>;
  return <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500">Draft</span>;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
}

function ActionMenu({ form, openMenuId, setOpenMenuId, onDelete, onPublish, onUnpublish, onDuplicate, onCopyLink }: { form: Form } & Pick<Props, 'openMenuId' | 'setOpenMenuId' | 'onDelete' | 'onPublish' | 'onUnpublish' | 'onDuplicate' | 'onCopyLink'>) {
  const isOpen = openMenuId === form._id;
  return (
    <div className="relative">
      <button onClick={() => setOpenMenuId(isOpen ? null : form._id)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
        <MoreVertical size={15} />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1">
          <button onClick={() => onCopyLink(form._id, form.slug)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50"><Share2 size={14} />Copy share link</button>
          <Link href={form.slug ? `/f/${form.slug}` : `/f/${form._id}`} target="_blank" className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50"><Eye size={14} />Preview</Link>
          <button onClick={() => onDuplicate(form._id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50"><Copy size={14} />Duplicate</button>
          <Link href="/dashboard/forms/create" className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50"><Plus size={14} />New Form</Link>
          {form.status !== 'published'
            ? <button onClick={() => onPublish(form._id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50"><CheckCircle size={14} />Publish</button>
            : <button onClick={() => onUnpublish(form._id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50"><XCircle size={14} />Unpublish</button>
          }
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button onClick={() => onDelete(form._id)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50"><Trash2 size={14} />Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormsTable({ forms, syncingCounts, openMenuId, setOpenMenuId, onDelete, onPublish, onUnpublish, onDuplicate, onCopyLink }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="min-w-full text-[13px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">#</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Form</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden sm:table-cell">Type</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Status</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden md:table-cell">Created</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                Responses
                {syncingCounts && <span className="animate-spin rounded-full h-2.5 w-2.5 border-b border-slate-400 inline-block" />}
              </span>
            </th>
            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wide text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {forms.map((form, idx) => (
            <tr key={form._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{form.title}</div>
                {form.description && <div className="text-[12px] text-slate-400 truncate max-w-xs">{form.description}</div>}
              </td>
              <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{TYPE_LABELS[form.type] ?? form.type}</td>
              <td className="px-4 py-3"><StatusBadge status={form.status} /></td>
              <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{formatDate(form.createdAt)}</td>
              <td className="px-4 py-3 font-medium text-slate-800 tabular-nums">{form.responseCount ?? 0}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/forms/${form._id}/edit`} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"><Edit size={15} /></Link>
                  <Link href={`/dashboard/forms/${form._id}/responses`} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"><FileBarChart size={15} /></Link>
                  <ActionMenu form={form} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onDelete={onDelete} onPublish={onPublish} onUnpublish={onUnpublish} onDuplicate={onDuplicate} onCopyLink={onCopyLink} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
