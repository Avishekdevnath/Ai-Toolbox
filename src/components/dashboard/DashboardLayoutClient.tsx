'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <div className="h-full w-full flex flex-col lg:grid lg:grid-cols-[16rem_1fr] min-h-0">
        <DashboardSidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onMobileMenuClose={handleMobileMenuClose}
        />
        <div className="flex flex-col h-full min-w-0 min-h-0">
          <DashboardHeader 
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          <main className="flex-1 overflow-y-auto p-3 bg-gray-50">{children}</main>
        </div>
      </div>
    </div>
  );
}
