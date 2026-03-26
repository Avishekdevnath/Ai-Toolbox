"use client";
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { FormSettings, FormType, DisplayMode } from '@/types/forms';
import { getShareBaseUrl } from '@/utils/url';

interface FormSettingsPanelProps {
  formId: string;
  formType: FormType;
  formSlug: string;
  settings: FormSettings;
  hasQuizData: boolean;
  onTypeChange: (type: FormType) => void;
  onSlugChange: (v: string) => void;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}

const getFormBaseUrl = () => getShareBaseUrl();

export default function FormSettingsPanel({
  formId, formType, formSlug,
  settings, hasQuizData,
  onTypeChange, onSlugChange, onSettingsChange,
}: FormSettingsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [showTypeConfirm, setShowTypeConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<FormType | null>(null);

  const shareUrl = `${getFormBaseUrl()}/f/${formSlug || formId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTypeChange = (newType: FormType) => {
    if (formType === 'quiz' && hasQuizData && newType !== 'quiz') {
      setPendingType(newType);
      setShowTypeConfirm(true);
    } else {
      onTypeChange(newType);
    }
  };

  const confirmTypeChange = () => {
    if (pendingType) onTypeChange(pendingType);
    setShowTypeConfirm(false);
    setPendingType(null);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${value ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="p-4 space-y-5 text-[13px]">
      {/* Type confirmation dialog */}
      {showTypeConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-slate-800 mb-1">Switch form type?</h3>
            <p className="text-[13px] text-slate-500 mb-4">Switching away from Quiz will clear all quiz settings. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowTypeConfirm(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={confirmTypeChange} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Type */}
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Form Type</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(['general', 'survey', 'quiz', 'attendance'] as FormType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`py-2 px-3 rounded-lg border text-[12px] font-medium capitalize transition-colors ${
                formType === t
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Submissions */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Submissions</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 font-medium">Multiple Submissions</p>
              <p className="text-[11px] text-slate-400">Allow same person to submit more than once</p>
            </div>
            <Toggle
              value={settings.allowMultipleSubmissions}
              onChange={() => onSettingsChange({ allowMultipleSubmissions: !settings.allowMultipleSubmissions })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 font-medium">Anonymous</p>
              <p className="text-[11px] text-slate-400">No identity required</p>
            </div>
            <Toggle
              value={settings.allowAnonymous}
              onChange={() => onSettingsChange({ allowAnonymous: !settings.allowAnonymous })}
            />
          </div>
        </div>
      </section>

      {/* Identity Gate */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Collect Identity</p>
        <div className="space-y-2">
          {([
            { key: 'requireName', label: 'Name' },
            { key: 'requireEmail', label: 'Email' },
            { key: 'requireStudentId', label: 'Student ID' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700">{label}</span>
              <Toggle
                value={settings.identitySchema[key]}
                onChange={() => onSettingsChange({ identitySchema: { ...settings.identitySchema, [key]: !settings.identitySchema[key] } })}
              />
            </label>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Schedule</p>
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-slate-500">Opens</label>
            <input type="datetime-local" value={settings.startAt ?? ''} onChange={(e) => onSettingsChange({ startAt: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="text-[11px] text-slate-500">Closes</label>
            <input type="datetime-local" value={settings.endAt ?? ''} onChange={(e) => onSettingsChange({ endAt: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>
      </section>

      {/* Slug */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Custom Slug</p>
        <input value={formSlug} onChange={(e) => onSlugChange(e.target.value)}
          placeholder="my-form-slug"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </section>

      {/* Display Mode */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Display Mode</p>
        <div className="space-y-1.5">
          {([
            { value: 'all', label: 'All on one page' },
            { value: 'paginated', label: 'Paginated sections' },
            { value: 'one-at-a-time', label: 'One at a time', comingSoon: true },
          ] as { value: DisplayMode; label: string; comingSoon?: boolean }[]).map((mode) => (
            <label
              key={mode.value}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                settings.displayMode === mode.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
              } ${mode.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="displayMode"
                value={mode.value}
                checked={settings.displayMode === mode.value}
                disabled={mode.comingSoon}
                onChange={() => !mode.comingSoon && onSettingsChange({ displayMode: mode.value })}
                className="accent-blue-600"
              />
              <span className="text-[13px] text-slate-700">{mode.label}</span>
              {mode.comingSoon && <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Soon</span>}
            </label>
          ))}
        </div>
      </section>

      {/* Share */}
      <section className="border-t border-slate-100 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Share Link</p>
        <div className="flex gap-2">
          <input readOnly value={shareUrl} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-500 bg-slate-50 font-mono truncate min-w-0" />
          <button onClick={handleCopy} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>
    </div>
  );
}
