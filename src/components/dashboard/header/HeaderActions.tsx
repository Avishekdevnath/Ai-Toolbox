'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Home, LogOut, Loader2, MessageSquare, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import FeedbackForm from '@/components/feedback/FeedbackForm';

const DISMISSED_KEY = 'feedback_widget_dismissed';

export function HeaderActions() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFeedbackDismissed(localStorage.getItem(DISMISSED_KEY) === '1');
    const handler = () => setFeedbackDismissed(true);
    window.addEventListener('feedback-widget-dismissed', handler);
    return () => window.removeEventListener('feedback-widget-dismissed', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(e.target as Node)) {
        setFeedbackOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setProfileOpen(false);
    setFeedbackOpen(false);
    console.log('👋 [HeaderActions] User clicked signout');
    try {
      console.log('👋 [HeaderActions] Calling logout()...');
      await logout();
      console.log('👋 [HeaderActions] logout() completed. Navigating to /');
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('❌ [HeaderActions] Logout failed:', error);
      setSigningOut(false);
    }
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="relative w-8 h-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
      </Button>

      {/* Inline feedback button — visible only after floating widget is dismissed */}
      {feedbackDismissed && (
        <div className="relative" ref={feedbackRef}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFeedbackOpen((v) => !v)}
            className="relative w-8 h-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Feedback"
            title="Share Feedback"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>

          {feedbackOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-800">Share Feedback</span>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 py-3">
                <FeedbackForm onClose={() => setFeedbackOpen(false)} currentPath={pathname} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile avatar with dropdown */}
      <div className="relative ml-1" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[11px] font-bold text-white cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          aria-label="Profile menu"
        >
          {initials}
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-9 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
            {user?.email && (
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            )}
            <Link
              href="/dashboard/profile"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              View Profile
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setProfileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              Settings
            </Link>
            <div className="border-t border-slate-100 mt-1 pt-1">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {signingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
