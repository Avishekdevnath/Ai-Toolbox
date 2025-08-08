'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Reply,
  Trash2
} from 'lucide-react';

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'feature-request' | 'bug-report' | 'billing' | 'other';
  assignedTo?: string;
  response?: string;
  respondedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  formattedCreatedAt?: string;
  timeSinceCreation?: string;
}

interface ContactStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [responseText, setResponseText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [statusFilter, priorityFilter, debouncedSearchTerm]);

  const fetchContacts = async () => {
    try {
      let url = '/api/contact?limit=50';
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        let filteredContacts = data.contacts;
        
        if (priorityFilter !== 'all') {
          filteredContacts = filteredContacts.filter((contact: Contact) => 
            contact.priority === priorityFilter
          );
        }
        
        // Apply search filter
        if (debouncedSearchTerm) {
          filteredContacts = filteredContacts.filter((contact: Contact) =>
            contact.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            contact.subject.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          );
        }
        
        // Ensure unique contacts by _id
        const uniqueContacts = filteredContacts.filter((contact: Contact, index: number, self: Contact[]) => 
          index === self.findIndex((c: Contact) => c._id === contact._id)
        );
        
        setContacts(uniqueContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/contact/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.overall);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateContact = async (contactId: string, updates: any) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchContacts();
        await fetchStats();
        if (updates.response) {
          setShowModal(false);
          setSelectedContact(null);
          setResponseText('');
        }
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const response = await fetch(`/api/contact/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchContacts();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage contact form submissions and support requests</p>
          </div>
          <Button onClick={() => { fetchContacts(); fetchStats(); }} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading contacts...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mt-2">No contacts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                          <Badge className={getStatusColor(contact.status)}>
                            {getStatusIcon(contact.status)}
                            <span className="ml-1 capitalize">{contact.status}</span>
                          </Badge>
                          <Badge className={getPriorityColor(contact.priority)}>
                            <span className="capitalize">{contact.priority}</span>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {contact.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="font-medium text-gray-900 dark:text-white mb-1">{contact.subject}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {contact.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Select
                          value={contact.status}
                          onValueChange={(value) => updateContact(contact._id, { status: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteContact(contact._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-medium">{selectedContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium">{selectedContact.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Subject</p>
                      <p className="font-medium">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                      <p className="font-medium capitalize">{selectedContact.category}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Message</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
                
                {selectedContact.response && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Response</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedContact.response}</p>
                      {selectedContact.respondedAt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Responded on: {new Date(selectedContact.respondedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Add Response</h3>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    rows={4}
                    className="w-full"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => updateContact(selectedContact._id, { response: responseText })}
                      disabled={!responseText.trim() || updating}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Send Response
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 