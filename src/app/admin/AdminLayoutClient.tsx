'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, User, BarChart2, Settings, Users, Activity, Server, LayoutDashboard, Home } from 'lucide-react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/tools', label: 'Tools', icon: <BarChart2 className="w-5 h-5" /> },
  { href: '/admin/system', label: 'System', icon: <Server className="w-5 h-5" /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <Activity className="w-5 h-5" /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg z-20">
        <div className="h-20 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <span className="text-2xl font-bold text-blue-600">Admin</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-800 font-medium transition-colors">
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">Admin User</span>
            <button className="ml-auto p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <Link href="/" className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors justify-center">
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
        </div>
      </aside>
      {/* Mobile Sidebar (Drawer) - TODO: Implement if needed */}
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar/Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 shadow-sm z-10">
          <div className="flex-1 text-xl font-bold text-gray-900 dark:text-white">Dashboard</div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold">A</div>
          </div>
        </header>
        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
} 