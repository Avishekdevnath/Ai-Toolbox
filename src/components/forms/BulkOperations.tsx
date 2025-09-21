'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Trash2,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  Archive,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

export interface FormItem {
  id: string;
  title: string;
  type: 'survey' | 'general' | 'attendance' | 'quiz';
  status: 'draft' | 'published' | 'archived';
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BulkOperationsProps {
  forms: FormItem[];
  onBulkDelete: (formIds: string[]) => Promise<void>;
  onBulkPublish: (formIds: string[]) => Promise<void>;
  onBulkUnpublish: (formIds: string[]) => Promise<void>;
  onBulkArchive: (formIds: string[]) => Promise<void>;
  onBulkExport: (formIds: string[], format: 'json' | 'csv') => Promise<void>;
  onBulkDuplicate: (formIds: string[]) => Promise<void>;
  className?: string;
}

export default function BulkOperations({
  forms,
  onBulkDelete,
  onBulkPublish,
  onBulkUnpublish,
  onBulkArchive,
  onBulkExport,
  onBulkDuplicate,
  className = ''
}: BulkOperationsProps) {
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [operationStatus, setOperationStatus] = useState<{
    type: string;
    success: boolean;
    message: string;
  } | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedForms(new Set(forms.map(f => f.id)));
    } else {
      setSelectedForms(new Set());
    }
  };

  const handleSelectForm = (formId: string, checked: boolean) => {
    const newSelected = new Set(selectedForms);
    if (checked) {
      newSelected.add(formId);
    } else {
      newSelected.delete(formId);
    }
    setSelectedForms(newSelected);
  };

  const executeBulkOperation = async (
    operation: () => Promise<void>,
    operationName: string
  ) => {
    if (selectedForms.size === 0) return;

    setIsProcessing(true);
    setOperationStatus(null);

    try {
      await operation();
      setOperationStatus({
        type: operationName,
        success: true,
        message: `Successfully ${operationName.toLowerCase()} ${selectedForms.size} form(s)`
      });
      setSelectedForms(new Set());
    } catch (error: any) {
      setOperationStatus({
        type: operationName,
        success: false,
        message: `Failed to ${operationName.toLowerCase()}: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedForms.size} form(s)? This action cannot be undone.`)) {
      return;
    }
    executeBulkOperation(
      () => onBulkDelete(Array.from(selectedForms)),
      'Delete'
    );
  };

  const handleBulkPublish = () => {
    executeBulkOperation(
      () => onBulkPublish(Array.from(selectedForms)),
      'Publish'
    );
  };

  const handleBulkUnpublish = () => {
    executeBulkOperation(
      () => onBulkUnpublish(Array.from(selectedForms)),
      'Unpublish'
    );
  };

  const handleBulkArchive = () => {
    executeBulkOperation(
      () => onBulkArchive(Array.from(selectedForms)),
      'Archive'
    );
  };

  const handleBulkExport = (format: 'json' | 'csv') => {
    executeBulkOperation(
      () => onBulkExport(Array.from(selectedForms), format),
      `Export (${format.toUpperCase()})`
    );
  };

  const handleBulkDuplicate = () => {
    executeBulkOperation(
      () => onBulkDuplicate(Array.from(selectedForms)),
      'Duplicate'
    );
  };

  const getSelectedForms = () => {
    return forms.filter(f => selectedForms.has(f.id));
  };

  const getStatusCounts = () => {
    const selected = getSelectedForms();
    return {
      draft: selected.filter(f => f.status === 'draft').length,
      published: selected.filter(f => f.status === 'published').length,
      archived: selected.filter(f => f.status === 'archived').length
    };
  };

  const statusCounts = getStatusCounts();

  if (forms.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="text-center">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms available</h3>
            <p className="text-sm text-gray-600">Create some forms first to use bulk operations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selection Summary */}
      {selectedForms.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedForms.size} form(s) selected
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-700">
                  {statusCounts.draft > 0 && (
                    <Badge variant="secondary">{statusCounts.draft} draft</Badge>
                  )}
                  {statusCounts.published > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {statusCounts.published} published
                    </Badge>
                  )}
                  {statusCounts.archived > 0 && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {statusCounts.archived} archived
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedForms(new Set())}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operation Status */}
      {operationStatus && (
        <Alert className={operationStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {operationStatus.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={operationStatus.success ? 'text-green-800' : 'text-red-800'}>
            {operationStatus.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Bulk Actions */}
      {selectedForms.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Publish/Unpublish */}
              {statusCounts.draft > 0 && (
                <Button
                  onClick={handleBulkPublish}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Publish ({statusCounts.draft})
                </Button>
              )}

              {statusCounts.published > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBulkUnpublish}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Unpublish ({statusCounts.published})
                </Button>
              )}

              {/* Archive */}
              {(statusCounts.draft > 0 || statusCounts.published > 0) && (
                <Button
                  variant="outline"
                  onClick={handleBulkArchive}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </Button>
              )}

              {/* Duplicate */}
              <Button
                variant="outline"
                onClick={handleBulkDuplicate}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>

              {/* Export */}
              <Select onValueChange={handleBulkExport} disabled={isProcessing}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Export CSV</SelectItem>
                  <SelectItem value="json">Export JSON</SelectItem>
                </SelectContent>
              </Select>

              {/* Delete */}
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>

            {isProcessing && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Processing bulk operation...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Forms ({forms.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedForms.size === forms.length && forms.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {forms.map((form) => (
              <div
                key={form.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                  selectedForms.has(form.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedForms.has(form.id)}
                    onCheckedChange={(checked) => handleSelectForm(form.id, checked as boolean)}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{form.title}</h3>
                      <Badge
                        variant={
                          form.status === 'published' ? 'default' :
                          form.status === 'draft' ? 'secondary' : 'outline'
                        }
                        className={
                          form.status === 'published' ? 'bg-green-100 text-green-800' :
                          form.status === 'archived' ? 'bg-gray-100 text-gray-800' : ''
                        }
                      >
                        {form.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {form.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{form.responseCount} responses</span>
                      <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                      <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Bulk Operations Tips</div>
              <ul className="text-blue-800 space-y-1">
                <li>• Select multiple forms using checkboxes to perform bulk actions</li>
                <li>• Use "Select All" to quickly select all forms on the current page</li>
                <li>• Bulk operations cannot be undone - proceed with caution</li>
                <li>• Export operations include all form data and responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

