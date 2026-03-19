import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-[var(--color-background)] ${className || ''}`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <NewFooter />
    </div>
  );
}
