"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileBarChart,
  User,
  Mail,
  Hash,
  Calendar,
  MoreVertical,
  Eye,
  Trash2,
  Download
} from 'lucide-react';

interface ResponsesTableProps {
  formId: string;
  form: any;
  searchTerm: string;
  updateTotalResponses: (total: number) => void;
}

interface FormResponse {
  _id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  identity?: {
    name?: string;
    email?: string;
    studentId?: string;
  };
  submittedAt?: string;
  startedAt?: string;
  durationMs?: number;
  responder?: any;
}

export default function ResponsesTable({ formId, form, searchTerm, updateTotalResponses }: ResponsesTableProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [sortField, setSortField] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [responsesPerPage] = useState(10);

  useEffect(() => {
    fetchResponses();
  }, [formId, page, sortField, sortDirection, searchTerm]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: responsesPerPage.toString(),
        sortField,
        sortDirection,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/forms/${formId}/responses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }

      const data = await response.json();
      if (data.success) {
        const validResponses = data.data.items.filter((response: any) => response && response._id);
        setResponses(validResponses);
        setTotalResponses(data.data.total);
        updateTotalResponses(data.data.total);
      } else {
        throw new Error(data.error || 'Failed to fetch responses');
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      setResponses([]);
      setTotalResponses(0);
      updateTotalResponses(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderFieldValue = (field: any, value: any) => {
    if (!value) return <span className="text-gray-400 italic">Not provided</span>;
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return value.toString();
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp size={14} className="text-blue-600" /> : 
      <ChevronDown size={14} className="text-blue-600" />;
  };

  const handleViewResponse = (response: FormResponse) => {
    // Create a modal or detailed view for the response
    const responseData = {
      id: response._id,
      submittedAt: response.submittedAt || response.createdAt,
      identity: response.identity,
      data: response.data,
      formFields: form?.fields || []
    };
    
    // For now, show in an alert - you can replace this with a modal
    const responseText = JSON.stringify(responseData, null, 2);
    alert(`Response Details:\n\n${responseText}`);
  };

  const handleDownloadResponse = (response: FormResponse) => {
    // Show download options modal or dropdown
    const options = ['PDF', 'CSV', 'Excel'];
    const choice = prompt(`Choose download format:\n1. PDF\n2. CSV\n3. Excel\n\nEnter 1, 2, or 3:`);
    
    if (!choice || !['1', '2', '3'].includes(choice)) {
      return;
    }

    const format = options[parseInt(choice) - 1].toLowerCase();
    
    if (format === 'pdf') {
      downloadResponseAsPDF(response);
    } else if (format === 'csv') {
      downloadResponseAsCSV(response);
    } else if (format === 'excel') {
      downloadResponseAsExcel(response);
    }
  };

  const downloadResponseAsPDF = (response: FormResponse) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const hasName = response.identity?.name;
    const hasEmail = response.identity?.email;
    const hasStudentId = response.identity?.studentId;

    // Get form owner info for filename
    const formTitle = form?.title || 'Form';
    const ownerUsername = response.responder?.username || 'Unknown';
    const sanitizedFormTitle = formTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const sanitizedUsername = ownerUsername.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Response Details - ${formTitle}</title>
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
          <h1>Response Details - ${formTitle}</h1>
          <p><strong>Form Owner:</strong> ${ownerUsername}</p>
          <p><strong>Response ID:</strong> ${response._id}</p>
          <p><strong>Submitted:</strong> ${new Date(response.submittedAt || response.createdAt).toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Submission Date</td>
              <td>${new Date(response.submittedAt || response.createdAt).toLocaleString()}</td>
            </tr>
            ${hasName ? `<tr><td>Name</td><td>${response.identity?.name || 'Not provided'}</td></tr>` : ''}
            ${hasEmail ? `<tr><td>Email</td><td>${response.identity?.email || 'Not provided'}</td></tr>` : ''}
            ${hasStudentId ? `<tr><td>Student ID</td><td>${response.identity?.studentId || 'Not provided'}</td></tr>` : ''}
            ${form?.fields?.filter((f: any) => f.type !== 'section').map((field: any) => {
              const value = response.data?.[field.id];
              return `<tr><td>${field.label || field.id}</td><td>${value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : 'Not provided'}</td></tr>`;
            }).join('') || ''}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadResponseAsCSV = (response: FormResponse) => {
    const hasName = response.identity?.name;
    const hasEmail = response.identity?.email;
    const hasStudentId = response.identity?.studentId;

    // Get form owner info for filename
    const formTitle = form?.title || 'Form';
    const ownerUsername = response.responder?.username || 'Unknown';
    const sanitizedFormTitle = formTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const sanitizedUsername = ownerUsername.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');

    const headers = ['Field', 'Value'];
    const rows = [
      ['Submission Date', new Date(response.submittedAt || response.createdAt).toLocaleString()],
      ...(hasName ? [['Name', response.identity?.name || 'Not provided']] : []),
      ...(hasEmail ? [['Email', response.identity?.email || 'Not provided']] : []),
      ...(hasStudentId ? [['Student ID', response.identity?.studentId || 'Not provided']] : []),
      ...(form?.fields?.filter((f: any) => f.type !== 'section').map((field: any) => {
        const value = response.data?.[field.id];
        return [field.label || field.id, value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : 'Not provided'];
      }) || [])
    ];

    const csvContent = [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedFormTitle}_${sanitizedUsername}_response.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const downloadResponseAsExcel = (response: FormResponse) => {
    // Import xlsx dynamically
    import('xlsx').then((XLSX) => {
      const hasName = response.identity?.name;
      const hasEmail = response.identity?.email;
      const hasStudentId = response.identity?.studentId;

      // Get form owner info for filename
      const formTitle = form?.title || 'Form';
      const ownerUsername = response.responder?.username || 'Unknown';
      const sanitizedFormTitle = formTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
      const sanitizedUsername = ownerUsername.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');

      const headers = ['Field', 'Value'];
      const rows = [
        ['Submission Date', new Date(response.submittedAt || response.createdAt).toLocaleString()],
        ...(hasName ? [['Name', response.identity?.name || 'Not provided']] : []),
        ...(hasEmail ? [['Email', response.identity?.email || 'Not provided']] : []),
        ...(hasStudentId ? [['Student ID', response.identity?.studentId || 'Not provided']] : []),
        ...(form?.fields?.filter((f: any) => f.type !== 'section').map((field: any) => {
          const value = response.data?.[field.id];
          return [field.label || field.id, value ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : 'Not provided'];
        }) || [])
      ];

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Response Details');
      
      XLSX.writeFile(workbook, `${sanitizedFormTitle}_${sanitizedUsername}_response.xlsx`);
    }).catch(() => {
      alert('Excel export requires the xlsx library. Please install it or use CSV/PDF instead.');
    });
  };

  const handleDeleteResponse = async (response: FormResponse) => {
    if (!confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      return;
    }

    try {
      const response_api = await fetch(`/api/forms/${formId}/responses/${response._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response_api.ok) {
        throw new Error('Failed to delete response');
      }

      // Refresh the responses list
      await fetchResponses();
      alert('Response deleted successfully');
    } catch (error) {
      console.error('Error deleting response:', error);
      alert('Failed to delete response. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <Loader2 size={24} className="text-blue-600 animate-spin" />
          <span className="text-gray-600 font-medium">Loading responses...</span>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileBarChart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {searchTerm ? 'No responses match your search criteria' : 'Your form has not received any responses yet'}
        </p>
        <Link
          href={`/f/${formId}`}
          target="_blank"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview Form
        </Link>
      </div>
    );
  }

  // Determine which identity columns to show based on actual data presence
  const hasIdentityName = responses.some(r => typeof r?.identity?.name === 'string' && r.identity.name.trim().length > 0);
  const hasIdentityEmail = responses.some(r => typeof r?.identity?.email === 'string' && r.identity.email.trim().length > 0);
  const hasIdentityStudentId = responses.some(r => typeof r?.identity?.studentId === 'string' && r.identity.studentId.trim().length > 0);

  const totalPages = Math.ceil(totalResponses / responsesPerPage);
  const startIndex = (page - 1) * responsesPerPage;

  return (
    <div className="h-full flex flex-col">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Responses</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Showing {startIndex + 1}-{Math.min(startIndex + responsesPerPage, totalResponses)} of {totalResponses}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Serial number column */}
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12"
              >
                #
              </th>

              {/* Submission Date column */}
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSortChange('submittedAt')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span>Submission Date</span>
                  {getSortIcon('submittedAt')}
                </div>
              </th>

              {/* Identity columns - only show if data exists */}
              {hasIdentityName && (
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSortChange('identity.name')}
                >
                  <div className="flex items-center space-x-1">
                    <User size={12} className="text-gray-400" />
                    <span>Name</span>
                    {getSortIcon('identity.name')}
                  </div>
                </th>
              )}

              {hasIdentityEmail && (
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSortChange('identity.email')}
                >
                  <div className="flex items-center space-x-1">
                    <Mail size={12} className="text-gray-400" />
                    <span>Email</span>
                    {getSortIcon('identity.email')}
                  </div>
                </th>
              )}

              {hasIdentityStudentId && (
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSortChange('identity.studentId')}
                >
                  <div className="flex items-center space-x-1">
                    <Hash size={12} className="text-gray-400" />
                    <span>Student ID</span>
                    {getSortIcon('identity.studentId')}
                  </div>
                </th>
              )}

              {/* Form fields */}
              {form?.fields?.filter((f: any) => f.type !== 'section').map((field: any) => (
                <th
                  key={field.id}
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSortChange(`data.${field.id}`)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{field.label || field.id}</span>
                    {getSortIcon(`data.${field.id}`)}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              <th
                scope="col"
                className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-20"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {responses.map((response, idx) => (
              <tr key={response._id} className="hover:bg-gray-50 transition-colors">
                {/* Serial number */}
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                  {startIndex + idx + 1}
                </td>

                {/* Submission Date */}
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                  {formatDate(response.submittedAt || response.createdAt)}
                </td>

                {/* Identity columns - only show if data exists */}
                {hasIdentityName && (
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    {response.identity?.name || 'Not provided'}
                  </td>
                )}

                {hasIdentityEmail && (
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    <span className="truncate max-w-32">{response.identity?.email || 'Not provided'}</span>
                  </td>
                )}

                {hasIdentityStudentId && (
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    {response.identity?.studentId || 'Not provided'}
                  </td>
                )}

                {/* Form fields */}
                {form?.fields?.filter((f: any) => f.type !== 'section').map((field: any) => (
                  <td key={field.id} className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    <div className="max-w-xs truncate">
                      {renderFieldValue(field, response.data?.[field.id])}
                    </div>
                  </td>
                ))}

                {/* Actions */}
                <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleViewResponse(response)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Response"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      onClick={() => handleDownloadResponse(response)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Download Response"
                    >
                      <Download size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteResponse(response)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Response"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalResponses > responsesPerPage && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className={`relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md ${
                page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className={`ml-3 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md ${
                page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + responsesPerPage, totalResponses)}</span> of{' '}
                <span className="font-medium">{totalResponses}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-1.5 rounded-l-md border border-gray-300 bg-white text-xs font-medium ${
                    page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pageNumber)}
                      className={`relative inline-flex items-center px-3 py-1.5 border text-xs font-medium ${
                        page === pageNumber
                          ? 'z-10 bg-black border-black text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-1.5 rounded-r-md border border-gray-300 bg-white text-xs font-medium ${
                    page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}