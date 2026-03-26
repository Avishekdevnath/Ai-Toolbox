'use client';

import { useEffect, useState } from 'react';

export default function AdminPageHeader() {
  const [mounted, setMounted] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setMounted(true);
    setTimestamp(new Date().toLocaleString());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <div className="text-sm text-gray-500">
          {mounted && `Last updated: ${timestamp}`}
        </div>
      </div>
    </div>
  );
}
