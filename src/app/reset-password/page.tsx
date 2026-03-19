'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound } from 'lucide-react';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Navbar />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <KeyRound className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle>Password Recovery Moved</CardTitle>
            <CardDescription>
              Reset links are no longer used. Start recovery with your saved security questions instead.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button type="button" className="w-full" onClick={() => router.push('/forgot-password')}>
              Go to Password Recovery
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/sign-in')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>

      <NewFooter />
    </div>
  );
}
