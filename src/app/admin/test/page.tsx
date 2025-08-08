'use client';

export default function AdminTestPage() {
  console.log('🎯 Admin Test Page Loaded!');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Test Page</h1>
      <p>If you can see this, the admin route is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
} 