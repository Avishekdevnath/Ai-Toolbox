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
  Home,
  Mail,
  User,
  MessageSquare,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface AdminNavChild {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface AdminNavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  permission?: string;
  children?: AdminNavChild[];
}

export const adminNavItems: AdminNavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    name: 'User Management', href: '/admin/users', icon: Users, permission: 'manage_users',
    children: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'Admin Users', href: '/admin/admin-users', icon: Shield },
      { name: 'User Analytics', href: '/admin/users/analytics', icon: BarChart3 },
      { name: 'User Roles', href: '/admin/users/roles', icon: Shield },
    ],
  },
  {
    name: 'Tool Management', href: '/admin/tools', icon: Wrench, permission: 'manage_tools',
    children: [
      { name: 'All Tools', href: '/admin/tools', icon: Wrench },
      { name: 'Tool Analytics', href: '/admin/tools/analytics', icon: BarChart3 },
    ],
  },
  {
    name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: 'view_analytics',
    children: [
      { name: 'Overview', href: '/admin/analytics', icon: BarChart3 },
      { name: 'User Analytics', href: '/admin/analytics/users', icon: Users },
      { name: 'System Analytics', href: '/admin/analytics/system', icon: Activity },
    ],
  },
  {
    name: 'Contact', href: '/admin/contact/info', icon: Mail, permission: 'manage_system',
    children: [
      { name: 'Contact Info', href: '/admin/contact/info', icon: Settings },
      { name: 'Messages', href: '/admin/contact/messages', icon: FileText },
      { name: 'Collection', href: '/admin/contact/collection', icon: Database },
    ],
  },
  {
    name: 'About', href: '/admin/about/info', icon: User, permission: 'manage_system',
    children: [
      { name: 'About Info', href: '/admin/about/info', icon: User },
    ],
  },
  {
    name: 'System', href: '/admin/system', icon: Settings, permission: 'manage_system',
    children: [
      { name: 'Settings', href: '/admin/system', icon: Settings },
      { name: 'Database', href: '/admin/system/database', icon: Database },
      { name: 'Security', href: '/admin/system/security', icon: Lock },
      { name: 'Logs', href: '/admin/system/logs', icon: FileText },
    ],
  },
  {
    name: 'Branding', href: '/admin/branding', icon: Palette, permission: 'manage_settings',
    children: [
      { name: 'Theme', href: '/admin/branding/theme', icon: Palette },
      { name: 'Logo', href: '/admin/branding/logo', icon: Globe },
    ],
  },
  {
    name: 'Help', href: '/admin/help', icon: HelpCircle,
    children: [
      { name: 'Documentation', href: '/admin/help/docs', icon: FileText },
      { name: 'FAQ', href: '/admin/help/faq', icon: HelpCircle },
      { name: 'Support', href: '/admin/help/support', icon: Bell },
    ],
  },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare, permission: 'manage_system' },
  { name: 'Back to Site', href: '/', icon: Home },
  { name: 'My Profile', href: '/admin/profile', icon: User },
];
