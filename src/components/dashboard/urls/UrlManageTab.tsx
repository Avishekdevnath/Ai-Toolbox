"use client";

import { Copy, Share2, QrCode, Trash2, Link2 } from "lucide-react";
import { DisplayUrl } from "@/lib/urlShortenerService";

interface Props {
  urls: DisplayUrl[];
  isLoadingUrls: boolean;
  selectedUrls: string[];
  showQR: string | null;
  setShowQR: (v: string | null) => void;
  onCopy: (text: string) => void;
  onShare: (url: string) => void;
  onDelete: (id: string) => void;
  onSelectUrl: (id: string) => void;
  onSelectAll: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onReload: () => void;
  generateQRCodeUrl: (url: string) => string;
}

export default function UrlManageTab({ urls, isLoadingUrls, selectedUrls, showQR, setShowQR, onCopy, onShare, onDelete, onSelectUrl, onSelectAll, onBulkDelete, onBulkExport, onReload, generateQRCodeUrl }: Props) {
  if (isLoadingUrls) return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 flex items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
    </div>
  );

  if (urls.length === 0) return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
        <Link2 size={20} className="text-blue-600" />
      </div>
      <p className="text-[13px] font-semibold text-slate-800 mb-1">No shortened URLs yet</p>
      <p className="text-[12px] text-slate-400">Create your first shortened URL to get started</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer">
          <input type="checkbox" checked={selectedUrls.length === urls.length && urls.length > 0} onChange={onSelectAll} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          Select all ({selectedUrls.length} selected)
        </label>
        {selectedUrls.length > 0 && (
          <div className="flex gap-2">
            <button onClick={onBulkExport} className="inline-flex items-center gap-1.5 h-8 px-3 border border-slate-200 text-[13px] text-slate-700 rounded-lg hover:bg-slate-50">Export</button>
            <button onClick={onBulkDelete} className="inline-flex items-center gap-1.5 h-8 px-3 bg-red-50 border border-red-200 text-[13px] text-red-600 rounded-lg hover:bg-red-100">Delete ({selectedUrls.length})</button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {urls.map((url) => {
          const id = url._id?.toString() || url.shortCode;
          return (
            <div key={id} className="p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selectedUrls.includes(id)} onChange={() => onSelectUrl(id)} className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <a href={url.shortenedUrl} target="_blank" rel="noopener noreferrer" onClick={() => setTimeout(onReload, 1000)}
                      className="text-blue-600 font-mono text-[13px] hover:underline">{url.shortenedUrl}</a>
                    {url.isExpired && <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-600">Expired</span>}
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={() => onCopy(url.shortenedUrl)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100" title="Copy"><Copy size={13} /></button>
                      <button onClick={() => onShare(url.shortenedUrl)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100" title="Share"><Share2 size={13} /></button>
                      <button onClick={() => setShowQR(showQR === url.shortenedUrl ? null : url.shortenedUrl)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100" title="QR"><QrCode size={13} /></button>
                      <button onClick={() => onDelete(id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-400 truncate">{url.originalUrl}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-400">
                    <span>{url.clicks} clicks</span>
                    <span>Created {new Date(url.createdAt).toLocaleDateString()}</span>
                    {url.expiresAt && <span>Expires {new Date(url.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              {showQR === url.shortenedUrl && (
                <div className="mt-3 pl-7">
                  <img src={generateQRCodeUrl(url.shortenedUrl)} alt="QR Code" className="max-w-[150px] h-auto rounded-lg border border-slate-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
