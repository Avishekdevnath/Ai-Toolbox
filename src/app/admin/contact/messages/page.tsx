'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Filter, Eye, Archive, CheckCircle2, RefreshCw, Trash2, Reply } from 'lucide-react';

type Status = 'new' | 'read' | 'archived';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: Status;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState<Status | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = status ? `/api/contact/messages?status=${status}` : '/api/contact/messages';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data?.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const setStatusFor = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/contact/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadge = (s: Status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      read: 'bg-gray-100 text-gray-800 border-gray-200',
      archived: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return <Badge variant="outline" className={colors[s]}>{s}</Badge>;
  };

  const stats = useMemo(() => {
    const newCount = messages.filter(m => m.status === 'new').length;
    const readCount = messages.filter(m => m.status === 'read').length;
    const archivedCount = messages.filter(m => m.status === 'archived').length;
    return { newCount, readCount, archivedCount, total: messages.length };
  }, [messages]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Contact Messages</h1>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.newCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-2xl font-bold text-gray-600">{stats.readCount}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Archived</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.archivedCount}</p>
              </div>
              <Archive className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
            <div className="flex items-center gap-2">
              <Label>Status Filter</Label>
              <select className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value as Status | '')}>
                <option value="">All Messages</option>
                <option value="new">New Messages</option>
                <option value="read">Read Messages</option>
                <option value="archived">Archived Messages</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">From</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m._id} className="border-b align-top hover:bg-gray-50">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-gray-500 text-sm">{m.email}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="font-medium">{m.subject}</div>
                      <div className="text-gray-600 line-clamp-2 max-w-xl text-sm">
                        {m.message.length > 100 ? m.message.substring(0, 100) + '...' : m.message}
                      </div>
                    </td>
                    <td className="py-2 pr-4">{statusBadge(m.status)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-1 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedMessage(m)}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                        {m.status === 'new' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setStatusFor(m._id, 'read')} 
                            disabled={updatingId === m._id}
                            className="text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Read
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setStatusFor(m._id, 'archived')} 
                          disabled={updatingId === m._id}
                          className="text-xs"
                        >
                          <Archive className="w-3 h-3 mr-1" /> Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={5}>No messages found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Message Details</h2>
                <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">From</Label>
                  <p className="font-medium">{selectedMessage.name}</p>
                  <p className="text-gray-500">{selectedMessage.email}</p>
                  {selectedMessage.phone && (
                    <p className="text-gray-500">{selectedMessage.phone}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject</Label>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Message</Label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Received</Label>
                  <p>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                >
                  <Reply className="w-4 h-4 mr-2" /> Reply
                </Button>
                {selectedMessage.phone && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`tel:${selectedMessage.phone}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" /> Call
                  </Button>
                )}
                {selectedMessage.status === 'new' && (
                  <Button onClick={() => {
                    setStatusFor(selectedMessage._id, 'read');
                    setSelectedMessage(null);
                  }}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Read
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFor(selectedMessage._id, 'archived');
                    setSelectedMessage(null);
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
