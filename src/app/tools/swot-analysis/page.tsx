'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SwotAnalysisTool from '@/components/tools/SwotAnalysisTool';

export default function SwotAnalysisPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-10">
          <SwotAnalysisTool />
        </div>
      </main>
      <Footer />
    </div>
  );
} 