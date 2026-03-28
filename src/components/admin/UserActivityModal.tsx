'use client';

import { useEffect, useState } from 'react';
import { X, Clock, BarChart2, FileText, Monitor } from 'lucide-react';

interface ActivityData {
  lastSeenAt: string | null;
  totalVisits: number;
  recentPages: { path: string; createdAt: string }[];
  toolsUsed: { slug: string; name: string; count: number }[];
  feedbackCount: number;
}

interface Props { userId: string; userName: string; onClose: () => void }

export default function UserActivityModal({ userId, userName, onClose }: Props) {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}/activity`)
      .then((r) => r.json())
      .then((j) => j.success && setData(j.data))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Activity — {userName}</h2>
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">Last 90 days of tracked activity</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading && <div className="text-[13px] text-[var(--color-text-muted)] text-center py-8">Loading…</div>}
          {!loading && !data && <div className="text-[13px] text-[var(--color-text-muted)] text-center py-8">No activity data found.</div>}
          {data && (
            <>
              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Monitor, label: 'Total visits', value: data.totalVisits },
                  { icon: BarChart2, label: 'Tools used', value: data.toolsUsed.length },
                  { icon: FileText, label: 'Feedback sent', value: data.feedbackCount },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[var(--color-surface-secondary)] rounded-lg p-3 text-center">
                    <Icon className="w-4 h-4 text-[var(--color-text-muted)] mx-auto mb-1" />
                    <p className="text-[18px] font-bold text-[var(--color-text-primary)]">{value}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{label}</p>
                  </div>
                ))}
              </div>

              {data.lastSeenAt && (
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                  <Clock className="w-3.5 h-3.5" />
                  Last seen: {new Date(data.lastSeenAt).toLocaleString()}
                </div>
              )}

              {/* Top tools */}
              {data.toolsUsed.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Top Tools</p>
                  <div className="space-y-1.5">
                    {data.toolsUsed.slice(0, 5).map((t) => (
                      <div key={t.slug} className="flex items-center justify-between text-[12px]">
                        <span className="text-[var(--color-text-secondary)]">{t.name || t.slug}</span>
                        <span className="font-medium text-[var(--color-text-primary)]">{t.count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent pages */}
              {data.recentPages.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Recent Pages</p>
                  <div className="space-y-1">
                    {data.recentPages.slice(0, 10).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px]">
                        <span className="text-[var(--color-text-secondary)] truncate max-w-[70%]">{p.path}</span>
                        <span className="text-[var(--color-text-muted)]">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
