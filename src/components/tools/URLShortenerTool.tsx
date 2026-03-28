'use client';

import { useState, useEffect } from 'react';
import {
  Link2, Copy, Check, Share2, QrCode, Trash2, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, MousePointerClick,
  Clock, X, LogIn, Zap
} from 'lucide-react';
import {
  createShortenedUrl,
  getShortenedUrls,
  deleteShortenedUrl,
  copyToClipboard,
  shareUrl,
  generateQRCodeUrl,
  DisplayUrl
} from '@/lib/urlShortenerService';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface Analytics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  averageClicks: number;
}

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

export default function URLShortenerTool() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [urls, setUrls] = useState<DisplayUrl[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [error, setError] = useState('');

  const [newUrl, setNewUrl] = useState<DisplayUrl | null>(null);
  const [newUrlCopied, setNewUrlCopied] = useState(false);
  const [newUrlShowQR, setNewUrlShowQR] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (typeof window !== 'undefined') setBaseUrl(window.location.origin);
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      setIsLoadingUrls(true);
      const res = await getShortenedUrls({ limit: 50, activeOnly: false });
      setUrls(res.data);
      computeAnalytics(res.data);
    } catch {
      // silent — list stays empty
    } finally {
      setIsLoadingUrls(false);
    }
  };

  const computeAnalytics = (data: DisplayUrl[]) => {
    const totalUrls = data.length;
    const totalClicks = data.reduce((s, u) => s + u.clicks, 0);
    const activeUrls = data.filter(u => !u.isExpired).length;
    const averageClicks = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0;
    setAnalytics({ totalUrls, totalClicks, activeUrls, averageClicks });
  };

  const handleShorten = async () => {
    const url = originalUrl.trim();
    if (!url) { setError('Please enter a URL'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await createShortenedUrl({
        originalUrl: url,
        customAlias: customAlias.trim() || undefined,
        expiresAt: expiresAt || undefined,
        expiresInDays: expiresAt ? undefined : (expiresInDays || undefined),
      });
      const created = res.data;
      setUrls(prev => [created, ...prev]);
      computeAnalytics([created, ...urls]);
      setNewUrl(created);
      setNewUrlCopied(false);
      setNewUrlShowQR(false);
      setOriginalUrl('');
      setCustomAlias('');
      setExpiresInDays(undefined);
      setExpiresAt('');
      setShowAdvanced(false);
      fetch('/api/tools/url-shortener/track-usage', { method: 'POST' }).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, id?: string) => {
    const ok = await copyToClipboard(text);
    if (ok && id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this link?')) return;
    try {
      await deleteShortenedUrl(id);
      const updated = urls.filter(u => u._id?.toString() !== id);
      setUrls(updated);
      computeAnalytics(updated);
      if (newUrl?._id?.toString() === id) setNewUrl(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Stats bar ── */}
      {analytics && analytics.totalUrls > 0 && (
        <div className="flex items-center gap-5 text-[12px] text-slate-500 px-1">
          <span className="flex items-center gap-1.5">
            <Link2 size={11} className="text-slate-400" />
            <span><strong className="text-slate-700 font-semibold">{analytics.totalUrls}</strong> links</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MousePointerClick size={11} className="text-slate-400" />
            <span><strong className="text-slate-700 font-semibold">{analytics.totalClicks}</strong> clicks</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={11} className="text-slate-400" />
            <span><strong className="text-slate-700 font-semibold">{analytics.activeUrls}</strong> active</span>
          </span>
        </div>
      )}

      {/* ── Input card ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all bg-white">
              <Link2 size={14} className="text-slate-400 shrink-0" />
              <input
                type="url"
                value={originalUrl}
                onChange={e => { setOriginalUrl(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleShorten()}
                placeholder="Paste a long URL to shorten…"
                className="flex-1 py-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              {originalUrl && (
                <button onClick={() => setOriginalUrl('')} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={handleShorten}
              disabled={!originalUrl.trim() || isLoading}
              className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Zap size={13} />
              )}
              {isLoading ? 'Shortening…' : 'Shorten'}
            </button>
          </div>

          {error && (
            <p className="text-[12px] text-red-500 mt-2 pl-1">{error}</p>
          )}
        </div>

        {/* Advanced options toggle */}
        <button
          onClick={() => setShowAdvanced(v => !v)}
          className="w-full flex items-center gap-1.5 px-4 py-2.5 text-[12px] text-slate-400 hover:text-slate-600 border-t border-slate-100 hover:bg-slate-50 transition-colors"
        >
          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Advanced options
          {(customAlias || expiresInDays || expiresAt) && (
            <span className="ml-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />
          )}
        </button>

        {showAdvanced && (
          <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
            {/* Custom alias */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Custom alias
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400">
                <span className="px-3 py-2 text-[12px] text-slate-400 bg-slate-50 border-r border-slate-200 shrink-0 whitespace-nowrap">
                  {baseUrl}/
                </span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={e => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  placeholder="my-link"
                  maxLength={20}
                  className="flex-1 px-3 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Letters, numbers, hyphens and underscores only</p>
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                Expiration
              </label>
              <div className="flex gap-2">
                <select
                  value={expiresInDays || ''}
                  onChange={e => { setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined); setExpiresAt(''); }}
                  className="flex-1 px-3 py-2 text-[13px] text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                >
                  <option value="">Never expires</option>
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => { setExpiresAt(e.target.value); setExpiresInDays(undefined); }}
                  className="flex-1 px-3 py-2 text-[13px] text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Exact date takes precedence over duration</p>
            </div>
          </div>
        )}
      </div>

      {/* ── New URL result card ── */}
      {newUrl && (
        <div className="bg-white border border-green-200 rounded-xl p-4 relative">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[13px] font-semibold text-slate-800">Link created</span>
            </div>
            <button onClick={() => setNewUrl(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Short URL row */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 mb-3">
            <a
              href={newUrl.shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-[14px] font-semibold text-blue-600 hover:text-blue-700 font-mono truncate"
            >
              {newUrl.shortenedUrl}
            </a>
            <button
              onClick={async () => {
                const ok = await copyToClipboard(newUrl.shortenedUrl);
                if (ok) { setNewUrlCopied(true); setTimeout(() => setNewUrlCopied(false), 2000); }
              }}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium rounded-md transition-colors"
            >
              {newUrlCopied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
              {newUrlCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Original URL */}
          <p className="text-[11px] text-slate-400 truncate mb-3 pl-1">
            → {newUrl.originalUrl}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => shareUrl(newUrl.shortenedUrl, 'Check out this link')}
              className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Share2 size={12} /> Share
            </button>
            <span className="text-slate-200">·</span>
            <button
              onClick={() => setNewUrlShowQR(v => !v)}
              className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
            >
              <QrCode size={12} /> QR code
            </button>
            <span className="text-slate-200">·</span>
            <button
              onClick={() => handleDelete(newUrl._id?.toString()!)}
              className="flex items-center gap-1.5 text-[12px] text-red-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          {newUrlShowQR && (
            <div className="mt-3 flex justify-center p-3 bg-white rounded-lg border border-slate-100">
              <img
                src={generateQRCodeUrl(newUrl.shortenedUrl)}
                alt="QR Code"
                className="w-36 h-36"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Anonymous notice ── */}
      {!isAuthenticated && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
          <LogIn size={13} className="text-slate-400 shrink-0" />
          <p className="text-[12px] text-slate-500 flex-1">
            Your links are saved to this browser.{' '}
            <a href="/sign-in" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>{' '}
            for cross-device sync and advanced analytics.
          </p>
        </div>
      )}

      {/* ── Links list ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            Your links {!isLoadingUrls && urls.length > 0 && `· ${urls.length}`}
          </p>
          <button
            onClick={loadUrls}
            disabled={isLoadingUrls}
            className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={isLoadingUrls ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {isLoadingUrls ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : urls.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link2 size={16} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-600 mb-1">No links yet</p>
            <p className="text-[12px] text-slate-400">Paste a URL above to create your first short link.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {urls.map(url => {
              const id = url._id?.toString() || url.shortCode;
              const isCopied = copiedId === id;
              const isQROpen = showQR === id;

              return (
                <div
                  key={id}
                  className={`bg-white border rounded-xl p-4 transition-colors ${
                    url.isExpired ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Domain favicon placeholder */}
                    <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {extractDomain(url.originalUrl).charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Short URL + actions */}
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={url.shortenedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setTimeout(loadUrls, 1200)}
                          className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 font-mono truncate"
                        >
                          {url.shortenedUrl.replace(/^https?:\/\//, '')}
                        </a>
                        {url.isExpired && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-medium border border-red-100">
                            Expired
                          </span>
                        )}
                        <a
                          href={url.shortenedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      {/* Original URL */}
                      <p className="text-[11px] text-slate-400 truncate mb-2">
                        {url.originalUrl}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MousePointerClick size={10} />
                          {url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {timeAgo(url.createdAt)}
                        </span>
                        {url.expiresAt && !url.isExpired && (
                          <span className="text-amber-500 flex items-center gap-1">
                            <Clock size={10} />
                            Expires {timeAgo(url.expiresAt).replace(' ago', '')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(url.shortenedUrl, id)}
                        title="Copy"
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                          isCopied
                            ? 'bg-green-50 text-green-600'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isCopied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => shareUrl(url.shortenedUrl, 'Check out this link')}
                        title="Share"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Share2 size={12} />
                      </button>
                      <button
                        onClick={() => setShowQR(isQROpen ? null : id)}
                        title="QR code"
                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                          isQROpen ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <QrCode size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* QR Code */}
                  {isQROpen && (
                    <div className="mt-3 flex justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <img
                        src={generateQRCodeUrl(url.shortenedUrl)}
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
