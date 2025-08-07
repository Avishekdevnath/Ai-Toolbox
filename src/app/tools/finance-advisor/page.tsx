'use client';

import FinanceAdvisorTool from '@/components/tools/finance';
import Navbar from "@/components/Navbar";
import NewFooter from "@/components/NewFooter";

export default function FinanceAdvisorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-10">
          <FinanceAdvisorTool />
        </div>
      </main>
      <NewFooter />
    </div>
  );
} 