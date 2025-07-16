"use client";
import { usePathname } from "next/navigation";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  
  // Only provide SessionProvider and main wrapper
  // Individual pages will handle their own header and footer
  return (
    <SessionProviderWrapper>
      <main className="flex-1 overflow-auto">{children}</main>
    </SessionProviderWrapper>
  );
} 