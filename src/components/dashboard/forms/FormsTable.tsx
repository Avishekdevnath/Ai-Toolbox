"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, MoreVertical, Share2, Eye, Copy, CheckCircle, XCircle, Trash2, BarChart3 } from "lucide-react";
import { getShareBaseUrl } from "@/utils/url";

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
  openMenuId: string | null;
  rowStartIndex?: number;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyLink: (id: string, slug: string, shareUrl?: string) => void;
}

const getFormShareBase = () => getShareBaseUrl();

const TYPE_LABELS: Record<string, string> = {
  general: 'General', survey: 'Survey', quiz: 'Quiz', attendance: 'Attendance',
};

const TYPE_BADGE_STYLES: Record<string, string> = {
  general: 'bg-slate-100 text-slate-600',
  survey: 'bg-purple-50 text-purple-700',
  quiz: 'bg-orange-50 text-orange-700',
  attendance: 'bg-green-50 text-green-700',
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'published') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700">
      <CheckCircle size={10} />Published
    </span>
  );
  if (status === 'archived') return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500">
      <XCircle size={10} />Archived
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-yellow-50 text-yellow-700">
      Draft
    </span>
  );
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
}

// ── Portal-based dropdown ────────────────────────────────────────────────────

function ActionMenu({ form, openMenuId, setOpenMenuId, onDelete, onPublish, onUnpublish, onDuplicate, onCopyLink }: { form: Form } & Pick<Props, 'openMenuId' | 'setOpenMenuId' | 'onDelete' | 'onPublish' | 'onUnpublish' | 'onDuplicate' | 'onCopyLink'>) {
  const isOpen = openMenuId === form._id;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, openUp: false });

  const close = useCallback(() => setOpenMenuId(null), [setOpenMenuId]);

  // Position the portal dropdown relative to the trigger button
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 280; // approximate max height of dropdown
    const openUp = rect.bottom + menuHeight > window.innerHeight;
    setPos({
      top: openUp ? rect.top : rect.bottom + 4,
      left: rect.right - 208, // 208 = w-52 = 13rem
      openUp,
    });
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const itemCls = "w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors";

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : form._id); }}
        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
        aria-label="More actions"
      >
        <MoreVertical size={15} />
      </button>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 animate-in fade-in duration-150"
          style={{
            top: pos.openUp ? undefined : pos.top,
            bottom: pos.openUp ? window.innerHeight - pos.top + 4 : undefined,
            left: Math.max(8, pos.left),
          }}
        >
          {(() => {
            const baseUrl = getFormShareBase();
            const sharePath = form.slug ? `f/${form.slug}` : `f/${form._id}`;
            const shareUrl = baseUrl ? `${baseUrl}/${sharePath}` : `/${sharePath}`;
            return (
              <>
                <button onClick={() => { onCopyLink(form._id, form.slug, shareUrl); close(); }} className={itemCls}><Share2 size={14} />Copy share link</button>
                <Link href={shareUrl} target="_blank" onClick={close} className={itemCls}><Eye size={14} />Preview</Link>
              </>
            );
          })()}
          <button onClick={() => { onDuplicate(form._id); close(); }} className={itemCls}><Copy size={14} />Duplicate</button>
          {form.status !== 'published'
            ? <button onClick={() => { onPublish(form._id); close(); }} className={itemCls}><CheckCircle size={14} />Publish</button>
            : <button onClick={() => { onUnpublish(form._id); close(); }} className={itemCls}><XCircle size={14} />Unpublish</button>
          }
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button onClick={() => { onDelete(form._id); close(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} />Delete</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────

export default function FormsTable({ forms, openMenuId, rowStartIndex = 0, setOpenMenuId, onDelete, onPublish, onUnpublish, onDuplicate, onCopyLink }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Desktop / tablet: table */}
      <div className="hidden sm:block">
        <table className="min-w-full text-[13px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium w-10">#</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Form</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden sm:table-cell">Type</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Status</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium hidden md:table-cell">Created</th>
            <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-slate-400 font-medium">Responses</th>
            <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wide text-slate-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {forms.map((form, idx) => (
            <tr
              key={form._id}
              onClick={() => router.push(`/dashboard/forms/${form._id}/edit`)}
              className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
            >
              <td className="px-4 py-3 text-slate-400">{rowStartIndex + idx + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{form.title}</div>
                {form.description && <div className="text-[12px] text-slate-400 truncate max-w-xs">{form.description}</div>}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_BADGE_STYLES[form.type] ?? 'bg-slate-100 text-slate-600'}`}>
                  {TYPE_LABELS[form.type] ?? form.type}
                </span>
              </td>
              <td className="px-4 py-3"><StatusBadge status={form.status} /></td>
              <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{formatDate(form.createdAt)}</td>
              <td className="px-4 py-3 font-medium text-slate-800 tabular-nums">{form.responseCount ?? 0}</td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/forms/${form._id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Edit">
                    <Edit size={15} />
                  </Link>
                  <Link href={`/dashboard/forms/${form._id}/responses`} className="p-1.5 text-slate-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors" title="Responses">
                    <BarChart3 size={15} />
                  </Link>
                  <ActionMenu form={form} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onDelete={onDelete} onPublish={onPublish} onUnpublish={onUnpublish} onDuplicate={onDuplicate} onCopyLink={onCopyLink} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="block sm:hidden">
        <div className="divide-y divide-slate-100">
          {forms.map((form, idx) => (
            <div
              key={form._id}
              onClick={() => router.push(`/dashboard/forms/${form._id}/edit`)}
              className="p-3 hover:bg-blue-50/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-slate-400 text-sm">{rowStartIndex + idx + 1}.</div>
                    <div className="font-medium text-slate-800 truncate">{form.title}</div>
                  </div>
                  {form.description && <div className="text-[12px] text-slate-400 mt-1 truncate">{form.description}</div>}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${TYPE_BADGE_STYLES[form.type] ?? 'bg-slate-100 text-slate-600'}`}>{TYPE_LABELS[form.type] ?? form.type}</span>
                    <div><StatusBadge status={form.status} /></div>
                    <div className="text-[12px] text-slate-500">{formatDate(form.createdAt)}</div>
                    <div className="text-[12px] font-medium text-slate-800 tabular-nums">{form.responseCount ?? 0} responses</div>
                  </div>
                </div>
                <div className="flex items-start gap-1" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/dashboard/forms/${form._id}/edit`} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Edit">
                    <Edit size={16} />
                  </Link>
                  <Link href={`/dashboard/forms/${form._id}/responses`} className="p-1.5 text-slate-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors" title="Responses">
                    <BarChart3 size={16} />
                  </Link>
                  <ActionMenu form={form} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onDelete={onDelete} onPublish={onPublish} onUnpublish={onUnpublish} onDuplicate={onDuplicate} onCopyLink={onCopyLink} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
