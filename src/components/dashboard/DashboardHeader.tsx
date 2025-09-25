'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, LogOut, Home, User as UserIcon, Loader2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

export default function DashboardHeader({ isMobileMenuOpen = false, onMobileMenuToggle }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await logout();
      // Redirect to home page after successful logout
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <div className="font-semibold text-gray-900 text-sm sm:text-base">Dashboard</div>
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="truncate max-w-[14rem] text-gray-500">{user?.email}</span>
          {user?.role && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-600 border">{user.role}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
        <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-2 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search tools, history, settings..."
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900">
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Profile</span>
        </Link>

        <Button variant="ghost" size="icon" className="text-gray-600">
          <Bell className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleSignOut}
          disabled={isSigningOut}
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Sign out
            </>
          )}
        </Button>
      </div>
    </header>
  );
}