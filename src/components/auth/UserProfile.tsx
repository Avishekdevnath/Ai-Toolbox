'use client';

import { useAuth } from '@/components/AuthProvider';
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
  const { user, isAuthenticated, logout } = useAuth();

  if (!user) {
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
            <AvatarImage src={''} alt={`${user.firstName || 'User'}`} />
            <AvatarFallback>
              {(user.firstName || 'U').charAt(0)}{(user.lastName || '').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
              {user.role === 'admin' && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </CardDescription>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Member</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {/* Placeholder date since we do not expose createdAt */}
              —
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
          {user.role === 'admin' && (
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/admin">
                <Crown className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        <Button 
          variant="destructive" 
          className="w-full justify-start hover:bg-red-700 transition-colors duration-200"
          onClick={async () => { 
            await logout(); 
            window.location.href = '/'; 
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
} 