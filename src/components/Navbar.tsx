'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu, X, LogOut, Settings, LayoutDashboard, UserCheck, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';
import ThemeDropdown from '@/components/ui/ThemeDropdown';

const NAV_LINKS = [
  { href: '/ai-tools', label: 'AI Tools' },
  { href: '/utilities', label: 'Utilities' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const USER_MENU = [
  { href: '', icon: LayoutDashboard, label: 'Dashboard' }, // href set dynamically
  { href: '/profile', icon: UserCheck, label: 'Profile' },
  { href: '/dashboard/settings/security', icon: Lock, label: 'Security' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try { await logout(); window.location.href = '/'; }
    catch (error) { console.error('Sign out error:', error); setIsSigningOut(false); }
  };

  const initials = (() => {
    if (!user) return 'U';
    return ((user.firstName?.charAt(0) || '') + (user.lastName?.charAt(0) || '')).toUpperCase() || 'U';
  })();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);
  const dashHref = user?.role === 'admin' ? '/admin' : '/dashboard';
  const dashActive = isActive('/dashboard') || (user?.role === 'admin' && isActive('/admin'));

  const lnk = (active: boolean) => `text-sm font-medium transition-colors ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'}`;
  const ddItem = 'flex items-center gap-3 px-3 py-2 text-sm rounded-lg outline-none cursor-pointer transition-colors hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]';
  const menuItems = USER_MENU.map((m) => m.href ? m : { ...m, href: dashHref });
  const close = () => setMobileOpen(false);

  return (
    <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">AI Toolbox</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} prefetch={false} className={lnk(isActive(l.href))}>{l.label}</Link>
            ))}
            {isAuthenticated && <Link href={dashHref} className={lnk(dashActive)}>Dashboard</Link>}
          </div>

          <div className="flex items-center gap-2 md:justify-self-end">
            <div className="hidden md:flex items-center gap-3">
              <ThemeDropdown />
              {isAuthenticated ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold">{initials}</span>
                      <span className="hidden lg:inline text-sm">{user?.username || 'User'}</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" sideOffset={8} className="w-52 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg z-50">
                      {menuItems.map((m) => (
                        <DropdownMenu.Item key={m.href + m.label} asChild className={`${ddItem} text-[var(--color-text-primary)]`}>
                          <Link href={m.href}><m.icon className="w-4 h-4" /><span>{m.label}</span></Link>
                        </DropdownMenu.Item>
                      ))}
                      <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
                      <DropdownMenu.Item className={`${ddItem} text-[var(--color-destructive)]`} disabled={isSigningOut} onSelect={handleSignOut}>
                        {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : loading ? (
                <Button variant="ghost" size="sm" disabled><Loader2 className="w-4 h-4 animate-spin mr-2" />Loading...</Button>
              ) : (
                <>
                  <Link href="/sign-in"><Button variant="ghost" size="sm">Sign In</Button></Link>
                  <Link href="/sign-up"><Button size="sm">Get Started</Button></Link>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen((v) => !v)} className="md:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`block px-3 py-2 rounded-lg ${lnk(isActive(l.href))}`} onClick={close}>{l.label}</Link>
            ))}
            {isAuthenticated && (
              <Link href={dashHref} className={`block px-3 py-2 rounded-lg ${lnk(dashActive)}`} onClick={close}>Dashboard</Link>
            )}
            <div className="py-2">
              <ThemeDropdown />
            </div>
            <div className="pt-3 mt-2 border-t border-[var(--color-border)] space-y-1">
              {isAuthenticated ? (
                <>
                  {menuItems.map((m) => (
                    <Link key={m.href + m.label} href={m.href} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-muted)]" onClick={close}>
                      <m.icon className="w-4 h-4" /> {m.label}
                    </Link>
                  ))}
                  <button onClick={handleSignOut} disabled={isSigningOut} className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--color-destructive)] rounded-lg hover:bg-[var(--color-muted)] w-full text-left disabled:opacity-50">
                    {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : loading ? (
                <Button variant="ghost" size="sm" className="w-full justify-start" disabled><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</Button>
              ) : (
                <div className="flex flex-col gap-2 px-3 py-2">
                  <Link href="/sign-in" onClick={close}><Button variant="ghost" size="sm" className="w-full">Sign In</Button></Link>
                  <Link href="/sign-up" onClick={close}><Button size="sm" className="w-full">Get Started</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
