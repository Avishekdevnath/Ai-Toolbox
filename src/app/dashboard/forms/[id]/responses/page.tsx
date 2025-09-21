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
  const [totalResponses, setTotalResponses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      const response = await fetch(`/api/forms/${formId}/responses?export=${format}`);
      
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
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search responses..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 text-sm">
                <Filter size={14} />
                <span className="font-medium">Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ResponsesTable 
            formId={formId} 
            form={form}
            searchTerm={searchTerm}
            updateTotalResponses={updateTotalResponses}
          />
        </div>
      </div>
    </div>
  );
}