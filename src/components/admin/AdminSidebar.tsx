'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3, 
  Users,
  Settings,
  Activity,
  Wrench,
  Shield,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Tool Usage', href: '/admin/tools', icon: BarChart3 },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Admin Users', href: '/admin/admin-users', icon: Shield },
  { name: 'Service Management', href: '/admin/services', icon: Wrench },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
  { name: 'Activity Logs', href: '/admin/activity', icon: Activity },
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  // Debug: Log current pathname
  console.log('🔍 Sidebar - Current pathname:', pathname);

  const handleLogout = async () => {
    await logout();
  };

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      // For dashboard, only match exact path
      const isActive = pathname === href;
      console.log(`🔍 Sidebar - Dashboard (${href}): ${isActive} (pathname: ${pathname})`);
      return isActive;
          } else {
      // For other pages, match exact path or if path starts with href
      const isActive = pathname === href || pathname.startsWith(href);
      console.log(`🔍 Sidebar - ${href}: ${isActive} (pathname: ${pathname})`);
      return isActive;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Dashboard
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
    return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActiveLink(item.href)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {!isCollapsed && (
                <span className="flex-1">{item.name}</span>
              )}
              {item.badge && !isCollapsed && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {admin?.email}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {admin?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link href="/admin/profile">
                <Button variant="outline" size="sm" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
        </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
        </div>
      </div>
  );
} 