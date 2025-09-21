'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Eye, EyeOff, Settings, Target, FileText } from 'lucide-react';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  unique?: boolean;
  selection?: { min?: number; max?: number };
  customError?: string;
}

export interface QuizSettings {
  correctOptions?: number[];
  points?: number;
  explanation?: string;
}

export interface AdvancedField {
  id: string;
  questionCode?: string;
  label: string;
  type: 'short_text' | 'long_text' | 'email' | 'number' | 'date' | 'time' | 'dropdown' | 'checkbox' | 'radio' | 'matrix' | 'file' | 'rating' | 'scale' | 'section' | 'image' | 'video';
  required: boolean;
  options?: string[];
  multiple?: boolean;
  placeholder?: string;
  helpText?: string;
  imageUrl?: string;
  visibility?: 'public' | 'internal';
  validation?: FieldValidation;
  quiz?: QuizSettings;
  sectionBreak?: boolean;
  sectionTitle?: string;
  sectionDescription?: string;
}

interface FormFieldEditorProps {
  field: AdvancedField;
  onChange: (field: AdvancedField) => void;
  onDelete: () => void;
  isQuiz?: boolean;
}

const FIELD_TYPES = [
  { value: 'short_text', label: 'Short Text', icon: '📝' },
  { value: 'long_text', label: 'Long Text', icon: '📄' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'time', label: 'Time', icon: '⏰' },
  { value: 'dropdown', label: 'Dropdown', icon: '▼' },
  { value: 'radio', label: 'Radio Group', icon: '⚪' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑️' },
  { value: 'matrix', label: 'Matrix/Rating Grid', icon: '📊' },
  { value: 'file', label: 'File Upload', icon: '📎' },
  { value: 'rating', label: 'Star Rating', icon: '⭐' },
  { value: 'scale', label: 'Scale (1-10)', icon: '📏' },
  { value: 'section', label: 'Section Break', icon: '📑' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'video', label: 'Video', icon: '🎥' },
];

export default function FormFieldEditor({ field, onChange, onDelete, isQuiz = false }: FormFieldEditorProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const updateField = (updates: Partial<AdvancedField>) => {
    onChange({ ...field, ...updates });
  };

  const handleFieldTypeChange = (newType: string) => {
    const currentType = field.type;
    
    // Define compatible field types that should preserve options
    const optionBasedTypes = ['dropdown', 'radio', 'checkbox'];
    const isCurrentOptionBased = optionBasedTypes.includes(currentType);
    const isNewOptionBased = optionBasedTypes.includes(newType);
    
    // If switching between option-based types, preserve options and other settings
    if (isCurrentOptionBased && isNewOptionBased) {
      updateField({ 
        type: newType as any,
        // Preserve options, multiple setting, and other relevant properties
        options: field.options,
        multiple: newType === 'checkbox' ? true : (newType === 'dropdown' ? field.multiple : false)
      });
    } else {
      // For other type changes, reset to default state
      const resetOptions = isNewOptionBased ? (field.options || ['Option 1']) : undefined;
      const resetMultiple = newType === 'checkbox' ? true : (newType === 'dropdown' ? false : undefined);
      
      updateField({ 
        type: newType as any,
        options: resetOptions,
        multiple: resetMultiple,
        // Clear validation settings that might not apply to new type
        validation: isNewOptionBased ? field.validation : undefined
      });
    }
  };

  const updateValidation = (validationUpdates: Partial<FieldValidation>) => {
    updateField({
      validation: { ...field.validation, ...validationUpdates }
    });
  };

  const updateQuiz = (quizUpdates: Partial<QuizSettings>) => {
    updateField({
      quiz: { ...field.quiz, ...quizUpdates }
    });
  };

  const addOption = () => {
    const currentOptions = field.options || [];
    const newOption = `Option ${currentOptions.length + 1}`;
    updateField({ options: [...currentOptions, newOption] });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    updateField({ options: newOptions });

    // Also remove from correct options if it's a quiz
    if (field.quiz?.correctOptions) {
      const newCorrect = field.quiz.correctOptions
        .filter(opt => opt !== index)
        .map(opt => opt > index ? opt - 1 : opt);
      updateQuiz({ correctOptions: newCorrect });
    }
  };

  const toggleCorrectOption = (index: number) => {
    if (!field.quiz) return;

    const currentCorrect = field.quiz.correctOptions || [];
    const isCorrect = currentCorrect.includes(index);

    if (isCorrect) {
      updateQuiz({
        correctOptions: currentCorrect.filter(i => i !== index)
      });
    } else {
      updateQuiz({
        correctOptions: [...currentCorrect, index].sort((a, b) => a - b)
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Field Editor</CardTitle>
            <Badge variant={field.visibility === 'internal' ? 'secondary' : 'default'}>
              {field.visibility === 'internal' ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {field.visibility === 'internal' ? 'Internal' : 'Public'}
            </Badge>
            {field.required && <Badge variant="destructive">Required</Badge>}
            {isQuiz && field.quiz?.points && (
              <Badge variant="outline">{field.quiz.points} pts</Badge>
            )}
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Validation
            </TabsTrigger>
            {isQuiz && (
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Quiz
              </TabsTrigger>
            )}
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select value={field.type} onValueChange={handleFieldTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-code">Question Code (Optional)</Label>
                <Input
                  id="question-code"
                  value={field.questionCode || ''}
                  onChange={(e) => updateField({ questionCode: e.target.value })}
                  placeholder="e.g., Q1, DEMO_AGE"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Question Label *</Label>
              <Input
                id="label"
                value={field.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="help-text">Help Text (Optional)</Label>
              <Textarea
                id="help-text"
                value={field.helpText || ''}
                onChange={(e) => updateField({ helpText: e.target.value })}
                placeholder="Additional instructions for respondents..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text (Optional)</Label>
              <Input
                id="placeholder"
                value={field.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                placeholder="Hint text shown in the input field..."
              />
            </div>

            {field.type === 'section' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={field.sectionTitle || ''}
                    onChange={(e) => updateField({ sectionTitle: e.target.value })}
                    placeholder="Section heading..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-description">Section Description</Label>
                  <Textarea
                    id="section-description"
                    value={field.sectionDescription || ''}
                    onChange={(e) => updateField({ sectionDescription: e.target.value })}
                    placeholder="Section description..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {(field.type === 'image' || field.type === 'video') && (
              <div className="space-y-2">
                <Label htmlFor="media-url">Media URL</Label>
                <Input
                  id="media-url"
                  value={field.imageUrl || ''}
                  onChange={(e) => updateField({ imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {field.imageUrl && (
                  <div className="mt-2">
                    {field.type === 'image' ? (
                      <img src={field.imageUrl} alt="Preview" className="max-h-32 rounded border" />
                    ) : (
                      <video src={field.imageUrl} controls className="max-h-32 rounded border" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Options for choice fields */}
            {['dropdown', 'radio', 'checkbox'].includes(field.type) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {isQuiz && field.type === 'radio' && (
                        <Button
                          type="button"
                          variant={field.quiz?.correctOptions?.includes(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCorrectOption(index)}
                        >
                          ✓
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={(field.options || []).length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {field.type === 'dropdown' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="multiple"
                      checked={field.multiple || false}
                      onCheckedChange={(checked) => updateField({ multiple: checked })}
                    />
                    <Label htmlFor="multiple">Allow multiple selections</Label>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={field.required}
                  onCheckedChange={(checked) => updateField({ required: checked })}
                />
                <Label htmlFor="required">Required field</Label>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={field.visibility || 'public'}
                  onValueChange={(value: 'public' | 'internal') => updateField({ visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (visible to respondents)</SelectItem>
                    <SelectItem value="internal">Internal (admin only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Validation Settings */}
          <TabsContent value="validation" className="space-y-4">
            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Minimum Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => updateValidation({ min: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Maximum Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => updateValidation({ max: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="100"
                  />
                </div>
              </div>
            )}

            {['short_text', 'long_text', 'email'].includes(field.type) && (
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern (Regex)</Label>
                <Input
                  id="pattern"
                  value={field.validation?.pattern || ''}
                  onChange={(e) => updateValidation({ pattern: e.target.value || undefined })}
                  placeholder="e.g., ^[A-Z]{2}\d{6}$"
                />
                <p className="text-sm text-gray-500">
                  Use regex patterns for custom validation. Leave empty for no pattern validation.
                </p>
              </div>
            )}

            {['dropdown', 'checkbox'].includes(field.type) && field.multiple && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-select">Min Selections</Label>
                  <Input
                    id="min-select"
                    type="number"
                    value={field.validation?.selection?.min || ''}
                    onChange={(e) => updateValidation({
                      selection: {
                        ...field.validation?.selection,
                        min: e.target.value ? Number(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-select">Max Selections</Label>
                  <Input
                    id="max-select"
                    type="number"
                    value={field.validation?.selection?.max || ''}
                    onChange={(e) => updateValidation({
                      selection: {
                        ...field.validation?.selection,
                        max: e.target.value ? Number(e.target.value) : undefined
                      }
                    })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="custom-error">Custom Error Message</Label>
              <Input
                id="custom-error"
                value={field.validation?.customError || ''}
                onChange={(e) => updateValidation({ customError: e.target.value || undefined })}
                placeholder="Custom validation error message..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="unique"
                checked={field.validation?.unique || false}
                onCheckedChange={(checked) => updateValidation({ unique: checked })}
              />
              <Label htmlFor="unique">Must be unique across all responses</Label>
            </div>
          </TabsContent>

          {/* Quiz Settings */}
          {isQuiz && (
            <TabsContent value="quiz" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={field.quiz?.points || ''}
                    onChange={(e) => updateQuiz({ points: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0"
                  />
                </div>

                {field.type === 'radio' && field.options && (
                  <div className="space-y-2">
                    <Label>Correct Answer(s)</Label>
                    <div className="space-y-2">
                      {field.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`correct-${index}`}
                            checked={field.quiz?.correctOptions?.includes(index) || false}
                            onChange={() => toggleCorrectOption(index)}
                          />
                          <Label htmlFor={`correct-${index}`} className="flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={field.quiz?.explanation || ''}
                    onChange={(e) => updateQuiz({ explanation: e.target.value || undefined })}
                    placeholder="Explain the correct answer..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

