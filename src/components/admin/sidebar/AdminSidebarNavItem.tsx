'use client';

import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminNavItem } from './admin-nav-config';

interface Props {
  item: AdminNavItem;
  isActive: boolean;
  isExpanded: boolean;
  hasActiveChild: boolean;
  onToggle: () => void;
  pathname: string;
}

export function AdminSidebarNavItem({ item, isActive, isExpanded, hasActiveChild, onToggle, pathname }: Props) {
  const hasChildren = !!item.children?.length;
  const highlighted = isActive || (hasActiveChild && !isExpanded);

  return (
    <li>
      <Link
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
          highlighted
            ? 'bg-orange-500 text-white shadow-md shadow-orange-900/30'
            : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
        )}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <item.icon className={cn('w-4 h-4 flex-shrink-0', highlighted ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
          <span className="truncate">{item.name}</span>
        </span>
        {hasChildren && (
          isExpanded
            ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
            : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
        )}
      </Link>

      {hasChildren && isExpanded && (
        <ul className="mt-0.5 ml-3 pl-3 border-l border-slate-700/50 space-y-0.5">
          {item.children!.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className={cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] transition-all duration-150',
                  pathname === child.href
                    ? 'text-orange-400 font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
              >
                <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{child.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
