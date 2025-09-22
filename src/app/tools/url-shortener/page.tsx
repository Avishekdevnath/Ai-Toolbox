'use client';

import URLShortenerTool from '@/components/tools/URLShortenerTool';
import Navbar from "@/components/Navbar";
import NewFooter from "@/components/NewFooter";
import useToolTracking from '@/hooks/useToolTracking';

export default function URLShortenerPage() {
  useToolTracking('url-shortener', 'URL Shortener', 'view');
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-10">
          <URLShortenerTool />
        </div>
      </main>
      <NewFooter />
    </div>
  );
} 