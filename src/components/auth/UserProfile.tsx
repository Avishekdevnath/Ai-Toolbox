'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  LogOut,
  Crown
} from 'lucide-react';
import Link from 'next/link';

export function UserProfile() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome Guest
          </CardTitle>
          <CardDescription>
            Sign in to access your profile and personalized features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {user?.fullName || 'User'}
              {user?.publicMetadata?.role === 'admin' && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user?.primaryEmailAddress?.emailAddress}
            </CardDescription>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {user?.publicMetadata?.role || 'user'}
              </Badge>
              {user?.publicMetadata?.verified && (
                <Badge variant="outline" className="text-green-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Member since</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last sign in</span>
            <span>
              {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/profile">
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href="/dashboard">
              <Settings className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>

          {user?.publicMetadata?.role === 'admin' && (
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin">
                <Crown className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        <Button 
          variant="destructive" 
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
} 