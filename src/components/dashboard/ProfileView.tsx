'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, BarChart3, Wrench } from 'lucide-react';

export default function ProfileView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [pRes, sRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/stats'),
        ]);
        if (pRes.ok) {
          const p = await pRes.json();
          setProfile(p.data || null);
        }
        if (sRes.ok) {
          const s = await sRes.json();
          setStats(s.data?.userStats || null);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your profile and account settings.</p>
        </div>
        <Link href="/dashboard/profile/edit">
          <Button className="w-full sm:w-auto">Edit</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="font-medium text-base md:text-lg">
                  {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username : 'User'}
                </div>
                <Badge variant="secondary" className="w-fit">{profile?.role ?? 'user'}</Badge>
              </div>
              <div className="text-sm text-gray-600 break-words">{profile?.email}</div>
              {profile?.phoneNumber && (
                <div className="text-sm text-gray-600">{profile.phoneNumber}</div>
              )}
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">First Name</div>
                  <div className="text-sm break-words">{profile?.firstName || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Name</div>
                  <div className="text-sm break-words">{profile?.lastName || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Username</div>
                  <div className="text-sm break-words">{profile?.username || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="text-sm break-words">{profile?.phoneNumber || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{stats?.totalToolsUsed ?? 0}</div>
              <div className="text-xs md:text-sm text-gray-500">Tools Used</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats?.totalAnalyses ?? 0}</div>
              <div className="text-xs md:text-sm text-gray-500">Total Analyses</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-purple-600">{(stats?.sessionCount ?? 0)}</div>
              <div className="text-xs md:text-sm text-gray-500">Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/tools/swot-analysis" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center">SWOT Analysis</Button>
            </Link>
            <Link href="/tools/finance-advisor" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center">Finance Advisor</Button>
            </Link>
            <Link href="/tools/diet-planner" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto justify-center">Diet Planner</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


