'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function FooterRouteGuard() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) {
    return null;
  }
  return <Footer />;
} 