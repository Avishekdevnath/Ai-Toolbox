"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { useQuizPoints, useQuizFieldDebugger } from '@/hooks/useQuizPoints';
import { 
  Plus, 
  Settings, 
  Save, 
  Eye, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  CopyPlus,
  Menu,
  Loader2
} from "lucide-react";

// Form field types
const FIELD_TYPES = [
  { value: 'short_text', label: 'Short Text', icon: 'Short' },
  { value: 'long_text', label: 'Paragraph', icon: 'Para' },
  { value: 'number', label: 'Number', icon: '123' },
  { value: 'email', label: 'Email', icon: '@' },
  { value: 'date', label: 'Date', icon: 'Date' },
  { value: 'dropdown', label: 'Dropdown', icon: '▼' },
  { value: 'radio', label: 'Multiple Choice', icon: '○' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑' },
  { value: 'section', label: 'Section Break', icon: '—' },
];


// Default form field
const createDefaultField = (type = 'short_text') => ({
  id: uuidv4(),
  label: '',
  type,
  required: false,
  options: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : [],
  placeholder: '',
  helpText: '',
  quiz: {
    points: 1,
    correctOptions: [],
    explanation: ''
  }
});

export default function FormEditor() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("general");
  const [formFields, setFormFields] = useState([createDefaultField()]);
  const [activeField, setActiveField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formSettings, setFormSettings] = useState({
    isPublic: true,
    allowMultipleSubmissions: true,
    allowAnonymous: false,
    identitySchema: {
      requireName: true,
      requireEmail: true,
      requireStudentId: false,
    },
    timer: { enabled: false, minutes: 30 },
  });
  const [formStatus, setFormStatus] = useState("draft");
  const [formSlug, setFormSlug] = useState<string>("");
  const [copyingLink, setCopyingLink] = useState(false);

  // Use the quiz points service for real-time calculation and logging
  const { totalPoints, calculation, isQuizForm } = useQuizPoints(
    formFields,
    formType,
    {
      enableLogging: true,
      enableDebug: true,
      logOnChange: true
    }
  );

  // Additional debugging for field changes
  useQuizFieldDebugger(formFields, formType);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/${formId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const formData = result.data;
          
          setFormTitle(formData.title || "Untitled Form");
          setFormDescription(formData.description || "");
          setFormType(formData.type || "general");
          
          console.log('🔍 Form Data Loading:', {
            title: formData.title,
            type: formData.type,
            fieldsCount: formData.fields?.length,
            firstFieldQuiz: formData.fields?.[0]?.quiz
          });
          
          // Normalize form fields to ensure they have quiz properties
          const normalizedFields = formData.fields?.length > 0 
            ? formData.fields.map(field => ({
                ...field,
                quiz: {
                  points: field.quiz?.points || 1, // Default to 1 point if not set
                  correctOptions: field.quiz?.correctOptions || [],
                  explanation: field.quiz?.explanation || ''
                }
              }))
            : [createDefaultField()];
          
          console.log('🔍 Normalized Fields:', {
            count: normalizedFields.length,
            fields: normalizedFields.map(f => ({
              id: f.id,
              label: f.label,
              type: f.type,
              quiz: f.quiz
            }))
          });
          
          setFormFields(normalizedFields);
          setFormSettings(formData.settings || {});
          setFormStatus(formData.status || "draft");
          setFormSlug(formData.slug || "");
          
          // Set the first field as active by default
          if (formData.fields?.length > 0) {
            setActiveField(formData.fields[0].id);
          }
        } else {
          console.error("Failed to fetch form data:", result.error);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [formId]);

  const addField = (type) => {
    const newField = createDefaultField(type);
    setFormFields([...formFields, newField]);
    setActiveField(newField.id);
  };

  const deleteField = (id) => {
    if (formFields.length === 1) return; // Don't delete last field
    const newFields = formFields.filter(field => field.id !== id);
    setFormFields(newFields);
    if (activeField === id) {
      setActiveField(newFields[0]?.id || null);
    }
  };

  const updateField = (id, updates) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const moveField = (id, direction) => {
    const index = formFields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formFields.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...formFields];
    const [movedItem] = newFields.splice(index, 1);
    newFields.splice(newIndex, 0, movedItem);
    setFormFields(newFields);
  };

  const duplicateField = (id) => {
    const fieldToDuplicate = formFields.find(field => field.id === id);
    if (!fieldToDuplicate) return;
    
    const duplicatedField = {
      ...fieldToDuplicate,
      id: uuidv4(),
      label: `${fieldToDuplicate.label} (Copy)`
    };
    
    const index = formFields.findIndex(field => field.id === id);
    const newFields = [...formFields];
    newFields.splice(index + 1, 0, duplicatedField);
    setFormFields(newFields);
    setActiveField(duplicatedField.id);
  };

  const addOption = (fieldId) => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    updateField(fieldId, {
      options: [...field.options, `Option ${field.options.length + 1}`]
    });
  };

  const updateOption = (fieldId, index, value) => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    const newOptions = [...field.options];
    newOptions[index] = value;
    
    updateField(fieldId, { options: newOptions });
  };

  const removeOption = (fieldId, index) => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field || !field.options || field.options.length <= 1) return;
    
    updateField(fieldId, {
      options: field.options.filter((_, i) => i !== index)
    });
  };

  const saveForm = async () => {
    try {
      setSaving(true);
      
      const formData = {
        title: formTitle || "Untitled Form",
        description: formDescription,
        type: formType,
        fields: formFields,
        settings: formSettings,
        status: formStatus
      };
      
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Form saved successfully!");
      } else {
        throw new Error(result.error || "Failed to save form");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Save current form state to localStorage for preview
    const previewData = {
      title: formTitle,
      description: formDescription,
      type: formType,
      fields: formFields,
      settings: formSettings,
      status: formStatus
    };
    
    // Store in localStorage to access in preview page
    localStorage.setItem('form_preview_data', JSON.stringify(previewData));
    
    // Open preview in new tab
    window.open('/forms/preview', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-black" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white text-gray-900 shadow-sm border-b py-3 px-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button 
            onClick={() => router.push("/dashboard/forms")}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 overflow-visible">
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Untitled Form"
              className="bg-transparent border-b border-transparent hover:border-blue-400 focus:border-blue-600 focus:outline-none text-xl font-medium w-full whitespace-nowrap"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full ${showSettings ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handlePreview}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <Eye size={20} />
          </button>
          <button
            onClick={saveForm}
            disabled={saving}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main form builder */}
        <div className={`flex-1 overflow-auto p-4 ${showSettings ? 'w-3/4' : 'w-full'}`}>
          <div className="max-w-3xl mx-auto">
            {/* Form description */}
            <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Form Description (optional)"
                className="w-full resize-none border-none focus:outline-none focus:ring-0 text-gray-700"
                rows={2}
              />
            </div>


            {/* Quiz total points summary */}
            {formType === 'quiz' && (
              <div className="bg-white rounded-lg shadow-sm mb-4 p-4 flex items-center justify-between border-l-4 border-blue-500">
                <div className="text-sm text-gray-700">Total Points</div>
                <div className="text-lg font-semibold text-blue-600 transition-colors duration-200">{totalPoints}</div>
              </div>
            )}

            {/* Form fields */}
            {formFields.map((field, index) => (
              <div 
                key={field.id} 
                className={`bg-white rounded-lg shadow-sm mb-4 transition-all ${
                  activeField === field.id 
                    ? 'ring-2 ring-black' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setActiveField(field.id)}
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder={`Question ${index + 1}`}
                          className="text-lg font-medium w-full border-none focus:outline-none focus:ring-0"
                        />
                        {activeField === field.id && (
                          <div className="ml-2 flex items-center">
                            <input
                              type="checkbox"
                              id={`required-${field.id}`}
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="mr-1"
                            />
                            <label htmlFor={`required-${field.id}`} className="text-sm text-gray-600">Required</label>
                          </div>
                        )}
                      </div>

                      {activeField === field.id && (
                        <input
                          type="text"
                          value={field.helpText || ''}
                          onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                          placeholder="Help text (optional)"
                          className="text-sm text-gray-500 w-full mb-4 border-none focus:outline-none focus:ring-0"
                        />
                      )}

                      {/* Field preview based on type */}
                      {field.type === 'short_text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder || "Short text answer"}
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                          disabled
                        />
                      )}

                      {field.type === 'long_text' && (
                        <textarea
                          placeholder={field.placeholder || "Long text answer"}
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                          rows={3}
                          disabled
                        />
                      )}

                      {field.type === 'email' && (
                        <input
                          type="email"
                          placeholder={field.placeholder || "example@email.com"}
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                          disabled
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          placeholder={field.placeholder || "0"}
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                          disabled
                        />
                      )}

                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="mt-2 w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                          disabled
                        />
                      )}

                      {field.type === 'dropdown' && (
                        <div className="mt-2">
                          <select className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" disabled>
                            <option value="">Select an option</option>
                            {field.options?.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                          
                          {activeField === field.id && (
                            <div className="mt-3 space-y-2">
                              {field.options?.map((option, i) => (
                                <div key={i} className="flex items-center">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(field.id, i, e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-md"
                                  />
                                  <button 
                                    onClick={() => removeOption(field.id, i)}
                                    className="ml-2 p-1 text-gray-500 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                              <button 
                                onClick={() => addOption(field.id)}
                                className="flex items-center text-sm text-gray-600 hover:text-black"
                              >
                                <Plus size={16} className="mr-1" /> Add option
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {field.type === 'radio' && (
                        <div className="mt-2 space-y-2">
                          {field.options?.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input type="radio" name={`radio-${field.id}`} disabled />
                              {activeField === field.id ? (
                                <div className="ml-2 flex-1 flex items-center">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(field.id, i, e.target.value)}
                                    className="flex-1 p-1 border border-gray-300 rounded-md"
                                  />
                                  <button 
                                    onClick={() => removeOption(field.id, i)}
                                    className="ml-2 p-1 text-gray-500 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span className="ml-2">{option}</span>
                              )}
                            </div>
                          ))}
                          
                          {activeField === field.id && (
                            <button 
                              onClick={() => addOption(field.id)}
                              className="flex items-center text-sm text-gray-600 hover:text-black"
                            >
                              <Plus size={16} className="mr-1" /> Add option
                            </button>
                          )}
                        </div>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="mt-2 space-y-2">
                          {field.options?.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input type="checkbox" disabled />
                              {activeField === field.id ? (
                                <div className="ml-2 flex-1 flex items-center">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(field.id, i, e.target.value)}
                                    className="flex-1 p-1 border border-gray-300 rounded-md"
                                  />
                                  <button 
                                    onClick={() => removeOption(field.id, i)}
                                    className="ml-2 p-1 text-gray-500 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span className="ml-2">{option}</span>
                              )}
                            </div>
                          ))}
                          
                          {activeField === field.id && (
                            <button 
                              onClick={() => addOption(field.id)}
                              className="flex items-center text-sm text-gray-600 hover:text-black"
                            >
                              <Plus size={16} className="mr-1" /> Add option
                            </button>
                          )}
                        </div>
                      )}

                      {field.type === 'section' && (
                        <div className="mt-2 border-t-2 border-gray-300 pt-2">
                          <p className="text-sm text-gray-500">Section break</p>
                        </div>
                      )}

                      {/* Quiz settings per question */}
                      {formType === 'quiz' && activeField === field.id && (
                        <div className="mt-4 border-t border-gray-200 pt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Quiz Settings</h4>
                          {(field.type === 'radio' || field.type === 'single_select') && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-600 mb-1">Correct Answer</div>
                              <div className="space-y-1">
                                {(field.options || []).map((option, i) => (
                                  <label key={i} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${field.id}`}
                                      checked={(field.quiz?.correctOptions || []).includes(i)}
                                      onChange={() => {
                                        const next = [i];
                                        updateField(field.id, {
                                          quiz: { ...(field.quiz || {}), correctOptions: next }
                                        });
                                      }}
                                    />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {field.type === 'checkbox' && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-600 mb-1">Correct Answers</div>
                              <div className="space-y-1">
                                {(field.options || []).map((option, i) => {
                                  const current: number[] = field.quiz?.correctOptions || [];
                                  const checked = current.includes(i);
                                  return (
                                    <label key={i} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const next = new Set(current);
                                          if (e.target.checked) next.add(i); else next.delete(i);
                                          updateField(field.id, {
                                            quiz: { ...(field.quiz || {}), correctOptions: Array.from(next) }
                                          });
                                        }}
                                      />
                                      <span>{option}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Points</label>
                            <input
                              type="number"
                              min={0}
                              max={1000}
                              value={field.quiz?.points ?? 1}
                              onChange={(e) => updateField(field.id, { quiz: { ...(field.quiz || {}), points: Math.max(0, parseInt(e.target.value || '0')) } })}
                              className="w-24 p-1.5 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Field actions */}
                    {activeField === field.id && (
                      <div className="ml-4 flex flex-col space-y-2">
                        <button
                          onClick={() => moveField(field.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded-full ${index === 0 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
                        >
                          <ChevronUp size={20} />
                        </button>
                        <button
                          onClick={() => moveField(field.id, 'down')}
                          disabled={index === formFields.length - 1}
                          className={`p-1 rounded-full ${index === formFields.length - 1 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
                        >
                          <ChevronDown size={20} />
                        </button>
                        <button
                          onClick={() => duplicateField(field.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <CopyPlus size={20} />
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          disabled={formFields.length === 1}
                          className={`p-1 rounded-full ${formFields.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-gray-100'}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {activeField === field.id && (
                  <div className="bg-gray-50 border-t border-gray-200 p-3">
                    <div className="flex flex-wrap gap-2">
                      {(formType === 'quiz'
                        ? FIELD_TYPES.filter(t => ['radio', 'checkbox'].includes(t.value))
                        : FIELD_TYPES
                      ).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            const currentType = field.type;
                            const newType = type.value;
                            
                            // Define compatible field types that should preserve options
                            const optionBasedTypes = ['dropdown', 'radio', 'checkbox', 'single_select'];
                            const isCurrentOptionBased = optionBasedTypes.includes(currentType);
                            const isNewOptionBased = optionBasedTypes.includes(newType);
                            
                            // If switching between option-based types, preserve options
                            if (isCurrentOptionBased && isNewOptionBased) {
                              updateField(field.id, { 
                                type: newType,
                                options: field.options || ['Option 1']
                              });
                            } else {
                              // For other type changes, reset to default state
                              updateField(field.id, { 
                                type: newType, 
                                options: isNewOptionBased ? (field.options || ['Option 1']) : []
                              });
                            }
                          }}
                          className={`py-1 px-3 text-sm rounded-md ${
                            field.type === type.value 
                              ? 'bg-black text-white' 
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="mr-1">{type.icon}</span> {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add field button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => addField('short_text')}
                className="flex items-center bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Question
              </button>
            </div>

            {/* Quiz identity requirements */}
            {formType === 'quiz' && (
              <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                <h3 className="text-base font-medium text-gray-900 mb-3">Identity Requirements (Quiz)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!formSettings.identitySchema?.requireName}
                      onChange={(e) => setFormSettings(prev => ({
                        ...prev,
                        identitySchema: { ...(prev.identitySchema || {}), requireName: e.target.checked }
                      }))}
                    />
                    Require Name
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!formSettings.identitySchema?.requireEmail}
                      onChange={(e) => setFormSettings(prev => ({
                        ...prev,
                        identitySchema: { ...(prev.identitySchema || {}), requireEmail: e.target.checked }
                      }))}
                    />
                    Require Email
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!formSettings.identitySchema?.requireStudentId}
                      onChange={(e) => setFormSettings(prev => ({
                        ...prev,
                        identitySchema: { ...(prev.identitySchema || {}), requireStudentId: e.target.checked }
                      }))}
                    />
                    Require Student ID
                  </label>
                </div>
              </div>
            )}

            {/* Quiz-only timer controls */}
            {formType === 'quiz' && (
              <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                <h3 className="text-base font-medium text-gray-900 mb-3">Quiz Timer</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!formSettings?.timer?.enabled}
                      onChange={(e) => setFormSettings({
                        ...formSettings,
                        timer: { enabled: e.target.checked, minutes: formSettings?.timer?.minutes || 30 }
                      })}
                    />
                    Enable timer
                  </label>
                  {formSettings?.timer?.enabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Duration</span>
                      <input
                        type="number"
                        min={1}
                        max={480}
                        value={formSettings?.timer?.minutes || 30}
                        onChange={(e) => setFormSettings({
                          ...formSettings,
                          timer: { enabled: true, minutes: Math.max(1, Math.min(480, parseInt(e.target.value || '30'))) }
                        })}
                        className="w-20 p-2 border border-gray-300 rounded-md"
                      />
                      <span className="text-sm text-gray-600">minutes</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="w-1/4 bg-white border-l border-gray-200 overflow-auto p-4">
            <h2 className="text-xl font-medium mb-4">Form Settings</h2>
            
            <div className="space-y-6">
              {/* Public Link */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Public Link</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${formSlug || formId}`}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-xs text-gray-700"
                  />
                  <button
                    onClick={() => {
                      try {
                        const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/f/${formSlug || formId}`;
                        if (navigator?.clipboard?.writeText) {
                          setCopyingLink(true);
                          navigator.clipboard.writeText(link).finally(() => setTimeout(() => setCopyingLink(false), 800));
                        }
                      } catch {}
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {copyingLink ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${formSlug || formId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Open
                  </a>
                </div>
                <p className="mt-1 text-xs text-gray-500">Set visibility and status to control access.</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Form Type</h3>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="general">General Form</option>
                  <option value="survey">Survey</option>
                  <option value="quiz">Quiz</option>
                  <option value="attendance">Attendance</option>
                </select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Form Status</h3>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Form Visibility</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formSettings.isPublic}
                    onChange={(e) => setFormSettings({...formSettings, isPublic: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic">Make form public</label>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Submission Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowMultiple"
                      checked={formSettings.allowMultipleSubmissions}
                      onChange={(e) => setFormSettings({...formSettings, allowMultipleSubmissions: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="allowMultiple">Allow multiple submissions</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowAnon"
                      checked={formSettings.allowAnonymous}
                      onChange={(e) => setFormSettings({...formSettings, allowAnonymous: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="allowAnon">Allow anonymous submissions</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Identity Requirements</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireName"
                      checked={formSettings.identitySchema?.requireName}
                      onChange={(e) => setFormSettings({
                        ...formSettings, 
                        identitySchema: {
                          ...formSettings.identitySchema || {},
                          requireName: e.target.checked
                        }
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="requireName">Require name</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireEmail"
                      checked={formSettings.identitySchema?.requireEmail}
                      onChange={(e) => setFormSettings({
                        ...formSettings, 
                        identitySchema: {
                          ...formSettings.identitySchema || {},
                          requireEmail: e.target.checked
                        }
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="requireEmail">Require email</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireStudentId"
                      checked={formSettings.identitySchema?.requireStudentId}
                      onChange={(e) => setFormSettings({
                        ...formSettings, 
                        identitySchema: {
                          ...formSettings.identitySchema || {},
                          requireStudentId: e.target.checked
                        }
                      })}
                      className="mr-2"
                    />
                    <label htmlFor="requireStudentId">Require student ID</label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Timing Options</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm text-gray-600 mb-1">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      value={formSettings.startAt ? new Date(formSettings.startAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormSettings({
                        ...formSettings,
                        startAt: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm text-gray-600 mb-1">End Date & Time</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      value={formSettings.endAt ? new Date(formSettings.endAt).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormSettings({
                        ...formSettings,
                        endAt: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}