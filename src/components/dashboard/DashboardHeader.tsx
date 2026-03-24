'use client';

import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from './header/SearchBar';
import { HeaderActions } from './header/HeaderActions';

interface DashboardHeaderProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function DashboardHeader({ isMobileMenuOpen = false, onMobileMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="h-12 flex items-center justify-between px-4 gap-3 bg-white border-b border-slate-200 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden w-8 h-8 text-slate-500"
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
        <SearchBar />
      </div>
      <HeaderActions />
    </header>
  );
}
