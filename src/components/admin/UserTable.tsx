'use client';

import { Users, Eye, Edit, Trash2, Activity, Mail, Crown, Shield, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserRow {
  _id: string; email: string; firstName: string; lastName: string; username?: string;
  role: string; status: string; createdAt: string; updatedAt: string; isAdmin?: boolean;
  activity?: { toolUsageCount?: number; lastActivity?: string | null; toolsUsed?: number; isActive?: boolean };
}

interface Pagination { currentPage: number; totalPages: number; totalUsers: number; hasNextPage: boolean; hasPrevPage: boolean; limit: number; }

interface Props {
  users: UserRow[];
  pagination: Pagination | null;
  currentPage: number;
  onPageChange: (p: number) => void;
  onView: (u: UserRow) => void;
  onEdit: (u: UserRow) => void;
  onAction: (id: string, action: string) => void;
  onCreateFirst: () => void;
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-[var(--color-muted)] text-[var(--color-text-muted)]',
    suspended: 'bg-red-50 text-red-600',
    deleted: 'bg-red-50 text-red-600',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[s] || 'bg-[var(--color-muted)] text-[var(--color-text-muted)]'}`}>{s}</span>;
};

const roleIcon = (role: string) => {
  if (role === 'super_admin') return <Crown className="w-3.5 h-3.5 text-yellow-500" />;
  if (role === 'admin') return <Shield className="w-3.5 h-3.5 text-green-500" />;
  if (role === 'moderator') return <Shield className="w-3.5 h-3.5 text-blue-500" />;
  return <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />;
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function UserTable({ users, pagination, currentPage, onPageChange, onView, onEdit, onAction, onCreateFirst }: Props) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center gap-2">
        <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">All Users</span>
        <span className="ml-1 bg-[var(--color-muted)] text-[var(--color-text-muted)] text-[11px] font-medium rounded-full px-2 py-0.5">{users.length}</span>
      </div>

      {users.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
          <p className="text-[13px] font-medium text-[var(--color-text-secondary)] mb-1">No users found</p>
          <p className="text-[12px] text-[var(--color-text-muted)] mb-4">Get started by creating your first user</p>
          <button onClick={onCreateFirst} className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[13px] px-3 py-2 rounded-lg">
            Create First User
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[var(--color-surface-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  {['User', 'Role', 'Status', 'Activity', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={`${u._id}-${i}`} className="border-b border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                          {[u.firstName, u.lastName].filter(Boolean).map(n => n[0]).join('').toUpperCase() || u.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--color-text-primary)] flex items-center gap-1.5 truncate">
                            {(u.firstName || u.lastName)
                              ? `${u.firstName} ${u.lastName}`.trim()
                              : u.username || u.email.split('@')[0]}
                            {u.isAdmin && <span className="bg-orange-50 text-orange-600 text-[10px] font-medium rounded-full px-1.5 py-0.5 flex-shrink-0">Admin</span>}
                          </div>
                          {u.username && (
                            <div className="text-[11px] text-blue-500 font-medium truncate">@{u.username}</div>
                          )}
                          <div className="text-[11px] text-[var(--color-text-muted)] truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 flex-shrink-0" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                        {roleIcon(u.role)} <span className="capitalize">{u.role.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{statusBadge(u.status)}</td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" /> {u.activity?.toolUsageCount || 0} tools
                      </div>
                      {u.activity?.lastActivity && <div className="text-[11px] text-[var(--color-text-muted)]">Last: {fmt(u.activity.lastActivity)}</div>}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-muted)]">{fmt(u.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onView(u)} title="View" className="p-1.5 rounded hover:bg-[var(--color-muted)] text-[var(--color-text-muted)] transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onEdit(u)} title="Edit" className="p-1.5 rounded hover:bg-[var(--color-muted)] text-[var(--color-text-muted)] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        {u.status === 'active'
                          ? <button onClick={() => onAction(u._id, 'suspend')} className="px-2 py-1 rounded text-[11px] font-medium text-orange-600 hover:bg-orange-50 transition-colors">Suspend</button>
                          : <button onClick={() => onAction(u._id, 'activate')} className="px-2 py-1 rounded text-[11px] font-medium text-green-600 hover:bg-green-50 transition-colors">Activate</button>
                        }
                        {!u.isAdmin && u.role !== 'super_admin' && u.role !== 'admin' && (
                          <button onClick={() => onAction(u._id, 'delete')} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
              <span className="text-[12px] text-[var(--color-text-muted)]">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1}–{Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of {pagination.totalUsers}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={!pagination.hasPrevPage} className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-muted)] disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                </button>
                <span className="text-[12px] text-[var(--color-text-muted)]">Page {pagination.currentPage} of {pagination.totalPages}</span>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={!pagination.hasNextPage} className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-muted)] disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
