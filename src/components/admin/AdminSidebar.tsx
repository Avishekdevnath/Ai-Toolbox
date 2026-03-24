'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { adminNavItems } from './sidebar/admin-nav-config';
import { AdminSidebarLogo } from './sidebar/AdminSidebarLogo';
import { AdminSidebarNavItem } from './sidebar/AdminSidebarNavItem';
import { AdminSidebarFooter } from './sidebar/AdminSidebarFooter';

interface AdminUser {
  id: string;
  email: string;
  permissions: string[];
  firstName?: string;
  lastName?: string;
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/auth/session')
      .then((r) => r.json())
      .then((d) => (d.success && d.admin ? setAdmin(d.admin) : router.push('/admin-login')))
      .catch(() => router.push('/admin-login'));
  }, [router]);

  const toggle = (name: string) =>
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const hasPermission = (perm?: string) =>
    !perm || (admin?.permissions ?? []).includes(perm);

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/admin-login');
  };

  if (!admin) {
    return (
      <aside className="w-60 flex-shrink-0 bg-slate-900 h-full hidden lg:flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
      </aside>
    );
  }

  const visible = adminNavItems.filter((item) => hasPermission(item.permission));
  const name = admin.firstName && admin.lastName
    ? `${admin.firstName} ${admin.lastName}`
    : undefined;

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 h-full hidden lg:flex flex-col">
      <AdminSidebarLogo />
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-0.5">
          {visible.map((item) => (
            <AdminSidebarNavItem
              key={item.name}
              item={item}
              isActive={pathname === item.href}
              isExpanded={expanded.includes(item.name)}
              hasActiveChild={item.children?.some((c) => pathname === c.href) ?? false}
              onToggle={() => toggle(item.name)}
              pathname={pathname}
            />
          ))}
        </ul>
      </nav>
      <AdminSidebarFooter email={admin.email} name={name} onLogout={handleLogout} />
    </aside>
  );
}
