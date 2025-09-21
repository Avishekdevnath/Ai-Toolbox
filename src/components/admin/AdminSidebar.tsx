'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  Shield,
  FileText,
  Activity,
  Wrench,
  Database,
  Bell,
  Globe,
  Palette,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Home
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: NavItem[];
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAdminSession() {
      try {
        const response = await fetch('/api/admin/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            setAdminUser(data.admin);
          } else {
            router.push('/admin-login');
          }
        } else {
          router.push('/admin-login');
        }
      } catch (error) {
        console.error('Error fetching admin session:', error);
        router.push('/admin-login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminSession();
  }, [router]);

  // Check if user has permission
  const hasPermission = (permission: string) => {
    if (!adminUser) return false;
    return adminUser.permissions.includes(permission);
  };

  if (isLoading) {
    return (
      <aside className="w-64 bg-white shadow-lg h-full hidden lg:block">
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  const navigationItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      permission: 'manage_users',
      children: [
        { name: 'All Users', href: '/admin/users', icon: Users },
        { name: 'Admin Users', href: '/admin/admin-users', icon: Shield },
        { name: 'User Analytics', href: '/admin/users/analytics', icon: BarChart3 },
        { name: 'User Roles', href: '/admin/users/roles', icon: Shield },
      ]
    },
    {
      name: 'Tool Management',
      href: '/admin/tools',
      icon: Wrench,
      permission: 'manage_tools',
      children: [
        { name: 'All Tools', href: '/admin/tools', icon: Wrench },
        { name: 'Tool Analytics', href: '/admin/tools/analytics', icon: BarChart3 },
        { name: 'Tool Settings', href: '/admin/tools/settings', icon: Settings },
      ]
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'view_analytics',
      children: [
        { name: 'Overview', href: '/admin/analytics', icon: BarChart3 },
        { name: 'User Analytics', href: '/admin/analytics/users', icon: Users },
        { name: 'Tool Analytics', href: '/admin/analytics/tools', icon: Wrench },
        { name: 'System Analytics', href: '/admin/analytics/system', icon: Activity },
      ]
    },
    {
      name: 'System',
      href: '/admin/system',
      icon: Settings,
      permission: 'manage_system',
      children: [
        { name: 'Settings', href: '/admin/system', icon: Settings },
        { name: 'Database', href: '/admin/system/database', icon: Database },
        { name: 'Security', href: '/admin/system/security', icon: Lock },
        { name: 'Logs', href: '/admin/system/logs', icon: FileText },
      ]
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: FileText,
      permission: 'manage_content',
      children: [
        { name: 'Pages', href: '/admin/content/pages', icon: FileText },
        { name: 'Blog', href: '/admin/content/blog', icon: FileText },
        { name: 'Media', href: '/admin/content/media', icon: FileText },
      ]
    },
    {
      name: 'Branding',
      href: '/admin/branding',
      icon: Palette,
      permission: 'manage_settings',
      children: [
        { name: 'Theme', href: '/admin/branding/theme', icon: Palette },
        { name: 'Logo', href: '/admin/branding/logo', icon: Globe },
        { name: 'Colors', href: '/admin/branding/colors', icon: Palette },
      ]
    },
    {
      name: 'Help & Support',
      href: '/admin/help',
      icon: HelpCircle,
      children: [
        { name: 'Documentation', href: '/admin/help/docs', icon: FileText },
        { name: 'FAQ', href: '/admin/help/faq', icon: HelpCircle },
        { name: 'Contact Support', href: '/admin/help/support', icon: Bell },
      ]
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isItemActive = isActive(item.href);
    
    // Check permission
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    return (
      <div key={item.name}>
        <Link
          href={item.href}
          className={cn(
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            level === 0 ? 'text-gray-900' : 'text-gray-600',
            isItemActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            level > 0 && 'ml-4'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name);
            }
          }}
        >
          <item.icon className={cn(
            'mr-3 h-5 w-5 flex-shrink-0',
            isItemActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
          )} />
          <span className="flex-1">{item.name}</span>
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )
          )}
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-full hidden lg:block">
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-500">
                {adminUser.firstName && adminUser.lastName 
                  ? `${adminUser.firstName} ${adminUser.lastName}`
                  : adminUser.email
                }
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map(item => renderNavItem(item))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Home className="mr-3 h-4 w-4" />
              Back to Site
            </Link>
            <Link
              href="/admin/profile"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Users className="mr-3 h-4 w-4" />
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
} 