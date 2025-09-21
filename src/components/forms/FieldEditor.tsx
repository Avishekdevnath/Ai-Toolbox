'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';

interface Field {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface FieldEditorProps {
  field: Field;
  onSave: (field: Field) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function FieldEditor({ field, onSave, onCancel, isOpen }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<Field>({ ...field });
  const [activeTab, setActiveTab] = useState('basic');

  const handleSave = () => {
    onSave(editedField);
  };

  const updateField = (updates: Partial<Field>) => {
    setEditedField(prev => ({ ...prev, ...updates }));
  };

  const addOption = () => {
    const newOptions = [...(editedField.options || []), `Option ${(editedField.options?.length || 0) + 1}`];
    updateField({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedField.options || [])];
    newOptions[index] = value;
    updateField({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = editedField.options?.filter((_, i) => i !== index) || [];
    updateField({ options: newOptions });
  };

  const hasOptions = ['dropdown', 'radio', 'checkbox'].includes(editedField.type);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <Input
                value={editedField.label}
                onChange={(e) => updateField({ label: e.target.value })}
                placeholder="Enter your question"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Help Text
              </label>
              <Input
                value={editedField.helpText || ''}
                onChange={(e) => updateField({ helpText: e.target.value })}
                placeholder="Provide additional context (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder Text
              </label>
              <Input
                value={editedField.placeholder || ''}
                onChange={(e) => updateField({ placeholder: e.target.value })}
                placeholder="Text shown when field is empty"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={editedField.required}
                onCheckedChange={(checked) => updateField({ required: checked as boolean })}
              />
              <label className="text-sm font-medium text-gray-700">
                Required field
              </label>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            {hasOptions ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Answer Choices</h3>
                  <Button size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {editedField.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        disabled={editedField.options!.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {editedField.type === 'checkbox' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Respondents can select multiple options from this field.
                    </p>
                  </div>
                )}

                {editedField.type === 'dropdown' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Note:</strong> Respondents can select only one option from the dropdown.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  No additional options available for this field type.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Validation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editedField.type === 'short_text' || editedField.type === 'long_text' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Length
                        </label>
                        <Input
                          type="number"
                          value={editedField.validation?.min || ''}
                          onChange={(e) => updateField({
                            validation: {
                              ...editedField.validation,
                              min: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Length
                        </label>
                        <Input
                          type="number"
                          value={editedField.validation?.max || ''}
                          onChange={(e) => updateField({
                            validation: {
                              ...editedField.validation,
                              max: e.target.value ? parseInt(e.target.value) : undefined
                            }
                          })}
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pattern (Regex)
                      </label>
                      <Input
                        value={editedField.validation?.pattern || ''}
                        onChange={(e) => updateField({
                          validation: {
                            ...editedField.validation,
                            pattern: e.target.value || undefined
                          }
                        })}
                        placeholder="^[A-Za-z]+$"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use regular expressions to validate input format
                      </p>
                    </div>
                  </>
                ) : editedField.type === 'number' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Value
                      </label>
                      <Input
                        type="number"
                        value={editedField.validation?.min || ''}
                        onChange={(e) => updateField({
                          validation: {
                            ...editedField.validation,
                            min: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Value
                      </label>
                      <Input
                        type="number"
                        value={editedField.validation?.max || ''}
                        onChange={(e) => updateField({
                          validation: {
                            ...editedField.validation,
                            max: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    No validation rules available for this field type.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Field Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Field Visibility</label>
                    <p className="text-xs text-gray-500">Control who can see this field</p>
                  </div>
                  <Select
                    value="public"
                    onValueChange={(value) => updateField({ visibility: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
