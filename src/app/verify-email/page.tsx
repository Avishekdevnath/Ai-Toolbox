'use client';

import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-200 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900">Email Verification</h2>
        <p className="mt-2 text-sm text-gray-600">
          Email verification is not required in the current custom auth flow.
        </p>
        <div className="mt-6">
          <Link href="/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 