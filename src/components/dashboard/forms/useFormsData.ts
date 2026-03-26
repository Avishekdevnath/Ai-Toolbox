"use client";

import { useState, useCallback, useRef } from "react";
import { getShareBaseUrl } from "@/utils/url";

export interface Form {
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

interface Opts {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  page: number;
  pageSize: number;
}

export function useFormsData({ searchTerm, statusFilter, typeFilter, page, pageSize }: Opts) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearNotice = useCallback(() => setNotice(null), []);
  const clearError = useCallback(() => setError(null), []);

  const fetchForms = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!silent) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('limit', String(pageSize));
      params.append('offset', String((page - 1) * pageSize));

      const response = await fetch(`/api/forms?${params}`, { cache: 'no-store', signal: controller.signal });
      const data = await response.json();

      if (data.success && data.data?.items) {
        const fetched = (data.data.items as Form[]).map((item) => ({
          ...item,
          status: item.status === 'unpublished' ? 'draft' : item.status,
        }));

        setForms(fetched);
        setTotal(typeof data.data.total === 'number' ? data.data.total : fetched.length);
      } else {
        if (response.status === 503) {
          setError("Database is currently unavailable. Please try again shortly.");
        } else {
          setError(data.error || 'Unable to load forms right now.');
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, page, pageSize]);

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotice('Form deleted successfully.');
        fetchForms({ silent: true });
      } else {
        setError(data.error || 'Failed to delete form.');
      }
    } catch (e) { console.error(e); }
  };

  const publishForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publish: true }) });
      if ((await res.json()).success) {
        setNotice('Form published successfully.');
        fetchForms({ silent: true });
      } else {
        setError('Failed to publish form.');
      }
    } catch (e) { console.error(e); }
  };

  const unpublishForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publish: false }) });
      if ((await res.json()).success) {
        setNotice('Form moved to draft.');
        fetchForms({ silent: true });
      } else {
        setError('Failed to unpublish form.');
      }
    } catch (e) { console.error(e); }
  };

  const duplicateForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const fd = data.data;
        const createRes = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `${fd.title} (Copy)`, description: fd.description, type: fd.type, fields: fd.fields, settings: fd.settings, submissionPolicy: fd.submissionPolicy, status: 'draft' }) });
        if ((await createRes.json()).success) {
          setNotice('Form duplicated successfully.');
          fetchForms({ silent: true });
        } else {
          setError('Failed to duplicate form.');
        }
      }
    } catch (e) { console.error(e); }
  };

  const getFormShareBase = () => getShareBaseUrl();

  const copyShareLink = (id: string, slug: string, overrideUrl?: string) => {
    const shareUrl = overrideUrl || `${getFormShareBase()}/${slug ? `f/${slug}` : `f/${id}`}`;
    if (document.hasFocus() && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => setNotice("Share link copied to clipboard.")).catch(() => setError('Unable to copy share link.'));
    } else {
      window.prompt('Copy link:', shareUrl);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return {
    forms,
    loading,
    total,
    pageCount,
    error,
    notice,
    clearError,
    clearNotice,
    fetchForms,
    deleteForm,
    publishForm,
    unpublishForm,
    duplicateForm,
    copyShareLink,
  };
}
