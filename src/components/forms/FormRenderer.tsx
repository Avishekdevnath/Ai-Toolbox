"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';

interface FormRendererProps {
  formSchema: any;
  formId: string;
}

export default function FormRenderer({ formSchema, formId }: FormRendererProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // For quiz forms with authentication step
  const [showQuizQuestions, setShowQuizQuestions] = useState(formSchema.type !== 'quiz');
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    studentId: ''
  });

  // Handle form field changes
  const handleChange = (fieldId, value, fieldType) => {
    if (fieldType === 'checkbox') {
      // For checkboxes, we manage an array of values
      setFormData(prev => {
        const currentSelections = prev[fieldId] || [];
        if (currentSelections.includes(value)) {
          return { ...prev, [fieldId]: currentSelections.filter(v => v !== value) };
        } else {
          return { ...prev, [fieldId]: [...currentSelections, value] };
        }
      });
    } else {
      setFormData({ ...formData, [fieldId]: value });
    }
    
    // Clear validation error for this field when user changes it
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Handle auth field changes for quiz forms
  const handleAuthChange = (field, value) => {
    setAuthData({
      ...authData,
      [field]: value
    });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate authentication data for quiz
  const validateAuthData = () => {
    const errors = {};
    const { identitySchema } = formSchema.settings || {};
    
    if (identitySchema?.requireName && !authData.name) {
      errors.name = 'Name is required';
    }
    
    if (identitySchema?.requireEmail && !authData.email) {
      errors.email = 'Email is required';
    } else if (authData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(authData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (identitySchema?.requireStudentId && !authData.studentId) {
      errors.studentId = 'Student ID is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToQuiz = (e) => {
    e.preventDefault();
    
    if (validateAuthData()) {
      setShowQuizQuestions(true);
    } else {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Validate form data before submission
  const validateForm = () => {
    const errors = {};
    
    formSchema.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id];
        let isInvalid = false;
        
        if (field.type === 'checkbox') {
          isInvalid = !value || value.length === 0;
        } else {
          isInvalid = !value || value.trim() === '';
        }
        
        if (isInvalid) {
          errors[field.id] = 'This field is required';
        }
      }
      
      // Email validation
      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id])) {
          errors[field.id] = 'Please enter a valid email address';
        }
      }
      
      // Number validation
      if (field.type === 'number' && formData[field.id]) {
        if (isNaN(formData[field.id])) {
          errors[field.id] = 'Please enter a valid number';
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.error-message');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Combine form data with auth data for submission
      const submissionData = { 
        ...formData,
        identity: formSchema.type === 'quiz' ? authData : undefined
      };
      
      // Submit the form
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        // Show success state
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        console.error("Submission error:", result.error);
        alert(result.error || "Failed to submit form. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An error occurred while submitting the form.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-green-600 mb-2">Success</h2>
          <p className="text-gray-600">Your form has been submitted successfully.</p>
          {formSchema.settings?.allowMultipleSubmissions ? (
            <button
              className="mt-6 px-4 py-2 bg-black text-white rounded-md"
              onClick={() => {
                // Reset form
                setFormData({});
                setAuthData({ name: '', email: '', studentId: '' });
                setSubmitted(false);
                setShowQuizQuestions(formSchema.type !== 'quiz');
                window.location.reload();
              }}
            >
              Submit Another Response
            </button>
          ) : (
            <button
              className="mt-6 px-4 py-2 bg-black text-white rounded-md"
              onClick={() => router.push('/')}
            >
              Return Home
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz auth screen
  if (formSchema.type === 'quiz' && !showQuizQuestions) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm mb-6 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{formSchema.title}</h1>
            {formSchema.description && (
              <p className="text-gray-600 mb-4">{formSchema.description}</p>
            )}
            
            {/* Show form availability timeframe */}
            {(formSchema.settings?.startAt || formSchema.settings?.endAt) && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-sm">
                <p className="font-medium">Quiz available:</p>
                <p>
                  {formSchema.settings?.startAt && (
                    <span>From {new Date(formSchema.settings.startAt).toLocaleString()}</span>
                  )}
                  {formSchema.settings?.startAt && formSchema.settings?.endAt && (
                    <span> to </span>
                  )}
                  {formSchema.settings?.endAt && (
                    <span>Until {new Date(formSchema.settings.endAt).toLocaleString()}</span>
                  )}
                </p>
              </div>
            )}

            <form onSubmit={handleProceedToQuiz} className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Please identify yourself to begin the quiz</h2>
              
              <div className="space-y-4">
                {formSchema.settings?.identitySchema?.requireName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={authData.name}
                      onChange={(e) => handleAuthChange('name', e.target.value)}
                      className={`w-full p-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                      placeholder="Your full name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-500 error-message">{validationErrors.name}</p>
                    )}
                  </div>
                )}
                
                {formSchema.settings?.identitySchema?.requireEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={authData.email}
                      onChange={(e) => handleAuthChange('email', e.target.value)}
                      className={`w-full p-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                      placeholder="your.email@example.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-500 error-message">{validationErrors.email}</p>
                    )}
                  </div>
                )}
                
                {formSchema.settings?.identitySchema?.requireStudentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={authData.studentId}
                      onChange={(e) => handleAuthChange('studentId', e.target.value)}
                      className={`w-full p-2 border ${validationErrors.studentId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                      placeholder="Your student ID"
                    />
                    {validationErrors.studentId && (
                      <p className="mt-1 text-sm text-red-500 error-message">{validationErrors.studentId}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white rounded-md font-medium text-lg flex items-center justify-center"
                >
                  Begin Quiz <ArrowRight size={20} className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main form renderer
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm mb-6 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{formSchema.title}</h1>
          {formSchema.description && (
            <p className="text-gray-600 mb-4">{formSchema.description}</p>
          )}
          
          {/* Show form availability timeframe */}
          {(formSchema.settings?.startAt || formSchema.settings?.endAt) && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4 text-sm">
              <p className="font-medium">Form available:</p>
              <p>
                {formSchema.settings?.startAt && (
                  <span>From {new Date(formSchema.settings.startAt).toLocaleString()}</span>
                )}
                {formSchema.settings?.startAt && formSchema.settings?.endAt && (
                  <span> to </span>
                )}
                {formSchema.settings?.endAt && (
                  <span>Until {new Date(formSchema.settings.endAt).toLocaleString()}</span>
                )}
              </p>
            </div>
          )}
        </div>
        
        {/* Identity fields if required and not a quiz */}
        {formSchema.settings?.identitySchema && formSchema.type !== 'quiz' && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-8">
            <h2 className="text-lg font-semibold mb-4">Your Information</h2>
            
            {formSchema.settings.identitySchema.requireName && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name {formSchema.settings.identitySchema.requireName && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full p-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  placeholder="Your name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-500 error-message">{validationErrors.name}</p>
                )}
              </div>
            )}
            
            {formSchema.settings.identitySchema.requireEmail && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email {formSchema.settings.identitySchema.requireEmail && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full p-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  placeholder="your.email@example.com"
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-500 error-message">{validationErrors.email}</p>
                )}
              </div>
            )}
            
            {formSchema.settings.identitySchema.requireStudentId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID {formSchema.settings.identitySchema.requireStudentId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.studentId || ''}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  className={`w-full p-2 border ${validationErrors.studentId ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  placeholder="Your student ID"
                />
                {validationErrors.studentId && (
                  <p className="mt-1 text-sm text-red-500 error-message">{validationErrors.studentId}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          {formSchema.fields.map((field) => (
            <div 
              key={field.id} 
              className={`bg-white rounded-lg shadow-sm mb-6 p-8 ${field.type === 'section' ? 'border-t-4 border-black' : ''}`}
            >
              {field.type !== 'section' && (
                <div className="mb-2">
                  <label className="block text-lg font-medium text-gray-900">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.helpText && (
                    <p className="text-sm text-gray-500 mt-1 mb-3">{field.helpText}</p>
                  )}
                </div>
              )}
              
              {/* Section type is just a divider with title */}
              {field.type === 'section' && (
                <h2 className="text-xl font-bold text-gray-900">{field.label}</h2>
              )}
              
              {/* Short text input */}
              {field.type === 'short_text' && (
                <div>
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ''}
                    className={`w-full p-3 border ${validationErrors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  />
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Long text input */}
              {field.type === 'long_text' && (
                <div>
                  <textarea
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ''}
                    rows={4}
                    className={`w-full p-3 border ${validationErrors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  ></textarea>
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Email input */}
              {field.type === 'email' && (
                <div>
                  <input
                    type="email"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || 'example@email.com'}
                    className={`w-full p-3 border ${validationErrors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  />
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Number input */}
              {field.type === 'number' && (
                <div>
                  <input
                    type="number"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder || '0'}
                    className={`w-full p-3 border ${validationErrors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  />
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Date input */}
              {field.type === 'date' && (
                <div>
                  <input
                    type="date"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full p-3 border ${validationErrors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  />
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Dropdown select */}
              {field.type === 'dropdown' && (
                <div>
                  <select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full p-3 border ${validationErrors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black`}
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option, i) => (
                      <option key={i} value={option}>{option}</option>
                    ))}
                  </select>
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Radio buttons */}
              {field.type === 'radio' && (
                <div className="space-y-3">
                  {field.options?.map((option, i) => (
                    <div key={i} className="flex items-center">
                      <input
                        type="radio"
                        id={`${field.id}-option-${i}`}
                        name={field.id}
                        value={option}
                        checked={formData[field.id] === option}
                        onChange={() => handleChange(field.id, option)}
                        className="mr-3 h-5 w-5 text-black focus:ring-black"
                      />
                      <label 
                        htmlFor={`${field.id}-option-${i}`}
                        className="text-gray-700 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Single Select - Google Forms style */}
              {field.type === 'single_select' && (
                <div className="space-y-3">
                  {field.options?.map((option, i) => (
                    <div key={i} className="flex items-center">
                      <div 
                        onClick={() => handleChange(field.id, option)}
                        className="relative flex items-center justify-center cursor-pointer"
                      >
                        <div className={`w-5 h-5 border-2 rounded-full transition-colors ${
                          formData[field.id] === option ? 'border-gray-600' : 'border-gray-300'
                        }`}></div>
                        {formData[field.id] === option && (
                          <div className="absolute w-3 h-3 bg-gray-600 rounded-full"></div>
                        )}
                      </div>
                      <label 
                        onClick={() => handleChange(field.id, option)}
                        className="ml-3 text-base text-gray-800 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
              
              {/* Checkboxes */}
              {field.type === 'checkbox' && (
                <div className="space-y-3">
                  {field.options?.map((option, i) => (
                    <div key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${field.id}-option-${i}`}
                        value={option}
                        checked={(formData[field.id] || []).includes(option)}
                        onChange={() => handleChange(field.id, option, 'checkbox')}
                        className="mr-3 h-5 w-5 text-black focus:ring-black rounded"
                      />
                      <label 
                        htmlFor={`${field.id}-option-${i}`}
                        className="text-gray-700 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                  {validationErrors[field.id] && (
                    <p className="mt-1 text-sm text-red-500 error-message">{validationErrors[field.id]}</p>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex justify-center mb-8">
            <button
              type="submit"
              disabled={submitting}
              className={`px-8 py-3 bg-black text-white rounded-md font-medium text-lg flex items-center justify-center min-w-[200px] ${
                submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}