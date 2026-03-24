import {
  LayoutDashboard,
  Wrench,
  BarChart3,
  Settings,
  Users,
  Shield,
  History,
  Plus,
  QrCode,
  Link2,
  Code2,
  FileText,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavChild {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavChild[];
  roles?: string[];
}

export const navigationItems: NavItem[] = [
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
      { title: 'URL Management', href: '/dashboard/urls', icon: Link2 },
      { title: 'QR Generator', href: '/dashboard/qr-generator', icon: QrCode },
      { title: 'SWOT History', href: '/dashboard/swot-history', icon: History },
      { title: 'History', href: '/dashboard/tools/history', icon: History },
      { title: 'Usage Analytics', href: '/dashboard/tools/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Forms',
    href: '/dashboard/forms',
    icon: FileText,
    children: [
      { title: 'All Forms', href: '/dashboard/forms', icon: FileText },
      { title: 'Create Form', href: '/dashboard/forms/create', icon: Plus },
      { title: 'Archived', href: '/dashboard/forms/archived', icon: History },
    ],
  },
  {
    title: 'Code Share',
    href: '/dashboard/snippets',
    icon: Code2,
    children: [
      { title: 'My Snippets', href: '/dashboard/snippets', icon: Code2 },
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
