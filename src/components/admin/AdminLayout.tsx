'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Bell, 
  Search,
  Settings,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { admin } = useAdminAuth();

  const getPageTitle = () => {
    if (title) return title;
    
    const pathMap: { [key: string]: string } = {
      '/admin': 'Dashboard',
      '/admin/analytics': 'Analytics',
      '/admin/users': 'User Management',
      '/admin/services': 'Service Management',
      '/admin/settings': 'System Settings',
      '/admin/activity': 'Activity Logs',
      '/admin/profile': 'Profile'
    };
    
    return pathMap[pathname] || 'Admin Panel';
  };

  const getPageDescription = () => {
    if (description) return description;
    
    const pathMap: { [key: string]: string } = {
      '/admin': 'System overview and key metrics',
      '/admin/analytics': 'Usage analytics and performance metrics',
      '/admin/users': 'Manage user accounts and permissions',
      '/admin/services': 'Control tool availability and settings',
      '/admin/settings': 'Configure system settings',
      '/admin/activity': 'View admin activity and audit logs',
      '/admin/profile': 'Manage your admin profile'
    };
    
    return pathMap[pathname] || 'Admin panel for system management';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 lg:static lg:inset-0">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getPageDescription()}
                </p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {admin?.firstName} {admin?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {admin?.role}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 