"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Calendar
} from "lucide-react";

// Form types
const FORM_TYPES = [
  { value: 'general', label: 'General Form', description: 'Collect various types of information' },
  { value: 'survey', label: 'Survey', description: 'Gather feedback and opinions' },
  { value: 'quiz', label: 'Quiz', description: 'Test knowledge with scoring' },
  { value: 'attendance', label: 'Attendance', description: 'Track attendance for events or classes' }
];

// Form statuses
const FORM_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
  { value: 'archived', label: 'Archived' }
];

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

export default function FormBuilder() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formType, setFormType] = useState("");
  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("draft");
  const [formFields, setFormFields] = useState([createDefaultField()]);
  const [activeField, setActiveField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formSettings, setFormSettings] = useState({
    isPublic: true,
    allowMultipleSubmissions: true,
    allowAnonymous: false,
    identitySchema: {
      requireName: false,
      requireEmail: false,
      requireStudentId: false,
    },
    startAt: null,
    endAt: null,
    endless: false,
    timer: { enabled: false, minutes: 30 },
  });

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

  const goToNextStep = () => {
    if (currentStep === 1 && !formType) {
      alert("Please select a form type");
      return;
    }
    // Continue to next step
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

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

  // Function to toggle between published and draft states
  const handlePublishToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (formStatus === "published") {
      // Toggle to draft if already published
      setFormStatus("draft");
      console.log("Form set to Draft status");
    } else {
      // Set to published and update start time
      setFormStatus("published");
      setFormSettings({
        ...formSettings,
        startAt: new Date().toISOString(),
      });
      console.log("Form set to Published status");
    }
  };

  const toggleEndless = () => {
    setFormSettings(prev => ({
      ...prev,
      endless: !prev.endless,
      endAt: prev.endless ? prev.endAt : null
    }));
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
      
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.id) {
        router.push(`/dashboard/forms/${result.data.id}/edit`);
      } else {
        throw new Error(result.error || "Failed to save form");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Save form data to localStorage for preview
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

  // Render step 1: Form type selection
  const renderFormTypeSelection = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Select Form Type</h2>
          <p className="text-sm text-gray-600">Choose the type of form you want to create</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FORM_TYPES.map((type) => (
            <div 
              key={type.value}
              onClick={() => setFormType(type.value)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                formType === type.value 
                  ? 'border-gray-600 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="text-base font-medium mb-1">{type.label}</h3>
              <p className="text-xs text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={goToNextStep}
            className="px-5 py-1.5 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700"
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Render step 2: Form details
  const renderFormDetails = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Form Details</h2>
          <p className="text-sm text-gray-600">Set up your form information and availability</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm mb-5 p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Form Name"
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={formDescription}
              onChange={(e) => {
                setFormDescription(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              placeholder="Form Description"
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none overflow-hidden"
              rows={2}
              style={{ minHeight: '2.5rem' }}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              {FORM_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Start Date (optional)</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formSettings.startAt || ''}
                    onChange={(e) => setFormSettings({
                      ...formSettings,
                      startAt: e.target.value || null
                    })}
                    className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 pl-8"
                  />
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">End Date (optional)</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formSettings.endAt || ''}
                    onChange={(e) => setFormSettings({
                      ...formSettings,
                      endAt: e.target.value || null,
                      endless: e.target.value ? false : formSettings.endless
                    })}
                    disabled={formSettings.endless}
                    className={`w-full p-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 pl-8 ${formSettings.endless ? 'bg-gray-100' : ''}`}
                  />
                  <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Quiz identity requirements */}
          {formType === 'quiz' && (
            <div className="mt-4 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Identity Requirements (Quiz)</label>
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
          
          <div className="flex flex-wrap gap-2 mt-4">
            {formType === 'quiz' && (
              <div className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="text-sm font-medium mb-2">Quiz Timer</h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
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
                      <span className="text-sm">Duration</span>
                      <input
                        type="number"
                        min={1}
                        max={480}
                        value={formSettings?.timer?.minutes || 30}
                        onChange={(e) => setFormSettings({
                          ...formSettings,
                          timer: { enabled: true, minutes: Math.max(1, Math.min(480, parseInt(e.target.value || '30'))) }
                        })}
                        className="w-20 p-1.5 text-sm border border-gray-300 rounded-md"
                      />
                      <span className="text-xs text-gray-600">minutes</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Publish toggle button */}
            <button
              onClick={handlePublishToggle}
              className={`px-3 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-gray-500 cursor-pointer z-10 relative ${
                formStatus === 'published' 
                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              {formStatus === 'published' ? 'Published ✓' : 'Publish Now'}
            </button>
            <button
              onClick={toggleEndless}
              className={`px-3 py-1.5 text-xs border rounded-md ${
                formSettings.endless 
                  ? 'bg-gray-800 text-white border-gray-800' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              type="button"
            >
              No End Date
            </button>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between">
          <button
            onClick={goToPreviousStep}
            className="px-5 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            type="button"
          >
            Back
          </button>
          <button
            onClick={goToNextStep}
            className="px-5 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700"
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Render step 3: Form questions
  const renderFormQuestions = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Form Questions</h2>
          <p className="text-sm text-gray-600">
            {formType === 'quiz' ? 
              'Create quiz questions for your assessment' : 
              'Add questions to your form'}
          </p>
        </div>

        {/* Quiz total points summary */}
        {formType === 'quiz' && (
          <div className="bg-white rounded-lg shadow-sm mb-4 p-4 flex items-center justify-between border-l-4 border-blue-500">
            <div className="text-sm text-gray-700">Total Points</div>
            <div className="text-lg font-semibold text-blue-600 transition-colors duration-200">
              {totalPoints}
            </div>
          </div>
        )}

        {/* Form fields */}
        {formFields.map((field, index) => (
          <div 
            key={field.id} 
            className={`bg-white rounded-lg shadow-sm mb-3 transition-all ${
              activeField === field.id 
                ? 'ring-2 ring-gray-400' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveField(field.id)}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder={`Question ${index + 1}`}
                      className="text-base font-medium w-full border-none focus:outline-none focus:ring-0"
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
                        <label htmlFor={`required-${field.id}`} className="text-xs text-gray-600">Required</label>
                      </div>
                    )}
                  </div>

                  {activeField === field.id && (
                    <input
                      type="text"
                      value={field.helpText || ''}
                      onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                      placeholder="Help text (optional)"
                      className="text-xs text-gray-500 w-full mb-3 border-none focus:outline-none focus:ring-0"
                    />
                  )}

                  {/* Field preview based on type */}
                  {field.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder || "Short text answer"}
                      className="mt-1 w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  )}

                  {field.type === 'long_text' && (
                    <textarea
                      placeholder={field.placeholder || "Long text answer"}
                      className="mt-1 w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 resize-none overflow-hidden"
                      rows={2}
                      disabled
                      style={{ minHeight: '2.5rem' }}
                    />
                  )}

                  {field.type === 'email' && (
                    <input
                      type="email"
                      placeholder={field.placeholder || "example@email.com"}
                      className="mt-1 w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      placeholder={field.placeholder || "0"}
                      className="mt-1 w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  )}

                  {field.type === 'date' && (
                    <input
                      type="date"
                      className="mt-1 w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  )}

                  {field.type === 'dropdown' && (
                    <div className="mt-1">
                      <select className="w-full p-1.5 text-sm border border-gray-300 rounded-md bg-gray-50" disabled>
                        <option value="">Select an option</option>
                        {field.options?.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                      
                      {activeField === field.id && (
                        <div className="mt-2 space-y-1">
                          {field.options?.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, i, e.target.value)}
                                className="flex-1 p-1 text-sm border border-gray-300 rounded-md"
                              />
                              <button 
                                onClick={(e) => { 
                                  e.preventDefault(); 
                                  e.stopPropagation(); 
                                  removeOption(field.id, i); 
                                }}
                                className="ml-1 p-1 text-gray-500 hover:text-red-500"
                                type="button"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addOption(field.id);
                            }}
                            className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                            type="button"
                          >
                            <Plus size={12} className="mr-1" /> Add option
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === 'radio' && (
                    <div className="mt-1 space-y-1">
                      {field.options?.map((option, i) => (
                        <div key={i} className="flex items-center">
                          <input type="radio" name={`radio-${field.id}`} disabled className="scale-75" />
                          {activeField === field.id ? (
                            <div className="ml-1 flex-1 flex items-center">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, i, e.target.value)}
                                className="flex-1 p-1 text-sm border border-gray-300 rounded-md"
                              />
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeOption(field.id, i);
                                }}
                                className="ml-1 p-1 text-gray-500 hover:text-red-500"
                                type="button"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="ml-1 text-sm">{option}</span>
                          )}
                        </div>
                      ))}
                      
                      {activeField === field.id && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addOption(field.id);
                          }}
                          className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                          type="button"
                        >
                          <Plus size={12} className="mr-1" /> Add option
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Single-select is represented by radio (Multiple Choice) */}

                  {field.type === 'checkbox' && (
                    <div className="mt-1 space-y-1">
                      {field.options?.map((option, i) => (
                        <div key={i} className="flex items-center">
                          <input type="checkbox" disabled className="scale-75" />
                          {activeField === field.id ? (
                            <div className="ml-1 flex-1 flex items-center">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, i, e.target.value)}
                                className="flex-1 p-1 text-sm border border-gray-300 rounded-md"
                              />
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeOption(field.id, i);
                                }}
                                className="ml-1 p-1 text-gray-500 hover:text-red-500"
                                type="button"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="ml-1 text-sm">{option}</span>
                          )}
                        </div>
                      ))}
                      
                      {activeField === field.id && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addOption(field.id);
                          }}
                          className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                          type="button"
                        >
                          <Plus size={12} className="mr-1" /> Add option
                        </button>
                      )}
                    </div>
                  )}

                  {field.type === 'section' && (
                    <div className="mt-2 border-t-2 border-gray-300 pt-2">
                      <p className="text-xs text-gray-500">Section break</p>
                    </div>
                  )}

                  {/* Quiz settings per question */}
                  {formType === 'quiz' && activeField === field.id && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Quiz Settings</h4>
                      {(field.type === 'radio' || field.type === 'single_select') && (
                        <div className="mb-2">
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
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      {field.type === 'checkbox' && (
                        <div className="mb-2">
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
                                  <span className="text-sm">{option}</span>
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
                          className="w-20 p-1.5 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Field actions */}
                {activeField === field.id && (
                  <div className="ml-2 flex flex-col space-y-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveField(field.id, 'up');
                      }}
                      disabled={index === 0}
                      className={`p-0.5 rounded-full ${index === 0 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
                      type="button"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        moveField(field.id, 'down');
                      }}
                      disabled={index === formFields.length - 1}
                      className={`p-0.5 rounded-full ${index === formFields.length - 1 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
                      type="button"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        duplicateField(field.id);
                      }}
                      className="p-0.5 rounded-full hover:bg-gray-100"
                      type="button"
                    >
                      <CopyPlus size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteField(field.id);
                      }}
                      disabled={formFields.length === 1}
                      className={`p-0.5 rounded-full ${formFields.length === 1 ? 'text-gray-300' : 'text-red-500 hover:bg-gray-100'}`}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {activeField === field.id && (
              <div className="bg-gray-50 border-t border-gray-200 p-2">
                <div className="flex flex-wrap gap-1">
                      {(formType === 'quiz'
                        ? FIELD_TYPES.filter(t => ['radio', 'checkbox'].includes(t.value))
                        : FIELD_TYPES
                      ).map((type) => (
                    <button
                      key={type.value}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const currentType = field.type;
                        const newType = type.value;
                        
                        // Define compatible field types that should preserve options
                        const optionBasedTypes = ['dropdown', 'radio', 'checkbox'];
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
                      className={`py-0.5 px-2 text-xs rounded-md ${
                        field.type === type.value 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                      type="button"
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
        <div className="flex justify-center mb-5">
          <button
            onClick={(e) => {
              e.preventDefault();
              addField('short_text');
            }}
            className="flex items-center bg-gray-800 text-white px-3 py-1.5 text-sm rounded-md hover:bg-gray-700 transition-colors"
            type="button"
          >
            <Plus size={16} className="mr-1" />
            Add Question
          </button>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={goToPreviousStep}
            className="px-5 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            type="button"
          >
            Back
          </button>
          <button
            onClick={saveForm}
            disabled={saving}
            className="px-5 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
            type="button"
          >
            {saving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white text-gray-900 shadow-sm py-2 px-3 mb-4 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.push("/dashboard/forms")}
                className="p-1.5 hover:bg-gray-100 rounded-full mr-2"
                type="button"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg font-medium">Create New Form</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreview}
                className="p-1.5 hover:bg-gray-100 rounded-full"
                type="button"
              >
                <Eye size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="container mx-auto mb-5">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex-1">
            <div className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <p className={`text-xs mt-1 ${currentStep === 1 ? 'font-medium' : ''}`}>Form Type</p>
          </div>
          <div className="w-6"></div>
          <div className="flex-1">
            <div className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <p className={`text-xs mt-1 ${currentStep === 2 ? 'font-medium' : ''}`}>Details</p>
          </div>
          <div className="w-6"></div>
          <div className="flex-1">
            <div className={`h-1.5 rounded-full ${currentStep >= 3 ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <p className={`text-xs mt-1 ${currentStep === 3 ? 'font-medium' : ''}`}>Questions</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto pb-12">
        {currentStep === 1 && renderFormTypeSelection()}
        {currentStep === 2 && renderFormDetails()}
        {currentStep === 3 && renderFormQuestions()}
      </div>
    </div>
  );
}