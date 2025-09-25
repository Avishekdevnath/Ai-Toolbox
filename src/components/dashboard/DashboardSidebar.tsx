'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wrench,
  BarChart3,
  Settings,
  Users,
  Shield,
  ChevronDown,
  ChevronRight,
  History,
  Plus,
  QrCode,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: Omit<NavItem, 'children'>[];
  roles?: string[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tools',
    href: '/dashboard/tools',
    icon: Wrench,
    children: [
      { title: 'All Tools', href: '/dashboard/tools', icon: Wrench },
      { title: 'URL Management', href: '/dashboard/urls', icon: Wrench },
      { title: 'QR Generator', href: '/dashboard/qr-generator', icon: QrCode },
      { title: 'SWOT History', href: '/dashboard/swot-history', icon: History },
      { title: 'History', href: '/dashboard/tools/history', icon: History },
      { title: 'Usage Analytics', href: '/dashboard/tools/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Forms',
    href: '/dashboard/forms',
    icon: LayoutDashboard,
    children: [
      { title: 'All Forms', href: '/dashboard/forms', icon: LayoutDashboard },
      { title: 'Create Form', href: '/dashboard/forms/create', icon: Plus },
      { title: 'Archived', href: '/dashboard/forms/archived', icon: History },
    ],
  },
  {
    title: 'Code Share',
    href: '/dashboard/snippets',
    icon: Wrench,
    children: [
      { title: 'My Snippets', href: '/dashboard/snippets', icon: Wrench },
      { title: 'Create Snippet', href: '/s/new', icon: Plus },
    ],
  },
  {
    title: 'History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Admin',
    href: '/dashboard/admin',
    icon: Shield,
    roles: ['admin'],
    children: [
      { title: 'User Management', href: '/dashboard/admin/users', icon: Users },
      { title: 'System Overview', href: '/dashboard/admin/system', icon: Shield },
    ],
  },
];

interface DashboardSidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export default function DashboardSidebar({ isMobileMenuOpen = false, onMobileMenuClose }: DashboardSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user } = useAuth();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isExpanded = (title: string) => expandedItems.includes(title);

  const hasRole = (roles?: string[]) => {
    if (!roles) return true;
    if (!user) return false;
    return roles.some(role => user.role === role);
  };

  const filteredItems = navigationItems.filter(item => hasRole(item.roles));

  return (
    <aside className={`w-full lg:w-64 bg-white border-r border-gray-300 h-auto lg:h-full transition-transform duration-300 ease-in-out ${
      isMobileMenuOpen ? 'block' : 'hidden lg:block'
    }`}>
      <div className="p-4 lg:p-6 h-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h2>
        
        <nav className="space-y-2">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const isItemActive = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isItemExpanded = isExpanded(item.title);

            return (
              <li key={item.title}>
                <div className="space-y-1">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isItemActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpanded(item.title);
                      } else {
                        onMobileMenuClose?.();
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        isItemExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </Link>

                  {hasChildren && isItemExpanded && (
                    <ul className="ml-6 space-y-1">
                      {item.children!.map((child) => {
                        const isChildActive = isActive(child.href);
                        
                        return (
                          <li key={child.title}>
                            <Link
                              href={child.href}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                isChildActive
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              )}
                              onClick={() => onMobileMenuClose?.()}
                            >
                              <child.icon className="w-4 h-4" />
                              <span>{child.title}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        </nav>
      </div>
    </aside>
  );
} 