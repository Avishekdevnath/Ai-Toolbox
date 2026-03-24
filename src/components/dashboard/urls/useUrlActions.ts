"use client";

import { useState } from 'react';
import { createShortenedUrl, getShortenedUrls, deleteShortenedUrl, copyToClipboard, shareUrl } from '@/lib/urlShortenerService';
import { DisplayUrl } from '@/lib/urlShortenerService';

export interface Analytics { totalUrls: number; totalClicks: number; activeUrls: number; expiredUrls: number; averageClicks: number; topPerformingUrl?: DisplayUrl; }

export function useUrlActions() {
  const [shortenedUrls, setShortenedUrls] = useState<DisplayUrl[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flash = (fn: typeof setSuccess, msg: string) => { fn(msg); setTimeout(() => fn(''), 3000); };

  const calcAnalytics = (urls: DisplayUrl[]) => {
    const total = urls.length, clicks = urls.reduce((s, u) => s + u.clicks, 0);
    setAnalytics({ totalUrls: total, totalClicks: clicks, activeUrls: urls.filter(u => !u.isExpired).length, expiredUrls: urls.filter(u => u.isExpired).length, averageClicks: total > 0 ? Math.round(clicks / total) : 0, topPerformingUrl: urls[0] });
  };

  const loadUrls = async () => {
    try { setIsLoadingUrls(true); const r = await getShortenedUrls({ limit: 100, activeOnly: false }); setShortenedUrls(r.data); calcAnalytics(r.data); }
    catch { setError('Failed to load your URLs'); }
    finally { setIsLoadingUrls(false); }
  };

  const handleCopy = async (text: string) => { if (await copyToClipboard(text)) flash(setSuccess, 'Copied!'); else setError('Failed to copy'); };
  const handleShare = async (url: string) => { if (await shareUrl(url, 'Check out this link')) flash(setSuccess, 'Shared!'); };

  const handleDelete = async (urlId: string) => {
    if (!confirm('Delete this URL?')) return;
    try { await deleteShortenedUrl(urlId); const updated = shortenedUrls.filter(u => u._id?.toString() !== urlId); setShortenedUrls(updated); calcAnalytics(updated); flash(setSuccess, 'Deleted!'); }
    catch (err: any) { setError(err.message || 'Failed to delete'); }
  };

  const handleBulkDelete = async (selectedUrls: string[], onDone: () => void) => {
    if (!selectedUrls.length || !confirm(`Delete ${selectedUrls.length} URLs?`)) return;
    try { for (const id of selectedUrls) await deleteShortenedUrl(id); setShortenedUrls(p => p.filter(u => !selectedUrls.includes(u._id?.toString() || ''))); flash(setSuccess, `${selectedUrls.length} deleted!`); onDone(); loadUrls(); }
    catch (err: any) { setError(err.message || 'Failed to delete'); }
  };

  const handleBulkExport = (selectedUrls: string[], onDone: () => void) => {
    if (!selectedUrls.length) return;
    const rows = shortenedUrls.filter(u => selectedUrls.includes(u._id?.toString() || ''));
    const csv = [['Short URL','Original URL','Clicks','Created','Expires','Status'], ...rows.map(u => [u.shortenedUrl, u.originalUrl, u.clicks.toString(), new Date(u.createdAt).toLocaleString(), u.expiresAt ? new Date(u.expiresAt).toLocaleString() : 'Never', u.isExpired ? 'Expired' : 'Active'])].map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `urls-${new Date().toISOString().split('T')[0]}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    flash(setSuccess, `Exported ${selectedUrls.length} URLs!`); onDone();
  };

  return { shortenedUrls, setShortenedUrls, analytics, isLoadingUrls, error, setError, success, setSuccess, loadUrls, calcAnalytics, handleCopy, handleShare, handleDelete, handleBulkDelete, handleBulkExport };
}
