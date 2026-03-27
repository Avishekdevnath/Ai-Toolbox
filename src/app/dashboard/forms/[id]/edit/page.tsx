"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

import { FormField, FormSettings, FormType } from '@/types/forms';
import FormBuilderLayout from '@/components/forms/builder/FormBuilderLayout';
import BuilderCanvas from '@/components/forms/builder/BuilderCanvas';
import FormSettingsPanel from '@/components/forms/builder/FormSettingsPanel';

// ---------- helpers ----------

const createDefaultField = (type = 'short_text'): FormField => ({
  id: uuidv4(),
  label: '',
  type: type as FormField['type'],
  required: false,
  options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1'] : [],
  placeholder: '',
  helpText: '',
  quiz: { points: 1, correctOptions: [], explanation: '' },
});

type FormSettingsState = FormSettings;

const defaultFormSettings: FormSettingsState = {
  isPublic: true,
  allowMultipleSubmissions: true,
  allowAnonymous: false,
  identitySchema: { requireName: true, requireEmail: true, requireStudentId: false },
  startAt: null,
  endAt: null,
  timer: { enabled: false, minutes: 30 },
  displayMode: 'all',
};

const withFormSettingsDefaults = (settings?: Partial<FormSettingsState>): FormSettingsState => ({
  ...defaultFormSettings,
  ...settings,
  identitySchema: { ...defaultFormSettings.identitySchema, ...settings?.identitySchema },
  startAt: settings?.startAt ?? null,
  endAt: settings?.endAt ?? null,
  timer: { ...defaultFormSettings.timer, ...(settings?.timer || {}) },
  displayMode: settings?.displayMode ?? 'all',
});

// ---------- sub-components ----------

