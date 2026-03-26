"use client";
import { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  GripVertical, Copy, Trash2, Plus, ChevronDown, ChevronUp,
  Type, AlignLeft, Hash, Mail, Calendar, Clock, Circle, CheckSquare, Minus,
} from 'lucide-react';
import { FormField, FormType } from '@/types/forms';
import FieldPreview from './FieldPreview';

const FIELD_TYPE_OPTIONS: { value: FormField['type']; label: string; icon: React.ElementType }[] = [
  { value: 'short_text', label: 'Short Text', icon: Type },
  { value: 'long_text', label: 'Paragraph', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'time', label: 'Time', icon: Clock },
  { value: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { value: 'radio', label: 'Multiple Choice', icon: Circle },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { value: 'section', label: 'Section Break', icon: Minus },
];

interface BuilderCanvasProps {
  formTitle: string;
  formDescription: string;
  formType: FormType;
  fields: FormField[];
  activeFieldId: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSelectField: (id: string) => void;
  onReorderFields: (fields: FormField[]) => void;
  onDuplicateField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onAddField: (type?: FormField['type']) => void;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
}

function FieldInlineEditor({
  field, formType, onUpdate,
}: {
  field: FormField;
  formType: FormType;
  onUpdate: (updates: Partial<FormField>) => void;
}) {
  const isSection = field.type === 'section';
  const isChoice = ['dropdown', 'radio', 'checkbox'].includes(field.type);
  const isQuiz = formType === 'quiz';
  const hasPlaceholder = !isSection && !isChoice && field.type !== 'date' && field.type !== 'time';

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3" onClick={(e) => e.stopPropagation()}>
      {/* Type selector */}
      <div>
        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Field Type</label>
        <div className="mt-1 relative">
          <select
            value={field.type}
            onChange={(e) => {
              const newType = e.target.value as FormField['type'];
              const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(newType);
              const hadOptions = ['dropdown', 'radio', 'checkbox'].includes(field.type);
              onUpdate({
                type: newType,
                options: needsOptions && !hadOptions ? ['Option 1'] : hadOptions && !needsOptions ? [] : field.options,
                required: newType === 'section' ? false : field.required,
              });
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none pr-8"
          >
            {FIELD_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Placeholder */}
      {hasPlaceholder && (
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Placeholder</label>
          <input
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Placeholder text"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      )}

      {/* Word limit — long_text only */}
      {field.type === 'long_text' && (
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Word Limit</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={5000}
              value={field.wordLimit ?? ''}
              onChange={(e) => onUpdate({ wordLimit: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="No limit"
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-[12px] text-slate-400">words</span>
            {field.wordLimit && (
              <button
                onClick={() => onUpdate({ wordLimit: undefined })}
                className="text-[12px] text-slate-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* Options editor */}
      {isChoice && (
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Options</label>
          <div className="mt-1.5 space-y-1.5">
            {field.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={opt}
                  onChange={(e) => {
                    const opts = [...field.options];
                    opts[idx] = e.target.value;
                    onUpdate({ options: opts });
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={`Option ${idx + 1}`}
                />
                {field.options.length > 1 && (
                  <button
                    onClick={() => onUpdate({ options: field.options.filter((_, i) => i !== idx) })}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => onUpdate({ options: [...field.options, `Option ${field.options.length + 1}`] })}
              className="flex items-center gap-1.5 text-[13px] text-blue-600 hover:text-blue-700 mt-0.5"
            >
              <Plus size={13} /> Add option
            </button>
          </div>
        </div>
      )}

      {/* Required toggle */}
      {!isSection && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-[13px] font-medium text-slate-700">Required</p>
          <button
            type="button"
            onClick={() => onUpdate({ required: !field.required })}
            className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${field.required ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-[18px]' : 'translate-x-0'}`} />
          </button>
        </div>
      )}

      {/* Quiz config */}
      {isQuiz && !isSection && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">Quiz Settings</p>
          <div className="flex items-center gap-3">
            <label className="text-[12px] text-slate-500 flex-1">Points</label>
            <input
              type="number"
              min={0}
              value={field.quiz.points}
              onChange={(e) => onUpdate({ quiz: { ...field.quiz, points: Number(e.target.value) } })}
              className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {isChoice && (
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Correct Answer(s)</label>
              <div className="mt-1.5 space-y-1">
                {field.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
                    <input
                      type={field.type === 'checkbox' ? 'checkbox' : 'radio'}
                      checked={field.quiz.correctOptions.includes(opt)}
                      onChange={() => {
                        const current = field.quiz.correctOptions;
                        const next = field.type === 'checkbox'
                          ? current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt]
                          : [opt];
                        onUpdate({ quiz: { ...field.quiz, correctOptions: next } });
                      }}
                      className="rounded"
                    />
                    {opt || `Option ${idx + 1}`}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Explanation</label>
            <textarea
              value={field.quiz.explanation}
              onChange={(e) => onUpdate({ quiz: { ...field.quiz, explanation: e.target.value } })}
              placeholder="Shown to respondent after submission"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}

const MAX_DESC_WORDS = 500;

function countWords(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

function AutoResizeTextarea({
  value, onChange, placeholder, className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  const wordCount = countWords(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    if (countWords(newVal) <= MAX_DESC_WORDS) {
      onChange(newVal);
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
        className={className}
        style={{ overflow: 'hidden', resize: 'none' }}
      />
      <div className="flex justify-end mt-1">
        <span className={`text-[11px] ${wordCount >= MAX_DESC_WORDS ? 'text-red-400' : 'text-slate-300'}`}>
          {wordCount}/{MAX_DESC_WORDS} words
        </span>
      </div>
    </div>
  );
}

export default function BuilderCanvas({
  formTitle, formDescription, formType, fields, activeFieldId,
  onTitleChange, onDescriptionChange, onSelectField,
  onReorderFields, onDuplicateField, onDeleteField, onAddField, onUpdateField,
}: BuilderCanvasProps) {
  const [descExpanded, setDescExpanded] = useState(true);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(fields);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorderFields(reordered);
  };

  return (
    <div className="min-h-full py-8 px-4">
      <div className="max-w-[680px] mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Form header — sticky */}
        <div className="sticky top-0 z-10 p-5 border-b border-slate-100 bg-white">
          <input
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Form title"
            className="w-full text-xl font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300"
          />
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setDescExpanded(v => !v)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors mb-1.5"
            >
              {descExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {descExpanded ? 'Hide description' : (formDescription ? 'Edit description' : 'Add description')}
            </button>
            {descExpanded && (
              <AutoResizeTextarea
                value={formDescription}
                onChange={onDescriptionChange}
                placeholder="What is this form about? (optional)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[14px] text-slate-600 leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300"
              />
            )}
            {!descExpanded && formDescription && (
              <p className="text-[13px] text-slate-500 whitespace-pre-wrap line-clamp-3">{formDescription}</p>
            )}
          </div>
        </div>

        {/* Fields */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="canvas-fields">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-slate-100">
                {fields.map((field, index) => {
                  const isActive = field.id === activeFieldId;
                  const isSection = field.type === 'section';
                  return (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => onSelectField(field.id)}
                          className={`relative group px-4 py-3 transition-colors cursor-pointer ${
                            isActive
                              ? 'border-l-[3px] border-blue-500 bg-blue-50/30'
                              : isSection
                              ? 'border-l-[3px] border-transparent bg-slate-50/80 hover:bg-slate-100/60'
                              : 'border-l-[3px] border-transparent hover:bg-slate-50'
                          } ${snapshot.isDragging ? 'shadow-lg rounded-lg bg-white' : ''}`}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="absolute left-0 top-3 -translate-x-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={16} className="text-slate-400" />
                          </div>

                          {isSection ? (
                            /* Section break card */
                            <div className="flex items-center justify-between gap-3" onClick={e => isActive && e.stopPropagation()}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Minus size={13} className="text-slate-400 shrink-0" />
                                {isActive ? (
                                  <input
                                    autoFocus
                                    value={field.label}
                                    onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                                    placeholder="Section title"
                                    onClick={e => e.stopPropagation()}
                                    className="flex-1 min-w-0 text-[13px] text-slate-700 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300"
                                  />
                                ) : (
                                  <span className={`text-[13px] ${field.label ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                                    {field.label || 'Section title…'}
                                  </span>
                                )}
                                <div className="flex-1 h-px bg-slate-200 min-w-[20px]" />
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); onDuplicateField(field.id); }}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-md" title="Duplicate">
                                  <Copy size={12} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteField(field.id); }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Delete">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Regular field card */
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0" onClick={e => isActive && e.stopPropagation()}>
                                {isActive ? (
                                  <>
                                    <input
                                      autoFocus
                                      value={field.label}
                                      onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                                      placeholder="Question"
                                      className="w-full text-[13px] font-medium text-slate-800 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300"
                                    />
                                    <input
                                      value={field.helpText}
                                      onChange={(e) => onUpdateField(field.id, { helpText: e.target.value })}
                                      placeholder="Help text (optional)"
                                      className="w-full mt-0.5 text-[11px] text-slate-400 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-200"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <p className="text-[13px] font-medium text-slate-700">
                                      {field.label || <span className="text-slate-300 italic">Untitled field</span>}
                                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                    </p>
                                    {field.helpText && (
                                      <p className="text-[11px] text-slate-400 mt-0.5">{field.helpText}</p>
                                    )}
                                  </>
                                )}
                                {!isActive && <FieldPreview field={field} />}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
                                <button onClick={(e) => { e.stopPropagation(); onDuplicateField(field.id); }}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md" title="Duplicate">
                                  <Copy size={13} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteField(field.id); }}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Delete">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Inline editor when active */}
                          {isActive && (
                            <FieldInlineEditor
                              field={field}
                              formType={formType}
                              onUpdate={(updates) => onUpdateField(field.id, updates)}
                            />
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add field / section area */}
        <div className="p-4 space-y-2">
          {/* Field type quick-pick */}
          <div className="grid grid-cols-4 gap-1.5">
            {FIELD_TYPE_OPTIONS.filter(o => o.value !== 'section').map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onAddField(value)}
                title={label}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition-colors text-center"
              >
                <Icon size={14} />
                <span className="text-[10px] leading-tight">{label.replace(' ', '\n')}</span>
              </button>
            ))}
          </div>

          {/* Section divider button */}
          <button
            onClick={() => onAddField('section')}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-slate-200 text-[12px] text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Minus size={13} />
            Add Section Divider
          </button>
        </div>
      </div>
    </div>
  );
}
