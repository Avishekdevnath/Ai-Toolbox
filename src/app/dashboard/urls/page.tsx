'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, X } from 'lucide-react';
import { createShortenedUrl, generateQRCodeUrl } from '@/lib/urlShortenerService';
import UserPreferences from '@/components/tools/UserPreferences';
import UrlCreateTab from '@/components/dashboard/urls/UrlCreateTab';
import UrlManageTab from '@/components/dashboard/urls/UrlManageTab';
import UrlAnalyticsTab from '@/components/dashboard/urls/UrlAnalyticsTab';
import { useUrlActions } from '@/components/dashboard/urls/useUrlActions';

const TABS = [{ key: 'create', label: 'Create URL' }, { key: 'manage', label: 'Manage' }, { key: 'analytics', label: 'Analytics' }] as const;

export default function UserUrlDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'analytics'>('create');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);

  const { shortenedUrls, setShortenedUrls, analytics, isLoadingUrls, error, setError, success, setSuccess, loadUrls, calcAnalytics, handleCopy, handleShare, handleDelete, handleBulkDelete, handleBulkExport } = useUrlActions();

  useEffect(() => {
    checkAuth();
    loadUrls();
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
  }, []);

  const checkAuth = async () => {
    try { const r = await fetch('/api/auth/me'); if (r.ok) setUser(await r.json()); else router.push('/auth/signin'); }
    catch { router.push('/auth/signin'); }
  };

  const shortenUrl = async () => {
    if (!originalUrl.trim()) { setError('Please enter a URL to shorten'); return; }
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      const r = await createShortenedUrl({ originalUrl: originalUrl.trim(), customAlias: customAlias.trim() || undefined, expiresAt: expiresAt || undefined, expiresInDays: expiresAt ? undefined : (expiresInDays || undefined) });
      setShortenedUrls(prev => { const updated = [r.data, ...prev]; calcAnalytics(updated); return updated; });
      setOriginalUrl(''); setCustomAlias(''); setExpiresInDays(undefined); setExpiresAt('');
      setSuccess('URL shortened successfully!'); setTimeout(() => setSuccess(''), 3000);
      fetch('/api/tools/url-shortener/track-usage', { method: 'POST' }).catch(() => {});
    } catch (err: any) { setError(err.message || 'Failed to shorten URL'); }
    finally { setIsLoading(false); }
  };

  const handleSelectUrl = (id: string) => setSelectedUrls(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedUrls(selectedUrls.length === shortenedUrls.length ? [] : shortenedUrls.map(u => u._id?.toString() || ''));
  const clearSelected = () => setSelectedUrls([]);

  if (!user) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">URL Shortener</h1>
          <p className="text-[12px] text-slate-400 mt-0.5">Manage and track your shortened URLs</p>
        </div>
        <button onClick={() => setShowPreferences(true)} className="inline-flex items-center gap-1.5 h-9 px-3 border border-slate-200 text-slate-600 text-[13px] font-medium rounded-lg hover:bg-slate-50 transition-colors">
          <Settings size={14} /> Preferences
        </button>
      </div>

      {error && <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-700"><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}
      {success && <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-[13px] text-green-700"><span>{success}</span><button onClick={() => setSuccess('')}><X size={14} /></button></div>}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${activeTab === tab.key ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab.key === 'manage' ? `Manage (${shortenedUrls.length})` : tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'create' && <UrlCreateTab originalUrl={originalUrl} setOriginalUrl={setOriginalUrl} customAlias={customAlias} setCustomAlias={setCustomAlias} expiresInDays={expiresInDays} setExpiresInDays={setExpiresInDays} expiresAt={expiresAt} setExpiresAt={setExpiresAt} isLoading={isLoading} onSubmit={shortenUrl} baseUrl={baseUrl} analytics={analytics} />}
      {activeTab === 'manage' && <UrlManageTab urls={shortenedUrls} isLoadingUrls={isLoadingUrls} selectedUrls={selectedUrls} showQR={showQR} setShowQR={setShowQR} onCopy={handleCopy} onShare={handleShare} onDelete={handleDelete} onSelectUrl={handleSelectUrl} onSelectAll={handleSelectAll} onBulkDelete={() => handleBulkDelete(selectedUrls, clearSelected)} onBulkExport={() => handleBulkExport(selectedUrls, clearSelected)} onReload={loadUrls} generateQRCodeUrl={generateQRCodeUrl} />}
      {activeTab === 'analytics' && <UrlAnalyticsTab analytics={analytics} />}

      {showPreferences && <UserPreferences onClose={() => setShowPreferences(false)} />}
    </div>
  );
}