function RightPanel({
  formType, formId, formSlug, settings, hasQuizData,
  onTypeChange, onSlugChange, onSettingsChange,
}: {
  formType: FormType; formId: string; formSlug: string;
  settings: FormSettings; hasQuizData: boolean;
  onTypeChange: (t: FormType) => void;
  onSlugChange: (v: string) => void;
  onSettingsChange: (updates: Partial<FormSettings>) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-slate-200 shrink-0">
        <p className="text-[12px] font-semibold text-slate-600">Form Settings</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <FormSettingsPanel
          formId={formId}
          formType={formType}
          formSlug={formSlug}
          settings={settings}
          hasQuizData={hasQuizData}
          onTypeChange={onTypeChange}
          onSlugChange={onSlugChange}
          onSettingsChange={onSettingsChange}
        />
      </div>
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="min-h-full py-8 px-4">
      <div className="max-w-[680px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function CanvasError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-full py-8 px-4">
      <div className="max-w-[680px] mx-auto bg-white rounded-2xl border border-red-200 p-8 text-center">
        <p className="text-[15px] font-semibold text-slate-800 mb-1">Failed to load form</p>
        <p className="text-[13px] text-slate-400 mb-4">Check your connection and try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white text-[13px] rounded-lg hover:bg-blue-700">
            Retry
          </button>
          <a href="/dashboard/forms" className="px-4 py-2 text-[13px] text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            ← Back to Forms
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------- main page ----------

export default function FormEditor() {
  const params = useParams();
  const formId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<FormType>("general");
  const [formFields, setFormFields] = useState<FormField[]>([createDefaultField()]);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formSettings, setFormSettings] = useState<FormSettingsState>(defaultFormSettings);
  const [formStatus, setFormStatus] = useState("draft");
  const [formSlug, setFormSlug] = useState<string>("");

  const fetchFormData = async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const response = await fetch(`/api/forms/${formId}`);
      const result = await response.json();
      if (result.success && result.data) {
        const d = result.data;
        setFormTitle(d.title || "Untitled Form");
        setFormDescription(d.description || "");
        setFormType(d.type || "general");
        const normalizedFields: FormField[] = d.fields?.length > 0
          ? d.fields.map((f: any) => ({
              ...f,
              quiz: { points: f.quiz?.points ?? 1, correctOptions: f.quiz?.correctOptions ?? [], explanation: f.quiz?.explanation ?? '' },
            }))
          : [createDefaultField()];
        setFormFields(normalizedFields);
        setFormSettings(withFormSettingsDefaults(d.settings || {}));
        setFormStatus(d.status || "draft");
        setFormSlug(d.slug || "");
        if (d.fields?.length > 0) setActiveField(d.fields[0].id);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFormData(); }, [formId]);

  const addField = (type: FormField['type']) => {
    const f = createDefaultField(type);
    setFormFields(prev => {
      // Insert after the currently selected field, or append at end
      if (activeField) {
        const idx = prev.findIndex(field => field.id === activeField);
        if (idx !== -1) {
          const next = [...prev];
          next.splice(idx + 1, 0, f);
          return next;
        }
      }
      return [...prev, f];
    });
    setActiveField(f.id);
  };

  const deleteField = (id: string) => {
    if (formFields.length === 1) return;
    const next = formFields.filter(f => f.id !== id);
    setFormFields(next);
    if (activeField === id) setActiveField(next[0]?.id ?? null);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const duplicateField = (id: string) => {
    const src = formFields.find(f => f.id === id);
    if (!src) return;
    const dup = { ...src, id: uuidv4(), label: `${src.label} (Copy)` };
    const idx = formFields.findIndex(f => f.id === id);
    const next = [...formFields];
    next.splice(idx + 1, 0, dup);
    setFormFields(next);
    setActiveField(dup.id);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, description: formDescription, type: formType, fields: formFields, settings: formSettings, status: formStatus, slug: formSlug }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } catch (err: any) {
      console.error("Error saving form:", err);
      alert(err.message || "Failed to save form. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    const newStatus = formStatus === 'published' ? 'draft' : 'published';
    setFormStatus(newStatus);
    try {
      await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      setFormStatus(formStatus); // revert on error
    }
  };

  const handleTypeChange = (newType: FormType) => {
    setFormType(newType);
    if (newType !== 'quiz') {
      setFormFields(prev => prev.map(f => ({ ...f, quiz: { points: 1, correctOptions: [], explanation: '' } })));
    }
  };

  const hasQuizData = () => formFields.some(f => f.quiz.correctOptions.length > 0 || f.quiz.points !== 1);

  const centerPanelEl = loading ? <CanvasSkeleton /> : fetchError ? <CanvasError onRetry={fetchFormData} /> : (
    <BuilderCanvas
      formTitle={formTitle}
      formDescription={formDescription}
      formType={formType}
      fields={formFields}
      activeFieldId={activeField}
      onTitleChange={setFormTitle}
      onDescriptionChange={setFormDescription}
      onSelectField={setActiveField}
      onReorderFields={setFormFields}
      onDuplicateField={duplicateField}
      onDeleteField={deleteField}
      onAddField={(type) => addField(type ?? 'short_text')}
      onUpdateField={updateField}
    />
  );

  const rightPanelEl = (
    <RightPanel
      formType={formType}
      formId={formId}
      formSlug={formSlug}
      settings={formSettings}
      hasQuizData={hasQuizData()}
      onTypeChange={handleTypeChange}
      onSlugChange={(v: string) => setFormSlug(
        v.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
      )}
      onSettingsChange={(updates) => setFormSettings(prev => ({ ...prev, ...updates }))}
    />
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <FormBuilderLayout
        formId={formId}
        formSlug={formSlug}
        formTitle={formTitle}
        formType={formType}
        formStatus={formStatus}
        saving={saving}
        onTitleChange={setFormTitle}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
        centerPanel={centerPanelEl}
        rightPanel={rightPanelEl}
        mobileConfigPanel={rightPanelEl}
      />
    </div>
  );
}
