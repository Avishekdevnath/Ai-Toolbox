"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Search,
  Filter,
  MoreVertical,
  FileDown,
  FileBarChart,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Hash,
  Eye,
  Edit3,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import ResponsesTable from '@/components/forms/ResponsesTable';
import ViewResponseModal from '@/components/forms/ViewResponseModal';
import DeleteConfirmationModal from '@/components/forms/DeleteConfirmationModal';

interface FormResponsesPageProps {
  params: {
    id: string;
  };
}

interface FormData {
  _id: string;
  title: string;
  description?: string;
  fields: {
    id: string;
    label: string;
    type: string;
  }[];
}

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  const router = useRouter();
  const [error, setError] = useState(null);
  const [form, setForm] = useState<FormData | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [totalResponses, setTotalResponses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterFieldId, setFilterFieldId] = useState<string>('');
  const [filterValues, setFilterValues] = useState<string[]>([]);
  const [availableValues, setAvailableValues] = useState<string[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [modalFieldId, setModalFieldId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [valueSearch, setValueSearch] = useState('');

  useEffect(() => {
    fetchFormDetails();
  }, [formId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('#export-dropdown') && !target.closest('#export-button')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFormDetails = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch form details');
      }
      const data = await response.json();
      if (data.success) {
        setForm(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch form details');
      }
    } catch (err: any) {
      console.error('Error fetching form details:', err);
      setError(err.message);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFormDetails();
    setIsRefreshing(false);
  };

  const exportResponses = async (format: string) => {
    if (isExporting) return;
    
    setIsExporting(true);
    setShowExportDropdown(false);
    
    try {
      const params = new URLSearchParams({ export: format });
      if (filterFieldId && filterValues.length > 0) {
        params.set('filterField', filterFieldId);
        params.set('filterValues', JSON.stringify(filterValues));
      }
      if (selectedRowIds.length > 0) {
        params.set('selectedIds', JSON.stringify(selectedRowIds));
      }
      const response = await fetch(`/api/forms/${formId}/responses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      if (format === 'pdf' || format === 'google-docs') {
        const data = await response.json();
        if (format === 'pdf') {
          generatePDF(data.data);
        } else {
          openGoogleDocs(data.data);
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get form owner info for filename
      const formTitle = form?.title || 'Form';
      const ownerUsername = 'Owner'; // You might want to get this from user context
      const sanitizedFormTitle = formTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
      const sanitizedUsername = ownerUsername.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
      
      const filename = `${sanitizedFormTitle}_${sanitizedUsername}_responses.${format === 'excel' ? 'xlsx' : 'csv'}`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = (data: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const { items, form } = data;
    const hasName = items.some((r: any) => r.identity?.name);
    const hasEmail = items.some((r: any) => r.identity?.email);
    const hasStudentId = items.some((r: any) => r.identity?.studentId);

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Form Responses - ${form.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .header { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${form.title}</h1>
          <p><strong>Total Responses:</strong> ${items.length}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Submission Date</th>
              ${hasName ? '<th>Name</th>' : ''}
              ${hasEmail ? '<th>Email</th>' : ''}
              ${hasStudentId ? '<th>Student ID</th>' : ''}
              ${form.fields.map((f: any) => `<th>${f.label || f.id}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    items.forEach((item: any, index: number) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${new Date(item.submittedAt || item.createdAt).toLocaleString()}</td>
          ${hasName ? `<td>${item.identity?.name || ''}</td>` : ''}
          ${hasEmail ? `<td>${item.identity?.email || ''}</td>` : ''}
          ${hasStudentId ? `<td>${item.identity?.studentId || ''}</td>` : ''}
          ${form.fields.map((f: any) => {
            const value = item.data?.[f.id];
            return `<td>${value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : ''}</td>`;
          }).join('')}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const openGoogleDocs = (data: any) => {
    const { items, form } = data;
    const hasName = items.some((r: any) => r.identity?.name);
    const hasEmail = items.some((r: any) => r.identity?.email);
    const hasStudentId = items.some((r: any) => r.identity?.studentId);

    let content = `Form Responses: ${form.title}\n`;
    content += `Total Responses: ${items.length}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Headers
    const headers = ['#', 'Submission Date'];
    if (hasName) headers.push('Name');
    if (hasEmail) headers.push('Email');
    if (hasStudentId) headers.push('Student ID');
    headers.push(...form.fields.map((f: any) => f.label || f.id));
    content += headers.join('\t') + '\n';

    // Data rows
    items.forEach((item: any, index: number) => {
      const row = [index + 1, new Date(item.submittedAt || item.createdAt).toLocaleString()];
      if (hasName) row.push(item.identity?.name || '');
      if (hasEmail) row.push(item.identity?.email || '');
      if (hasStudentId) row.push(item.identity?.studentId || '');
      
      form.fields.forEach((f: any) => {
        const value = item.data?.[f.id];
        row.push(value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : '');
      });
      
      content += row.join('\t') + '\n';
    });

    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard! You can paste it into the new Google Doc.');
    }).catch(() => {
      alert('Google Docs opened! Please copy the data manually.');
    });
  };

  const updateTotalResponses = (total: number) => {
    setTotalResponses(total);
  };

  // Modal handlers
  const handleViewResponse = (response: any) => {
    setSelectedResponse(response);
    setViewModalOpen(true);
  };

  const handleDeleteResponse = (response: any) => {
    setSelectedResponse(response);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedResponse) return;
    
    setIsDeleting(true);
    try {
      const response_api = await fetch(`/api/forms/${formId}/responses/${selectedResponse._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response_api.ok) {
        throw new Error('Failed to delete response');
      }

      // Refresh the page data
      await fetchFormDetails();
      setDeleteModalOpen(false);
      setSelectedResponse(null);
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Failed to delete response. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/forms')}
            className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  // Build available option values when field changes using a lightweight fetch to first page
  useEffect(() => {
    const loadValues = async () => {
      setAvailableValues([]);
      if (!filterFieldId) return;
      try {
        const res = await fetch(`/api/forms/${formId}/responses?page=1&limit=100&sortField=submittedAt&sortDirection=desc`);
        const data = await res.json();
        if (data?.success) {
          const items = data.data.items || [];
          const setVals = new Set<string>();
          items.forEach((it: any) => {
            const v = it?.data?.[filterFieldId];
            if (Array.isArray(v)) v.forEach((x: any) => setVals.add(String(x)));
            else if (v !== undefined && v !== null) setVals.add(String(v));
          });
          setAvailableValues(Array.from(setVals));
        }
      } catch {}
    };
    loadValues();
  }, [filterFieldId, formId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard/forms')} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileBarChart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {form?.title || 'Form Responses'}
                  </h1>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Hash size={12} />
                      <span>{totalResponses} {totalResponses === 1 ? 'response' : 'responses'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => router.push(`/dashboard/forms/${formId}/edit`)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Edit3 size={14} />
                <span className="font-medium">Edit Form</span>
              </button>

              <div className="relative">
                <button
                  id="export-button"
                  className="flex items-center space-x-2 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={isExporting}
                >
                  <Download size={14} />
                  <span>Export</span>
                  <Filter size={12} className="ml-1" />
                </button>
                
                {showExportDropdown && (
                  <div 
                    id="export-dropdown"
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="py-2">
                      <button
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        onClick={() => exportResponses('csv')}
                        disabled={isExporting}
                      >
                        <FileDown size={16} className="text-gray-500" />
                        <span>Download CSV</span>
                      </button>
                      <button
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        onClick={() => exportResponses('excel')}
                        disabled={isExporting}
                      >
                        <FileSpreadsheet size={16} className="text-gray-500" />
                        <span>Download Excel</span>
                      </button>
                      <button
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        onClick={() => exportResponses('pdf')}
                        disabled={isExporting}
                      >
                        <FileText size={16} className="text-gray-500" />
                        <span>Generate PDF</span>
                      </button>
                      <button
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                        onClick={() => exportResponses('google-docs')}
                        disabled={isExporting}
                      >
                        <FileBarChart size={16} className="text-gray-500" />
                        <span>Copy for Google Docs</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3">
        {/* Search and Filters */}
        <div className="mb-3">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-3 gap-2">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search responses..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-800 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500">Zoom</span>
              <button
                className="px-2 py-1 border border-gray-300 rounded-md text-xs"
                onClick={() => setZoom(z => Math.max(50, z - 5))}
                title="Zoom out"
              >
                -
              </button>
              <span className="w-10 text-center text-xs text-gray-700">{zoom}%</span>
              <button
                className="px-2 py-1 border border-gray-300 rounded-md text-xs"
                onClick={() => setZoom(z => Math.min(150, z + 5))}
                title="Zoom in"
              >
                +
              </button>
              <button
                className="px-2 py-1 border border-gray-300 rounded-md text-xs"
                onClick={() => setZoom(100)}
                title="Reset zoom"
              >
                100%
              </button>
            </div>
          </div>
        </div>

        {/* Filters Modal */}
        {(showFiltersModal || modalFieldId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowFiltersModal(false); setModalFieldId(null); }}></div>
            <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">Select values</div>
                <button className="text-gray-500 text-sm" onClick={() => { setShowFiltersModal(false); setModalFieldId(null); }}>Close</button>
              </div>
              <div className="mb-2">
                <input
                  value={valueSearch}
                  onChange={(e) => setValueSearch(e.target.value)}
                  placeholder="Search values"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="max-h-64 overflow-auto border border-gray-100 rounded-md">
                {availableValues
                  .filter(v => v.toLowerCase().includes(valueSearch.toLowerCase()))
                  .map(v => {
                    const active = filterValues.includes(v);
                    return (
                      <label key={v} className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${active ? 'bg-gray-50' : ''}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFilterValues(prev => checked ? Array.from(new Set([...(prev||[]), v])) : prev.filter(x => x !== v));
                            }}
                          />
                          <span className="truncate max-w-[340px]">{v}</span>
                        </div>
                      </label>
                    );
                  })}
                {availableValues.length === 0 && (
                  <div className="p-3 text-xs text-gray-500">No values available for this field yet</div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">{filterValues.length} selected</div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 border border-gray-300 rounded-md" onClick={() => setFilterValues([])}>Clear</button>
                  <button className="text-xs px-3 py-1.5 bg-black text-white rounded-md" onClick={() => { setShowFiltersModal(false); setModalFieldId(null); }}>Apply</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responses Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="w-full"
            style={{ 
              transform: `scale(${zoom/100})`, 
              transformOrigin: 'top left',
              width: zoom < 100 ? `${100/zoom * 100}%` : '100%',
              minWidth: '100%'
            }}
          >
            <ResponsesTable 
              formId={formId} 
              form={form}
              searchTerm={searchTerm}
              filterFieldId={filterFieldId}
              filterValues={filterValues}
              updateTotalResponses={updateTotalResponses}
              onSelectionChange={setSelectedRowIds}
              onQuickFilter={(fid, vals) => { setFilterFieldId(fid); setFilterValues(vals || []); setShowFiltersModal(false); setModalFieldId(null); }}
              onOpenFilterModal={(fid) => { setFilterFieldId(fid); setModalFieldId(fid); setShowFiltersModal(true); setValueSearch(''); }}
              onViewResponse={handleViewResponse}
              onDeleteResponse={handleDeleteResponse}
            />
          </div>
        </div>
      </div>

      {/* View Response Modal */}
      <ViewResponseModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedResponse(null);
        }}
        response={selectedResponse}
        formFields={form?.fields || []}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedResponse(null);
        }}
        onConfirm={confirmDelete}
        response={selectedResponse}
        isDeleting={isDeleting}
      />
    </div>
  );
}