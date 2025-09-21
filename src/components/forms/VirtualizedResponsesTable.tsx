'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Search,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Eye,
  Trash2,
  Copy
} from 'lucide-react';

interface ResponseData {
  id: string;
  submittedAt: string;
  responder?: {
    name?: string;
    email?: string;
    studentId?: string;
  };
  answers: Array<{
    fieldId: string;
    fieldLabel: string;
    value: any;
  }>;
  score?: number;
  durationMs?: number;
}

interface VirtualizedResponsesTableProps {
  formId: string;
  totalResponses: number;
  fields: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  onExport?: (format: 'csv' | 'json') => void;
  onDelete?: (responseIds: string[]) => void;
  onView?: (responseId: string) => void;
  className?: string;
}

export default function VirtualizedResponsesTable({
  formId,
  totalResponses,
  fields,
  onExport,
  onDelete,
  onView,
  className = ''
}: VirtualizedResponsesTableProps) {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  // Load responses for current page
  const loadResponses = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/forms/${formId}/responses?page=${page}&limit=${size}&search=${encodeURIComponent(searchTerm)}&sort=${sortField}&order=${sortDirection}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setResponses(data.data.items);
      }
    } catch (error) {
      console.error('Failed to load responses:', error);
    } finally {
      setLoading(false);
    }
  }, [formId, searchTerm, sortField, sortDirection]);

  // Load responses when dependencies change
  useEffect(() => {
    loadResponses(currentPage, pageSize);
  }, [currentPage, pageSize, loadResponses]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0); // Reset to first page when searching
      loadResponses(0, pageSize);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, loadResponses, pageSize]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(0);
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResponses(new Set(responses.map(r => r.id)));
    } else {
      setSelectedResponses(new Set());
    }
  };

  const handleSelectResponse = (responseId: string, checked: boolean) => {
    const newSelected = new Set(selectedResponses);
    if (checked) {
      newSelected.add(responseId);
    } else {
      newSelected.delete(responseId);
    }
    setSelectedResponses(newSelected);
  };

  // Handle bulk actions
  const handleBulkDelete = () => {
    if (selectedResponses.size > 0 && onDelete) {
      onDelete(Array.from(selectedResponses));
      setSelectedResponses(new Set());
    }
  };

  const handleBulkExport = (format: 'csv' | 'json') => {
    if (onExport) {
      onExport(format);
    }
  };

  // Virtual scrolling calculations
  const rowHeight = 60; // Approximate height per row
  const containerHeight = 600; // Fixed container height
  const totalHeight = totalResponses * rowHeight;
  const visibleRows = Math.ceil(containerHeight / rowHeight);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / rowHeight);
    const end = Math.min(start + visibleRows, totalResponses);

    setVisibleRange({ start, end });

    // Load more data if needed
    const currentEndPage = Math.floor(end / pageSize);
    if (currentEndPage > currentPage && currentEndPage * pageSize < totalResponses) {
      setCurrentPage(currentEndPage);
    }
  };

  // Format cell value based on field type
  const formatCellValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Empty</span>;
    }

    switch (fieldType) {
      case 'checkbox':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value ? 'Yes' : 'No';

      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }

      case 'time':
        try {
          return new Date(value).toLocaleTimeString();
        } catch {
          return value;
        }

      case 'email':
        return <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>;

      default:
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return String(value);
    }
  };

  const totalPages = Math.ceil(totalResponses / pageSize);
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalResponses);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Responses ({totalResponses.toLocaleString()})</CardTitle>
          <div className="flex items-center gap-2">
            {selectedResponses.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedResponses.size} selected</Badge>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
            <Select onValueChange={handleBulkExport}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export CSV</SelectItem>
                <SelectItem value="json">Export JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search responses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
              <SelectItem value="250">250 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Virtualized Table Container */}
        <div
          className="border rounded-md overflow-hidden"
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={responses.length > 0 && selectedResponses.size === responses.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('submittedAt')}
                >
                  <div className="flex items-center gap-2">
                    Submitted
                    {sortField === 'submittedAt' && (
                      sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                    )}
                  </div>
                </TableHead>
                {fields.slice(0, 5).map(field => (
                  <TableHead
                    key={field.id}
                    className="cursor-pointer hover:bg-gray-50 max-w-48"
                    onClick={() => handleSort(field.id)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {field.label}
                      {sortField === field.id && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={fields.length + 3} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      Loading responses...
                    </div>
                  </TableCell>
                </TableRow>
              ) : responses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={fields.length + 3} className="text-center py-12 text-gray-500">
                    No responses found
                  </TableCell>
                </TableRow>
              ) : (
                responses.map((response) => (
                  <TableRow key={response.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedResponses.has(response.id)}
                        onCheckedChange={(checked) => handleSelectResponse(response.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <div className="font-medium">
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">
                          {new Date(response.submittedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    {fields.slice(0, 5).map(field => {
                      const answer = response.answers.find(a => a.fieldId === field.id);
                      return (
                        <TableCell key={field.id} className="max-w-48 truncate">
                          {formatCellValue(answer?.value, field.type)}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onView && (
                          <Button variant="ghost" size="sm" onClick={() => onView(response.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div>
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalResponses.toLocaleString()} responses
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            >
              Previous
            </Button>

            <span className="px-3 py-1 bg-gray-100 rounded">
              Page {currentPage + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

