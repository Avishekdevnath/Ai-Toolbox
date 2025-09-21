'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Trash2,
  Settings,
  Save,
  Eye,
  Copy,
  Type,
  List,
  CheckSquare,
  Radio,
  Calendar,
  Clock,
  Image,
  FileText,
  Star,
  Hash,
  Mail,
  Phone,
  Users,
  Target,
  BookOpen,
  GraduationCap,
  Award,
  Zap
} from 'lucide-react';

// Form Types
export const FORM_TYPES = [
  { id: 'general', name: 'General Form', icon: <FileText className="w-4 h-4" /> },
  { id: 'survey', name: 'Survey', icon: <Target className="w-4 h-4" /> },
  { id: 'attendance', name: 'Event Attendance', icon: <Users className="w-4 h-4" /> },
  { id: 'quiz', name: 'Quiz', icon: <BookOpen className="w-4 h-4" /> }
];

// Field Types
export const FIELD_TYPES = [
  { id: 'short_text', name: 'Short Text', icon: <Type className="w-4 h-4" />, description: 'Single line text input' },
  { id: 'long_text', name: 'Long Text', icon: <FileText className="w-4 h-4" />, description: 'Multi-line text area' },
  { id: 'email', name: 'Email', icon: <Mail className="w-4 h-4" />, description: 'Email address input' },
  { id: 'number', name: 'Number', icon: <Hash className="w-4 h-4" />, description: 'Numeric input' },
  { id: 'dropdown', name: 'Dropdown', icon: <List className="w-4 h-4" />, description: 'Single choice from list' },
  { id: 'radio', name: 'Multiple Choice', icon: <Radio className="w-4 h-4" />, description: 'Single choice radio buttons' },
  { id: 'checkbox', name: 'Checkboxes', icon: <CheckSquare className="w-4 h-4" />, description: 'Multiple choice checkboxes' },
  { id: 'date', name: 'Date', icon: <Calendar className="w-4 h-4" />, description: 'Date picker' },
  { id: 'time', name: 'Time', icon: <Clock className="w-4 h-4" />, description: 'Time picker' },
  { id: 'rating', name: 'Rating', icon: <Star className="w-4 h-4" />, description: 'Star rating scale' },
  { id: 'scale', name: 'Scale', icon: <Zap className="w-4 h-4" />, description: 'Numeric scale' }
];

export default function FormBuilder({
  formId,
  initialTemplate,
  onSave
}: {
  formId?: string;
  initialTemplate?: any;
  onSave?: () => void;
}) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [formType, setFormType] = useState<'general' | 'survey' | 'attendance' | 'quiz'>('general');
  const [fields, setFields] = useState<any[]>([]);

  // UI State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showNotice, setShowNotice] = useState<'success' | 'error' | ''>('');

  // Initialize form
  useEffect(() => {
    // Add a default title field
    if (fields.length === 0) {
      addField('short_text');
    }
  }, []);

  // Add new field
  const addField = (fieldType: string = 'short_text') => {
    const newField = {
      id: crypto.randomUUID(),
      label: `Question ${fields.length + 1}`,
      type: fieldType,
      required: false,
      options: fieldType === 'dropdown' || fieldType === 'radio' || fieldType === 'checkbox' ? ['Option 1'] : [],
      placeholder: '',
      helpText: '',
      visibility: 'public',
      questionCode: `question_${fields.length + 1}`
    };

    setFields(prev => [...prev, newField]);
  };

  // Update field
  const updateField = (fieldId: string, updates: any) => {
    setFields(prev => prev.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  // Delete field
  const deleteField = (fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
  };

  // Save form
  const save = async () => {
    setSaving(true);
    setShowNotice('');
    setError('');
    setMsg('');

    try {
      const formData = {
        title,
        description,
        type: formType,
        fields,
        settings: {
          isPublic: false,
          allowMultipleSubmissions: true,
          allowAnonymous: false
        },
        status: 'draft'
      };

      const url = formId ? `/api/forms/${formId}` : '/api/forms';
      const method = formId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save form');
      }

      setMsg('Form saved successfully!');
      setShowNotice('success');

      if (onSave) onSave();

      // If it's a new form, redirect to edit page
      if (!formId && data.data?.id) {
        router.push(`/dashboard/forms/${data.data.id}/edit`);
      }

    } catch (e: any) {
      setError(e.message || 'Failed to save form');
      setShowNotice('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Form</h1>
          <p className="text-sm text-gray-600 mt-1">Build your form by adding questions</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Form'}
          </Button>
        </div>
      </div>

      {/* Notification */}
      {showNotice && (
        <div className={`px-4 py-3 rounded-md ${
          showNotice === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {showNotice === 'success' ? msg : error}
        </div>
      )}

      {/* Form Configuration */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Type
            </label>
            <Select value={formType} onValueChange={(value: any) => setFormType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORM_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span>{type.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your form"
            rows={3}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions</h2>
            <Select onValueChange={addField}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Add Question" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span>{type.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  {/* Question Label */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Enter your question"
                      className="font-medium"
                    />
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </div>

                  {/* Field Type */}
                  <Select
                    value={field.type}
                    onValueChange={(value) => updateField(field.id, { type: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Options for choice fields */}
                  {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Options</label>
                      {field.options?.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...field.options];
                              newOptions[optIndex] = e.target.value;
                              updateField(field.id, { options: newOptions });
                            }}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = field.options.filter((_: string, i: number) => i !== optIndex);
                              updateField(field.id, { options: newOptions });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                          updateField(field.id, { options: newOptions });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}

                  {/* Help text */}
                  <Input
                    value={field.helpText || ''}
                    onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                    placeholder="Help text (optional)"
                    className="text-sm"
                  />
                </div>

                {/* Delete button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteField(field.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add question button */}
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => addField()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}