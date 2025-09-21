'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  Search,
  Filter,
  Settings,
  Grid3X3,
  List,
  LayoutGrid,
  Download,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  EyeOff,
  MoreHorizontal,
  Trash2,
  Copy,
  FileText,
  BarChart3,
  Calendar,
  Clock,
  Users,
  Target,
  Plus,
  CheckCircle,
  X
} from 'lucide-react';

interface FormItem {
  _id: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  responseCount?: number;
  settings?: { startAt?: string; endAt?: string };
  slug?: string;
}

type ViewMode = 'table' | 'grid' | 'cards';
type SortField = 'title' | 'type' | 'status' | 'updatedAt' | 'createdAt' | 'responseCount';
type SortDirection = 'asc' | 'desc';
type TableDensity = 'compact' | 'normal' | 'comfortable';

interface ColumnVisibility {
  title: boolean;
  type: boolean;
  status: boolean;
  responses: boolean;
  updatedAt: boolean;
  createdAt: boolean;
  actions: boolean;
}

export default function FormsList({ statusFilter }: { statusFilter?: 'draft' | 'published' | 'archived' }) {
  const [items, setItems] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [tableDensity, setTableDensity] = useState<TableDensity>('normal');
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    title: true,
    type: true,
    status: true,
    responses: true,
    updatedAt: true,
    createdAt: false,
    actions: true,
  });

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [savingWindow, setSavingWindow] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string>('');
  const [copyingId, setCopyingId] = useState<string>('');
  const [selectedForms, setSelectedForms] = useState<Set<string>>(new Set());

  // Column-wise filters
  const [titleColumnFilter, setTitleColumnFilter] = useState<string>('');
  const [typeColumnFilter, setTypeColumnFilter] = useState<string>('all');
  const [statusColumnFilter, setStatusColumnFilter] = useState<string>('all');
  const [responsesMin, setResponsesMin] = useState<string>('');
  const [responsesMax, setResponsesMax] = useState<string>('');

  // Date formatting
  const formatDate = (iso: string, format: 'short' | 'long' = 'short') => {
    try {
      const d = new Date(iso);
      if (format === 'long') {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
      }).format(d) + ' UTC';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: '2-digit', year: 'numeric'
      }).format(d);
    } catch {
      return iso;
    }
  };

  // Filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search query filter
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter && item.status !== statusFilter) {
        return false;
      }

      // Column-wise filters
      if (titleColumnFilter && !item.title.toLowerCase().includes(titleColumnFilter.toLowerCase())) {
        return false;
      }
      if (typeColumnFilter !== 'all' && item.type !== typeColumnFilter) {
        return false;
      }
      if (!statusFilter) {
        if (statusColumnFilter !== 'all' && item.status !== statusColumnFilter) {
          return false;
        }
      }
      if (responsesMin !== '') {
        const min = parseInt(responsesMin || '0', 10);
        if ((item.responseCount || 0) < min) return false;
      }
      if (responsesMax !== '') {
        const max = parseInt(responsesMax || '0', 10);
        if ((item.responseCount || 0) > max) return false;
      }

      // Column-wise filters
      if (titleColumnFilter && !item.title.toLowerCase().includes(titleColumnFilter.toLowerCase())) {
        return false;
      }
      if (typeColumnFilter !== 'all' && item.type !== typeColumnFilter) {
        return false;
      }
      if (!statusFilter) {
        if (statusColumnFilter !== 'all' && item.status !== statusColumnFilter) {
          return false;
        }
      }
      if (responsesMin !== '') {
        const min = parseInt(responsesMin || '0', 10);
        if ((item.responseCount || 0) < min) return false;
      }
      if (responsesMax !== '') {
        const max = parseInt(responsesMax || '0', 10);
        if ((item.responseCount || 0) > max) return false;
      }

      // Date range filter
      if (dateRange !== 'all') {
        const itemDate = new Date(item.updatedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateRange) {
          case 'today':
            if (daysDiff !== 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle special cases
      if (sortField === 'responseCount') {
        aValue = a.responseCount || 0;
        bValue = b.responseCount || 0;
      }

      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    return filtered;
  }, [items, searchQuery, typeFilter, statusFilter, dateRange, sortField, sortDirection]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / pageSize);

  // Fetch data
  const fetchList = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: sortField,
        order: sortDirection,
      });

      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/forms?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch');

      const forms = (data.data?.items || []).map((x: any) => ({
        ...x,
        _id: String(x._id),
        responseCount: x.responseCount || 0,
        createdAt: x.createdAt || x.updatedAt,
      }));

      setItems(forms);
    } catch (e: any) {
      setError(e.message || 'Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [statusFilter, currentPage, pageSize, sortField, sortDirection]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchList();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedForms(new Set(paginatedItems.map(item => item._id)));
    } else {
      setSelectedForms(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedForms);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedForms(newSelected);
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedForms.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedForms.size} form(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const formId of selectedForms) {
        const res = await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete form');
      }
      setSelectedForms(new Set());
      await fetchList();
    } catch (error) {
      setError('Failed to delete selected forms');
    }
  };

  const handleBulkExport = async (format: 'csv' | 'json') => {
    if (selectedForms.size === 0) return;

    try {
      const formIds = Array.from(selectedForms).join(',');
      window.open(`/api/forms/export?ids=${formIds}&format=${format}`, '_blank');
    } catch (error) {
      setError('Failed to export forms');
    }
  };

  // Get table density styles
  const getTableDensityStyles = () => {
    switch (tableDensity) {
      case 'compact':
        return { header: 'h-8 text-xs', row: 'h-8 text-xs', cell: 'py-1 px-2' };
      case 'comfortable':
        return { header: 'h-12 text-sm', row: 'h-12 text-sm', cell: 'py-3 px-4' };
      default:
        return { header: 'h-10 text-sm', row: 'h-10 text-sm', cell: 'py-2 px-3' };
    }
  };

  const densityStyles = getTableDensityStyles();

  const togglePublish = async (id: string, publish: boolean) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      await fetchList();
    } catch (e: any) {
      setError(e.message || 'Failed to toggle publish');
    }
  };

  const copyPublicLink = async (id: string, slug?: string) => {
    try {
      setCopyingId(id);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const link = `${origin}/f/${slug || id}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      }
    } catch (e) {
      console.error('Failed to copy link:', e);
    } finally {
      setTimeout(() => setCopyingId(''), 1200);
    }
  };

  const deleteForm = async (id: string) => {
    try {
      const isArchivedView = statusFilter === 'archived';
      const message = isArchivedView
        ? 'Permanently delete this form? This cannot be undone.'
        : 'Archive this form? You can restore it later from Archived.';
      if (!confirm(message)) return;
      setDeletingId(id);
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      await fetchList();
    } catch (e: any) {
      setError(e.message || 'Failed to delete form');
    } finally {
      setDeletingId('');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'survey': return <FileText className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      case 'attendance': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Forms</h3>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {filteredAndSortedItems.length}</span>
                <span>Published: {filteredAndSortedItems.filter(i => i.status === 'published').length}</span>
                <span>Draft: {filteredAndSortedItems.filter(i => i.status === 'draft').length}</span>
                {statusFilter && <Badge variant="secondary">{statusFilter} only</Badge>}
            </div>
          </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/forms/new">
                <Button size="sm" className="whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </Link>
          </div>
        </div>
      </div>

        {/* Advanced Controls */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search forms by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex items-center border border-gray-200 rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-l-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">Table Density</div>
                <Select value={tableDensity} onValueChange={(value: TableDensity) => setTableDensity(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-sm font-medium">Visible Columns</div>
                {Object.entries(columnVisibility).map(([key, visible]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={visible}
                    onCheckedChange={(checked) =>
                      setColumnVisibility(prev => ({ ...prev, [key]: checked }))
                    }
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh */}
            <Button variant="outline" size="sm" onClick={() => fetchList()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedForms.size > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-blue-900">
                  {selectedForms.size} form(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkExport('csv')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedForms(new Set())}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        )}
        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
      </div>
          )}

        {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery || typeFilter !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first form to get started'}
              </p>
              <Link href="/dashboard/forms/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </Link>
          </div>
          ) : viewMode === 'table' ? (
            <div className="space-y-4">
              {/* Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={`${densityStyles.header} ${densityStyles.cell} text-left`}>
                          <Checkbox
                            checked={paginatedItems.length > 0 && selectedForms.size === paginatedItems.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        {columnVisibility.title && (
                          <th
                            className={`${densityStyles.header} ${densityStyles.cell} text-left cursor-pointer hover:bg-gray-100`}
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center gap-2">
                              Title
                              {sortField === 'title' && (
                                sortDirection === 'asc' ?
                                  <ChevronUp className="w-4 h-4" /> :
                                  <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {columnVisibility.type && (
                          <th
                            className={`${densityStyles.header} ${densityStyles.cell} text-left cursor-pointer hover:bg-gray-100`}
                            onClick={() => handleSort('type')}
                          >
                            <div className="flex items-center gap-2">
                              Type
                              {sortField === 'type' && (
                                sortDirection === 'asc' ?
                                  <ChevronUp className="w-4 h-4" /> :
                                  <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {columnVisibility.status && (
                          <th
                            className={`${densityStyles.header} ${densityStyles.cell} text-left cursor-pointer hover:bg-gray-100`}
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-2">
                              Status
                              {sortField === 'status' && (
                                sortDirection === 'asc' ?
                                  <ChevronUp className="w-4 h-4" /> :
                                  <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {columnVisibility.responses && (
                          <th
                            className={`${densityStyles.header} ${densityStyles.cell} text-left cursor-pointer hover:bg-gray-100`}
                            onClick={() => handleSort('responseCount')}
                          >
                            <div className="flex items-center gap-2">
                              Responses
                              {sortField === 'responseCount' && (
                                sortDirection === 'asc' ?
                                  <ChevronUp className="w-4 h-4" /> :
                                  <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {columnVisibility.updatedAt && (
                          <th
                            className={`${densityStyles.header} ${densityStyles.cell} text-left cursor-pointer hover:bg-gray-100`}
                            onClick={() => handleSort('updatedAt')}
                          >
                            <div className="flex items-center gap-2">
                              Updated
                              {sortField === 'updatedAt' && (
                                sortDirection === 'asc' ?
                                  <ChevronUp className="w-4 h-4" /> :
                                  <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </th>
                        )}
                        {columnVisibility.actions && (
                          <th className={`${densityStyles.header} ${densityStyles.cell} text-left`}>
                            Actions
                          </th>
                        )}
                </tr>
                {statusFilter !== 'archived' && (
                  <tr className="bg-white border-t border-gray-100">
                    <th className={`${densityStyles.row} ${densityStyles.cell}`}></th>
                    {columnVisibility.title && (
                      <th className={`${densityStyles.row} ${densityStyles.cell}`}>
                        <Input
                          placeholder="Filter title..."
                          value={titleColumnFilter}
                          onChange={(e) => { setTitleColumnFilter(e.target.value); setCurrentPage(1); }}
                          className="h-8"
                        />
                      </th>
                    )}
                    {columnVisibility.type && (
                      <th className={`${densityStyles.row} ${densityStyles.cell}`}>
                        <Select value={typeColumnFilter} onValueChange={(v) => { setTypeColumnFilter(v); setCurrentPage(1); }}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="survey">Survey</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="attendance">Attendance</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </th>
                    )}
                    {columnVisibility.status && (
                      <th className={`${densityStyles.row} ${densityStyles.cell}`}>
                        {statusFilter ? (
                          <span className="text-xs text-gray-600 capitalize">{statusFilter}</span>
                        ) : (
                          <Select value={statusColumnFilter} onValueChange={(v) => { setStatusColumnFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </th>
                    )}
                    {columnVisibility.responses && (
                      <th className={`${densityStyles.row} ${densityStyles.cell}`}>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="min"
                            value={responsesMin}
                            onChange={(e) => { setResponsesMin(e.target.value); setCurrentPage(1); }}
                            className="h-8 w-20"
                          />
                          <Input
                            type="number"
                            placeholder="max"
                            value={responsesMax}
                            onChange={(e) => { setResponsesMax(e.target.value); setCurrentPage(1); }}
                            className="h-8 w-20"
                          />
                        </div>
                      </th>
                    )}
                    {columnVisibility.updatedAt && <th className={`${densityStyles.row} ${densityStyles.cell}`}></th>}
                    {columnVisibility.actions && <th className={`${densityStyles.row} ${densityStyles.cell}`}></th>}
                  </tr>
                )}
              </thead>
              <tbody>
                      {paginatedItems.map((form) => (
                        <tr key={form._id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className={`${densityStyles.row} ${densityStyles.cell}`}>
                            <Checkbox
                              checked={selectedForms.has(form._id)}
                              onCheckedChange={(checked) => handleSelectItem(form._id, checked as boolean)}
                            />
                          </td>
                          {columnVisibility.title && (
                            <td className={`${densityStyles.row} ${densityStyles.cell}`}>
                              <Link
                                href={`/dashboard/forms/${form._id}/edit`}
                                className="font-medium text-gray-900 hover:text-blue-600"
                              >
                                {form.title}
                              </Link>
                            </td>
                          )}
                          {columnVisibility.type && (
                            <td className={`${densityStyles.row} ${densityStyles.cell}`}>
                        <div className="flex items-center gap-2">
                                {getTypeIcon(form.type)}
                                <span className="capitalize">{form.type}</span>
                        </div>
                      </td>
                          )}
                          {columnVisibility.status && (
                            <td className={`${densityStyles.row} ${densityStyles.cell}`}>
                              <Badge className={getStatusColor(form.status)}>
                                {form.status}
                              </Badge>
                            </td>
                          )}
                          {columnVisibility.responses && (
                            <td className={`${densityStyles.row} ${densityStyles.cell}`}>
                              {form.responseCount || 0}
                            </td>
                          )}
                          {columnVisibility.updatedAt && (
                            <td className={`${densityStyles.row} ${densityStyles.cell} text-gray-600`}>
                              {formatDate(form.updatedAt)}
                            </td>
                          )}
                          {columnVisibility.actions && (
                            <td className={`${densityStyles.row} ${densityStyles.cell}`}>
                              {statusFilter === 'archived' ? (
                                <div className="flex flex-wrap items-center gap-3">
                                  <span title="Responses">
                                    <Link href={`/dashboard/forms/${form._id}/responses`}>
                                      <Button variant="outline" size="md" className="w-12 h-12 p-0 rounded-md" aria-label="Responses">
                                        <BarChart3 className="w-6 h-6" />
                                      </Button>
                                    </Link>
                                  </span>
                                  <span title="Analytics">
                                    <Link href={`/dashboard/forms/${form._id}/analytics`}>
                                      <Button variant="outline" size="md" className="w-12 h-12 p-0 rounded-md" aria-label="Analytics">
                                        <Target className="w-6 h-6" />
                                      </Button>
                                    </Link>
                                  </span>
                                  <span title="Copy link">
                                    <Button
                                      variant="outline"
                                      size="md"
                                      className="w-12 h-12 p-0 rounded-md"
                                      aria-label="Copy link"
                                      onClick={() => copyPublicLink(form._id, form.slug)}
                                    >
                                      {copyingId === form._id ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                      ) : (
                                        <Copy className="w-6 h-6" />
                                      )}
                                    </Button>
                                  </span>
                                  <span title="Delete">
                                    <Button
                                      variant="outline"
                                      size="md"
                                      className="w-12 h-12 p-0 rounded-md text-red-600 border-red-300 hover:bg-red-50"
                                      aria-label="Delete"
                                      onClick={() => deleteForm(form._id)}
                                      disabled={deletingId === form._id}
                                    >
                                      <Trash2 className="w-6 h-6" />
                                    </Button>
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Link href={`/dashboard/forms/${form._id}/responses`}>
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                      <BarChart3 className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Link href={`/dashboard/forms/${form._id}/analytics`}>
                                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                      <Target className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => copyPublicLink(form._id, form.slug)}
                                  >
                                    {copyingId === form._id ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0 text-red-600"
                                    onClick={() => deleteForm(form._id)}
                                    disabled={deletingId === form._id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          )}
                    </tr>
                      ))}
              </tbody>
            </table>
                </div>
                          </div>
                          
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} forms
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                            <Button 
                      variant="outline"
                              size="sm" 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                            </Button>
                          </div>
                </div>
              )}
            </div>
          ) : (
            /* Grid/Cards View */
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {paginatedItems.map((form) => (
                <Card key={form._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link
                          href={`/dashboard/forms/${form._id}/edit`}
                          className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                        >
                          {form.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          {getTypeIcon(form.type)}
                          <Badge className={getStatusColor(form.status)}>
                            {form.status}
                          </Badge>
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedForms.has(form._id)}
                        onCheckedChange={(checked) => handleSelectItem(form._id, checked as boolean)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Responses: {form.responseCount || 0}</span>
                        <span>{formatDate(form.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/forms/${form._id}/responses`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Responses
                          </Button>
                        </Link>
                        <Link href={`/dashboard/forms/${form._id}/analytics`}>
                          <Button variant="outline" size="sm">
                            <Target className="w-4 h-4 mr-2" />
                            Analytics
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}