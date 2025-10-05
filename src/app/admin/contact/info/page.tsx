'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, RefreshCw, CheckCircle, Mail, Phone, MapPin, MessageSquare, Globe } from 'lucide-react';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  portfolioUrl?: string;
  liveChatUrl?: string;
  description?: string;
  businessHours?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function ContactInfoPage() {
  const [info, setInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const res = await fetch('/api/contact/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setInfo(data?.data || {});
      }
    } catch (e) {
      console.error('Failed to load contact info:', e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save contact info:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadContactInfo();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          Contact Information
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your business contact details displayed on the public contact page.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Basic Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={info.email || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, email: e.target.value }))} 
                  placeholder="contact@example.com" 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={info.phone || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, phone: e.target.value }))} 
                  placeholder="+1 555 123 4567" 
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Business Address</Label>
                <Input 
                  id="address" 
                  value={info.address || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, address: e.target.value }))} 
                  placeholder="123 Main St, City, State, Country" 
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input 
                  id="portfolioUrl" 
                  value={info.portfolioUrl || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, portfolioUrl: e.target.value }))} 
                  placeholder="https://your-portfolio-website.com" 
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="liveChatUrl">Live Chat URL</Label>
                <Input 
                  id="liveChatUrl" 
                  value={info.liveChatUrl || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, liveChatUrl: e.target.value }))} 
                  placeholder="https://your-chat-provider-link" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea 
                id="description" 
                value={info.description || ''} 
                onChange={(e) => setInfo(prev => ({ ...prev, description: e.target.value }))} 
                placeholder="Brief description of your business..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="businessHours">Business Hours</Label>
              <Input 
                id="businessHours" 
                value={info.businessHours || ''} 
                onChange={(e) => setInfo(prev => ({ ...prev, businessHours: e.target.value }))} 
                placeholder="Mon-Fri: 9AM-5PM, Sat: 10AM-2PM" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input 
                  id="facebook" 
                  value={info.socialMedia?.facebook || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                  }))} 
                  placeholder="https://facebook.com/yourpage" 
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input 
                  id="twitter" 
                  value={info.socialMedia?.twitter || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                  }))} 
                  placeholder="https://twitter.com/yourhandle" 
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={info.socialMedia?.linkedin || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                  }))} 
                  placeholder="https://linkedin.com/company/yourcompany" 
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input 
                  id="instagram" 
                  value={info.socialMedia?.instagram || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                  }))} 
                  placeholder="https://instagram.com/yourhandle" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> Saved successfully!
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
