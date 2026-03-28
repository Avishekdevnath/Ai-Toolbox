'use client';

import { Search } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  roleFilter: string;
  onRoleChange: (v: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const selectCls = 'border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] text-[var(--color-text-secondary)] bg-[var(--color-surface)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none';

export default function UserFilters({ searchTerm, onSearchChange, statusFilter, onStatusChange, roleFilter, onRoleChange, onSearch, onClear }: UserFiltersProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 border border-[var(--color-border)] rounded-lg text-[13px] text-[var(--color-text-secondary)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
          />
        </div>

        <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>

        <select value={roleFilter} onChange={(e) => onRoleChange(e.target.value)} className={selectCls}>
          <option value="">All Roles</option>
          <option value="user">Regular User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>

        <div className="flex gap-2">
          <button onClick={onSearch} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-3 py-2 rounded-lg transition-colors">
            Search
          </button>
          <button onClick={onClear} className="flex-1 border border-[var(--color-border)] hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)] text-[13px] font-medium px-3 py-2 rounded-lg transition-colors">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
