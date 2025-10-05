'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Database, Mail, Phone, RefreshCw, Download, Filter, Eye } from 'lucide-react';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  source: 'contact_form' | 'newsletter' | 'other';
  submittedAt: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
}

export default function ContactCollectionPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact/collection', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data?.data || []);
      }
    } catch (e) {
      console.error('Failed to load submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filtered = useMemo(() => {
    let filtered = submissions;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.toLowerCase().includes(q))
      );
    }
    
    if (sourceFilter) {
      filtered = filtered.filter(s => s.source === sourceFilter);
    }
    
    return filtered;
  }, [submissions, search, sourceFilter]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const withEmail = submissions.filter(s => s.email).length;
    const withPhone = submissions.filter(s => s.phone).length;
    const fromContactForm = submissions.filter(s => s.source === 'contact_form').length;
    const fromNewsletter = submissions.filter(s => s.source === 'newsletter').length;
    
    return { total, withEmail, withPhone, fromContactForm, fromNewsletter };
  }, [submissions]);

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(s => [
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.phone || ''}"`,
        `"${s.source}"`,
        `"${new Date(s.submittedAt).toLocaleString()}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-collection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sourceBadge = (source: string) => {
    const colors = {
      contact_form: 'bg-blue-100 text-blue-800 border-blue-200',
      newsletter: 'bg-green-100 text-green-800 border-green-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return <Badge variant="outline" className={colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'}>{source.replace('_', ' ')}</Badge>;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Contact Collection</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSubmissions} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Database className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Email</p>
                <p className="text-2xl font-bold text-blue-600">{stats.withEmail}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">With Phone</p>
                <p className="text-2xl font-bold text-green-600">{stats.withPhone}</p>
              </div>
              <Phone className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contact Form</p>
                <p className="text-2xl font-bold text-purple-600">{stats.fromContactForm}</p>
              </div>
              <Mail className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Newsletter</p>
                <p className="text-2xl font-bold text-orange-600">{stats.fromNewsletter}</p>
              </div>
              <Database className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-2">
              <Label>Source Filter</Label>
              <select 
                className="border rounded px-2 py-1" 
                value={sourceFilter} 
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="contact_form">Contact Form</option>
                <option value="newsletter">Newsletter</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Search by name, email, or phone..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="border-b align-top hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium">{s.name}</td>
                    <td className="py-2 pr-4">
                      <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">
                        {s.email}
                      </a>
                    </td>
                    <td className="py-2 pr-4">
                      {s.phone ? (
                        <a href={`tel:${s.phone}`} className="text-green-600 hover:underline">
                          {s.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{sourceBadge(s.source)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(s.submittedAt).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedSubmission(s)}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={6}>No submissions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Submission Details</h2>
                <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
                
                {selectedSubmission.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <a href={`tel:${selectedSubmission.phone}`} className="text-green-600 hover:underline">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Source</Label>
                  <div className="mt-1">{sourceBadge(selectedSubmission.source)}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                  <p>{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>

                {selectedSubmission.metadata && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Additional Info</Label>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      {selectedSubmission.metadata.userAgent && (
                        <p><strong>User Agent:</strong> {selectedSubmission.metadata.userAgent}</p>
                      )}
                      {selectedSubmission.metadata.ipAddress && (
                        <p><strong>IP Address:</strong> {selectedSubmission.metadata.ipAddress}</p>
                      )}
                      {selectedSubmission.metadata.referrer && (
                        <p><strong>Referrer:</strong> {selectedSubmission.metadata.referrer}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`mailto:${selectedSubmission.email}`)}
                >
                  <Mail className="w-4 h-4 mr-2" /> Send Email
                </Button>
                {selectedSubmission.phone && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`tel:${selectedSubmission.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" /> Call
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
