"use client";
import { ReactNode, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Link2, Save, Loader2, MoreHorizontal } from 'lucide-react';
import { FormType } from '@/types/forms';

interface FormBuilderLayoutProps {
  formId: string;
  formSlug?: string;
  formTitle: string;
  formType: FormType;
  formStatus: string;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublishToggle: () => void;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
  mobileConfigPanel: ReactNode;
}

const TYPE_BADGE: Record<string, string> = {
  general: 'bg-slate-100 text-slate-600',
  survey: 'bg-purple-50 text-purple-700',
  quiz: 'bg-orange-50 text-orange-700',
  attendance: 'bg-green-50 text-green-700',
};

type MobileTab = 'canvas' | 'fields' | 'config';

export default function FormBuilderLayout({
  formId, formSlug, formTitle, formType, formStatus, saving,
  onTitleChange, onSave, onPublishToggle,
  centerPanel, rightPanel, mobileConfigPanel,
}: FormBuilderLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [mobileMenuOpen]);
  const liveFormHref = formSlug ? `/f/${formSlug}` : `/f/${formId}`;

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 shrink-0 flex-wrap gap-y-2">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link href="/dashboard/forms" className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <input
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="font-semibold text-slate-800 text-[15px] bg-transparent border-none outline-none focus:ring-0 truncate min-w-0 flex-1"
            placeholder="Untitled Form"
          />
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_BADGE[formType] ?? 'bg-slate-100 text-slate-600'}`}>
            {formType}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/f/${formId}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-[13px] text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Eye size={13} /> Preview
          </Link>
          <Link
            href={liveFormHref}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-[13px] text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Open live form"
          >
            <Link2 size={13} /> Live
          </Link>
          <button
            onClick={onPublishToggle}
            className="hidden sm:inline-flex h-8 px-3 text-[13px] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
          >
            {formStatus === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 transition-colors"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
          <div className="relative md:hidden">
            <button onClick={() => setMobileMenuOpen((s) => !s)} className="p-1.5 text-slate-500 hover:text-slate-700">
              <MoreHorizontal size={18} />
            </button>
            {mobileMenuOpen && (
              <div ref={menuRef} className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                <a href={`/f/${formId}`} target="_blank" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Preview</a>
                <a href={liveFormHref} target="_blank" className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Live</a>
                <button onClick={() => { onPublishToggle(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  {formStatus === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-panel body (desktop) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center panel */}
        <div className={`flex-1 overflow-y-auto bg-slate-50 ${mobileTab !== 'canvas' ? 'hidden md:block' : ''}`}>
          {centerPanel}
        </div>

        {/* Right panel (desktop) */}
        <div className="hidden md:flex flex-col w-[360px] shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
          {rightPanel}
        </div>

        {/* Mobile: fields / config panel */}
        {mobileTab !== 'canvas' && (
          <div className="flex-1 overflow-y-auto bg-white md:hidden">
            {mobileConfigPanel}
          </div>
        )}
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden flex border-t border-slate-200 bg-white shrink-0" style={{ height: 48 }}>
        {(['canvas', 'fields', 'config'] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 text-[12px] font-medium capitalize transition-colors ${
              mobileTab === tab ? 'text-blue-600 border-t-2 border-blue-600' : 'text-slate-500'
            }`}
          >
            {tab === 'config' ? 'Settings' : tab === 'fields' ? 'Fields' : 'Canvas'}
          </button>
        ))}
      </div>
    </div>
  );
}
