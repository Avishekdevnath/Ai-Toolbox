"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit, 
  Eye, 
  Share2,
  FileBarChart,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Form {
  _id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
}

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCounts, setSyncingCounts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchForms();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/forms?${params}`, { cache: 'no-store' });
      const data = await response.json();
      
      if (data.success && data.data?.items) {
        const fetched = data.data.items as Form[];
        setForms(fetched);
        // Background refresh using per-form count API to ensure accuracy
        refreshCountsInBackground(fetched);
      } else {
        console.error("Failed to fetch forms:", data.error);
        // Show user-friendly error message
        if (response.status === 503) {
          alert("Database is currently unavailable. Please try again later.");
        } else {
          alert(`Error loading forms: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const refreshCountsInBackground = async (items: Form[]) => {
    try {
      setSyncingCounts(true);
      // Fetch counts concurrently; only proceed for visible items
      const results = await Promise.allSettled(
        items.map(async (f) => {
          const res = await fetch(`/api/forms/${f._id}/responses/count`, { cache: 'no-store' });
          if (!res.ok) return null;
          const json = await res.json();
          if (json?.success && typeof json?.data?.count === 'number') {
            return { id: f._id, count: json.data.count as number };
          }
          return null;
        })
      );
      const idToCount = new Map<string, number>();
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value && typeof r.value.count === 'number') {
          idToCount.set(r.value.id, r.value.count);
        }
      });
      if (idToCount.size === 0) return;
      setForms((prev) =>
        prev.map((f) =>
          idToCount.has(f._id)
            ? { ...f, responseCount: idToCount.get(f._id) as number }
            : f
        )
      );
    } catch (err) {
      // Silent background failure
      console.warn('Background count refresh failed', err);
    } finally {
      setSyncingCounts(false);
    }
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchForms();
      } else {
        console.error("Failed to delete form:", data.error);
      }
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  const publishForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: true }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchForms();
      } else {
        console.error("Failed to publish form:", data.error);
      }
    } catch (error) {
      console.error("Error publishing form:", error);
    }
  };

  const unpublishForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: false }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchForms();
      } else {
        console.error("Failed to unpublish form:", data.error);
      }
    } catch (error) {
      console.error("Error unpublishing form:", error);
    }
  };

  const duplicateForm = async (id: string) => {
    try {
      // Fetch the form to duplicate
      const res = await fetch(`/api/forms/${id}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        const formData = data.data;
        
        // Create a new form with the same data
        const newFormData = {
          title: `${formData.title} (Copy)`,
          description: formData.description,
          type: formData.type,
          fields: formData.fields,
          settings: formData.settings,
          submissionPolicy: formData.submissionPolicy,
          status: 'draft'
        };
        
        const createRes = await fetch("/api/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newFormData),
        });
        
        const createData = await createRes.json();
        
        if (createData.success) {
          fetchForms();
        } else {
          console.error("Failed to duplicate form:", createData.error);
        }
      } else {
        console.error("Failed to fetch form to duplicate:", data.error);
      }
    } catch (error) {
      console.error("Error duplicating form:", error);
    }
  };

  const copyShareLink = (id: string, slug: string) => {
    const baseUrl = window.location.origin;
    const shareUrl = slug ? `${baseUrl}/f/${slug}` : `${baseUrl}/f/${id}`;
    
    if (document.hasFocus() && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert("Share link copied to clipboard!"))
        .catch(err => console.error("Failed to copy share link:", err));
    } else {
      // Fallback: open a prompt so user can copy manually
      window.prompt('Copy link to clipboard:', shareUrl);
    }
  };

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'general': return 'General';
      case 'survey': return 'Survey';
      case 'quiz': return 'Quiz';
      case 'attendance': return 'Attendance';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" /> Published</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1" /> Archived</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Forms</h1>
          <p className="text-sm text-gray-600 mt-1">Create, manage and analyze your forms</p>
        </div>
        <div>
          <Link
            href="/dashboard/forms/create"
            className="inline-flex items-center px-4 py-2 bg-black text-white text-sm rounded-md font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="survey">Survey</option>
                <option value="quiz">Quiz</option>
                <option value="attendance">Attendance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Forms List */}
      {forms.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-white rounded-lg shadow">
          <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileBarChart className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No forms found</h3>
          <p className="text-sm text-gray-500 mb-6 px-4">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first form"
            }
          </p>
          <Link
            href="/dashboard/forms/create"
            className="inline-flex items-center px-4 py-2 bg-black text-white text-sm rounded-md font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </div>
      ) : (
        <>
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    Responses
                    {syncingCounts && (
                      <div className="ml-2 flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
                        <span className="ml-1 text-xs text-gray-400">syncing...</span>
                      </div>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {forms.map((form, idx) => (
                <tr key={form._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">{form.title}</div>
                        {form.description && (
                          <div className="text-xs text-gray-500 max-w-xs truncate">{form.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getFormTypeLabel(form.type)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(form.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(form.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{form.responseCount ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <Link
                        href={`/dashboard/forms/${form._id}/edit`}
                        className="p-1 text-gray-600 hover:text-black"
                      >
                        <Edit size={18} />
                      </Link>
                      <Link
                        href={`/dashboard/forms/${form._id}/responses`}
                        className="p-1 text-gray-600 hover:text-black"
                      >
                        <FileBarChart size={18} />
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => toggleMenu(form._id)}
                          className="p-1 text-gray-600 hover:text-black"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openMenuId === form._id && (
                          <div className="absolute right-0 z-50 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-100">
                            <button
                              onClick={() => copyShareLink(form._id, form.slug)}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Share2 size={16} className="mr-2" />
                              Copy share link
                            </button>
                            <Link
                              href={form.slug ? `/f/${form.slug}` : `/f/${form._id}`}
                              target="_blank"
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye size={16} className="mr-2" />
                              Preview
                            </Link>
                            <button
                              onClick={() => duplicateForm(form._id)}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy size={16} className="mr-2" />
                              Duplicate
                            </button>
                            <Link
                              href="/dashboard/forms/create"
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Plus size={16} className="mr-2" />
                              New Form
                            </Link>
                            {form.status !== 'published' ? (
                              <button
                                onClick={() => publishForm(form._id)}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CheckCircle size={16} className="mr-2" />
                                Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => unpublishForm(form._id)}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle size={16} className="mr-2" />
                                Unpublish
                              </button>
                            )}
                            <button
                              onClick={() => deleteForm(form._id)}
                              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {forms.map((form, idx) => (
            <div key={form._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">#{idx + 1}</span>
                    {getStatusBadge(form.status)}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">{form.title}</h3>
                  {form.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{form.description}</p>
                  )}
                </div>
                <div className="relative ml-2">
                  <button
                    onClick={() => toggleMenu(form._id)}
                    className="p-1 text-gray-600 hover:text-black"
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {openMenuId === form._id && (
                    <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100">
                      <button
                        onClick={() => copyShareLink(form._id, form.slug)}
                        className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        <Share2 size={14} className="mr-2" />
                        Copy share link
                      </button>
                      <Link
                        href={form.slug ? `/f/${form.slug}` : `/f/${form._id}`}
                        target="_blank"
                        className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        <Eye size={14} className="mr-2" />
                        Preview
                      </Link>
                      <button
                        onClick={() => duplicateForm(form._id)}
                        className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        <Copy size={14} className="mr-2" />
                        Duplicate
                      </button>
                      <Link
                        href="/dashboard/forms/create"
                        className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                      >
                        <Plus size={14} className="mr-2" />
                        New Form
                      </Link>
                      {form.status !== 'published' ? (
                        <button
                          onClick={() => publishForm(form._id)}
                          className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          <CheckCircle size={14} className="mr-2" />
                          Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => unpublishForm(form._id)}
                          className="w-full flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          <XCircle size={14} className="mr-2" />
                          Unpublish
                        </button>
                      )}
                      <button
                        onClick={() => deleteForm(form._id)}
                        className="w-full flex items-center px-3 py-2 text-xs text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-3">
                <div>
                  <span className="font-medium">Type:</span> {getFormTypeLabel(form.type)}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {formatDate(form.createdAt)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Responses:</span>
                    <span className="text-sm font-medium text-gray-900">{form.responseCount ?? 0}</span>
                    {syncingCounts && (
                      <div className="ml-1 flex items-center">
                        <div className="animate-spin rounded-full h-2 w-2 border-b border-gray-400"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dashboard/forms/${form._id}/edit`}
                    className="p-1 text-gray-600 hover:text-black"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Link>
                  <Link
                    href={`/dashboard/forms/${form._id}/responses`}
                    className="p-1 text-gray-600 hover:text-black"
                    title="View Responses"
                  >
                    <FileBarChart size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}