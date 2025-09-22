"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { useAuth } from "@/components/AuthProvider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const { user } = useAuth();
  
  useEffect(() => {
    // Track active session ping when user is logged in
    const track = async () => {
      try {
        if (user?.id) {
          await fetch('/api/auth/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionType: 'active' })
          });
        }
      } catch (e) {
        // ignore
      }
    };
    track();
  }, [user?.id, pathname]);
  
  // Only provide SessionProvider and main wrapper
  // Individual pages will handle their own header and footer
  return (
    <SessionProviderWrapper>
      <main className="flex-1 overflow-auto">{children}</main>
    </SessionProviderWrapper>
  );
} 