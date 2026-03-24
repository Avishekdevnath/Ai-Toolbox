"use client";

import { useState, useCallback } from "react";

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
}

export function useFormsData({ searchTerm, statusFilter, typeFilter }: Opts) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingCounts, setSyncingCounts] = useState(false);

  const fetchForms = useCallback(async () => {
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
        refreshCounts(fetched);
      } else {
        if (response.status === 503) alert("Database is currently unavailable. Please try again later.");
        else alert(`Error loading forms: ${data.error || 'Unknown error'}`);
      }
    } catch { alert("Network error. Please check your connection and try again."); }
    finally { setLoading(false); }
  }, [searchTerm, statusFilter, typeFilter]);

  const refreshCounts = async (items: Form[]) => {
    try {
      setSyncingCounts(true);
      const results = await Promise.allSettled(items.map(async (f) => {
        const res = await fetch(`/api/forms/${f._id}/responses/count`, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.success && typeof json?.data?.count === 'number' ? { id: f._id, count: json.data.count as number } : null;
      }));
      const map = new Map<string, number>();
      results.forEach((r) => { if (r.status === 'fulfilled' && r.value) map.set(r.value.id, r.value.count); });
      if (map.size > 0) setForms((prev) => prev.map((f) => map.has(f._id) ? { ...f, responseCount: map.get(f._id) } : f));
    } catch (err) { console.warn('Background count refresh failed', err); }
    finally { setSyncingCounts(false); }
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchForms();
    } catch (e) { console.error(e); }
  };

  const publishForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publish: true }) });
      if ((await res.json()).success) fetchForms();
    } catch (e) { console.error(e); }
  };

  const unpublishForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publish: false }) });
      if ((await res.json()).success) fetchForms();
    } catch (e) { console.error(e); }
  };

  const duplicateForm = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const fd = data.data;
        const createRes = await fetch("/api/forms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `${fd.title} (Copy)`, description: fd.description, type: fd.type, fields: fd.fields, settings: fd.settings, submissionPolicy: fd.submissionPolicy, status: 'draft' }) });
        if ((await createRes.json()).success) fetchForms();
      }
    } catch (e) { console.error(e); }
  };

  const copyShareLink = (id: string, slug: string) => {
    const shareUrl = `${window.location.origin}/${slug ? `f/${slug}` : `f/${id}`}`;
    if (document.hasFocus() && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => alert("Share link copied!")).catch(console.error);
    } else {
      window.prompt('Copy link:', shareUrl);
    }
  };

  return { forms, loading, syncingCounts, fetchForms, deleteForm, publishForm, unpublishForm, duplicateForm, copyShareLink };
}
