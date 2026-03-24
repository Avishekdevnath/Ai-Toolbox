'use client';

import { useAuth } from '@/components/AuthProvider';
import { SidebarLogo } from './sidebar/SidebarLogo';
import { SidebarNav } from './sidebar/SidebarNav';
import { SidebarFooter } from './sidebar/SidebarFooter';

interface DashboardSidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export default function DashboardSidebar({ isMobileMenuOpen = false, onMobileMenuClose }: DashboardSidebarProps) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-60 flex flex-col bg-slate-900 transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarLogo />
        <SidebarNav userRole={user?.role} onClose={onMobileMenuClose} />
        <SidebarFooter email={user?.email} role={user?.role} />
      </aside>
    </>
  );
}
