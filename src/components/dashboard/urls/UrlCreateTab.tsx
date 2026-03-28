"use client";

interface Analytics {
  totalUrls: number;
  totalClicks: number;
  activeUrls: number;
  averageClicks: number;
}

interface Props {
  originalUrl: string;
  setOriginalUrl: (v: string) => void;
  customAlias: string;
  setCustomAlias: (v: string) => void;
  expiresInDays: number | undefined;
  setExpiresInDays: (v: number | undefined) => void;
  expiresAt: string;
  setExpiresAt: (v: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  baseUrl: string;
  analytics: Analytics | null;
}

const statItems = (a: Analytics) => [
  { label: 'Total URLs', value: a.totalUrls, color: 'text-blue-600' },
  { label: 'Total Clicks', value: a.totalClicks, color: 'text-green-600' },
  { label: 'Active URLs', value: a.activeUrls, color: 'text-violet-600' },
  { label: 'Avg Clicks', value: a.averageClicks, color: 'text-orange-500' },
];

export default function UrlCreateTab({ originalUrl, setOriginalUrl, customAlias, setCustomAlias, expiresInDays, setExpiresInDays, expiresAt, setExpiresAt, isLoading, onSubmit, baseUrl, analytics }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-4">Create Short URL</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1.5">Destination URL</label>
            <input type="url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://example.com/very-long-url"
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1.5">Custom Alias (optional)</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-muted)] text-[12px] rounded-l-lg">{baseUrl}/</span>
              <input type="text" value={customAlias} onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))} placeholder="my-link" maxLength={20}
                className="flex-1 border border-[var(--color-border)] rounded-r-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1.5">Expiration</label>
            <select value={expiresInDays || ''} onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="">No expiration</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
          <button onClick={onSubmit} disabled={!originalUrl.trim() || isLoading}
            className="w-full h-9 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isLoading ? 'Creating...' : 'Create Short URL'}
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-4">Overview</h2>
        {analytics ? (
          <div className="grid grid-cols-2 gap-3">
            {statItems(analytics).map(s => (
              <div key={s.label} className="bg-[var(--color-surface-secondary)] rounded-lg p-4">
                <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
