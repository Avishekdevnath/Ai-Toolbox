'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Shield,
  Zap,
  Headphones,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Github,
  Linkedin,
  Twitter,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Youtube
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ContactMethod {
  title: string;
  description: string;
  value: string;
  href: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
}

interface ContactFeature {
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
}

interface AdditionalInfo {
  title: string;
  description: string;
  responseTime: string;
  isActive: boolean;
}

interface ContactSettings {
  contactMethods: ContactMethod[];
  pageTitle: string;
  pageDescription: string;
  features: ContactFeature[];
  additionalInfo: AdditionalInfo;
}

const iconOptions = [
  { value: 'Mail', label: 'Mail' },
  { value: 'MessageSquare', label: 'Message Square' },
  { value: 'Phone', label: 'Phone' },
  { value: 'MapPin', label: 'Map Pin' },
  { value: 'Clock', label: 'Clock' },
  { value: 'Shield', label: 'Shield' },
  { value: 'Zap', label: 'Zap' },
  { value: 'Headphones', label: 'Headphones' },
  { value: 'AlertCircle', label: 'Alert Circle' },
  { value: 'CheckCircle', label: 'Check Circle' },
  { value: 'Github', label: 'GitHub' },
  { value: 'Linkedin', label: 'LinkedIn' },
  { value: 'Twitter', label: 'X (Twitter)' },
  { value: 'MessageCircle', label: 'WhatsApp' },
  { value: 'Globe', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Youtube', label: 'YouTube' }
];

const colorOptions = [
  { value: 'bg-gradient-to-br from-blue-500 to-blue-600', label: 'Blue' },
  { value: 'bg-gradient-to-br from-green-500 to-green-600', label: 'Green' },
  { value: 'bg-gradient-to-br from-purple-500 to-purple-600', label: 'Purple' },
  { value: 'bg-gradient-to-br from-orange-500 to-orange-600', label: 'Orange' },
  { value: 'bg-gradient-to-br from-red-500 to-red-600', label: 'Red' },
  { value: 'bg-gradient-to-br from-pink-500 to-pink-600', label: 'Pink' },
  { value: 'bg-gradient-to-br from-indigo-500 to-indigo-600', label: 'Indigo' },
  { value: 'bg-gradient-to-br from-teal-500 to-teal-600', label: 'Teal' },
  { value: 'bg-gradient-to-br from-gray-500 to-gray-600', label: 'Gray' },
  { value: 'bg-gradient-to-br from-yellow-500 to-yellow-600', label: 'Yellow' }
];

const presetContactMethods = [
  {
    title: "Email Support",
    description: "Get detailed responses via email",
    value: "contact@aitoolbox.com",
    href: "mailto:contact@aitoolbox.com",
    icon: "Mail",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    isActive: true,
    order: 0
  },
  {
    title: "Phone Support",
    description: "Speak directly with our experts",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
    icon: "Phone",
    color: "bg-gradient-to-br from-green-500 to-green-600",
    isActive: true,
    order: 1
  },
  {
    title: "WhatsApp",
    description: "Chat with us on WhatsApp",
    value: "+1 (555) 123-4567",
    href: "https://wa.me/15551234567",
    icon: "MessageCircle",
    color: "bg-gradient-to-br from-green-500 to-green-600",
    isActive: true,
    order: 2
  },
  {
    title: "Office Location",
    description: "Visit us in person",
    value: "San Francisco, CA",
    href: "https://maps.google.com/?q=San+Francisco,+CA",
    icon: "MapPin",
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    isActive: true,
    order: 3
  },
  {
    title: "GitHub",
    description: "Check out our projects",
    value: "github.com/aitoolbox",
    href: "https://github.com/aitoolbox",
    icon: "Github",
    color: "bg-gradient-to-br from-gray-500 to-gray-600",
    isActive: true,
    order: 4
  },
  {
    title: "LinkedIn",
    description: "Connect with us on LinkedIn",
    value: "linkedin.com/company/aitoolbox",
    href: "https://linkedin.com/company/aitoolbox",
    icon: "Linkedin",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    isActive: true,
    order: 5
  },
  {
    title: "X (Twitter)",
    description: "Follow us on X",
    value: "@aitoolbox",
    href: "https://twitter.com/aitoolbox",
    icon: "Twitter",
    color: "bg-gradient-to-br from-blue-400 to-blue-500",
    isActive: true,
    order: 6
  },
  {
    title: "Website",
    description: "Visit our main website",
    value: "aitoolbox.com",
    href: "https://aitoolbox.com",
    icon: "Globe",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    isActive: true,
    order: 7
  }
];

export default function ContactSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ContactSettings>({
    contactMethods: [],
    pageTitle: 'Contact Us',
    pageDescription: 'Have questions about our AI tools? Need technical support? We\'re here to help you succeed.',
    features: [],
    additionalInfo: {
      title: 'Need Immediate Help?',
      description: 'For urgent technical issues or account problems, our support team is available 24/7.',
      responseTime: '< 2 hours',
      isActive: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/contact-settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/contact-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Contact settings saved successfully',
        });
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save contact settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addContactMethod = () => {
    const newMethod: ContactMethod = {
      title: '',
      description: '',
      value: '',
      href: '',
      icon: 'Mail',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      isActive: true,
      order: settings.contactMethods.length
    };
    setSettings(prev => ({
      ...prev,
      contactMethods: [...prev.contactMethods, newMethod]
    }));
  };

  const loadPresetContactMethods = () => {
    setSettings(prev => ({
      ...prev,
      contactMethods: presetContactMethods
    }));
    toast({
      title: 'Preset Loaded',
      description: 'Default contact methods have been loaded. You can now customize them.',
    });
  };

  const updateContactMethod = (index: number, field: keyof ContactMethod, value: any) => {
    setSettings(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.map((method, i) => 
        i === index ? { ...method, [field]: value } : method
      )
    }));
  };

  const removeContactMethod = (index: number) => {
    setSettings(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    const newFeature: ContactFeature = {
      icon: 'Clock',
      title: '',
      description: '',
      isActive: true,
      order: settings.features.length
    };
    setSettings(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  const updateFeature = (index: number, field: keyof ContactFeature, value: any) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  const removeFeature = (index: number) => {
    setSettings(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    });
  };

  const generateHref = (type: string, value: string) => {
    switch (type) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value.replace(/\s+/g, '')}`;
      case 'whatsapp':
        const phoneNumber = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');
        return `https://wa.me/${phoneNumber}`;
      case 'location':
        return `https://maps.google.com/?q=${encodeURIComponent(value)}`;
      case 'github':
        if (value.startsWith('http')) return value;
        return `https://github.com/${value.replace('github.com/', '')}`;
      case 'linkedin':
        if (value.startsWith('http')) return value;
        return `https://linkedin.com/company/${value.replace('linkedin.com/company/', '')}`;
      case 'twitter':
        if (value.startsWith('http')) return value;
        const handle = value.startsWith('@') ? value.substring(1) : value;
        return `https://twitter.com/${handle}`;
      case 'website':
        if (value.startsWith('http')) return value;
        return `https://${value}`;
      default:
        return value;
    }
  };

  const getContactMethodType = (method: ContactMethod) => {
    if (method.href.startsWith('mailto:')) return 'email';
    if (method.href.startsWith('tel:')) return 'phone';
    if (method.href.includes('wa.me')) return 'whatsapp';
    if (method.href.includes('maps.google.com')) return 'location';
    if (method.href.includes('github.com')) return 'github';
    if (method.href.includes('linkedin.com')) return 'linkedin';
    if (method.href.includes('twitter.com')) return 'twitter';
    if (method.href.startsWith('http') && !method.href.includes('github.com') && !method.href.includes('linkedin.com') && !method.href.includes('twitter.com')) return 'website';
    return 'other';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage contact page content and settings</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage contact page content and settings</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Page Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pageTitle">Page Title</Label>
            <Input
              id="pageTitle"
              value={settings.pageTitle}
              onChange={(e) => setSettings(prev => ({ ...prev, pageTitle: e.target.value }))}
              placeholder="Contact Us"
            />
          </div>
          <div>
            <Label htmlFor="pageDescription">Page Description</Label>
            <Textarea
              id="pageDescription"
              value={settings.pageDescription}
              onChange={(e) => setSettings(prev => ({ ...prev, pageDescription: e.target.value }))}
              placeholder="Page description..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Methods</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage how users can reach you - email, phone, social media, etc.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadPresetContactMethods} variant="outline" size="sm">
                Load Presets
              </Button>
              <Button onClick={addContactMethod} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {settings.contactMethods.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Contact Methods</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add contact methods to let users know how to reach you.
              </p>
              <Button onClick={loadPresetContactMethods} className="bg-blue-600 hover:bg-blue-700">
                Load Default Contact Methods
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {settings.contactMethods.map((method, index) => {
                const methodType = getContactMethodType(method);
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={method.title}
                          onChange={(e) => updateContactMethod(index, 'title', e.target.value)}
                          placeholder="Email Support"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={method.description}
                          onChange={(e) => updateContactMethod(index, 'description', e.target.value)}
                          placeholder="Get detailed responses via email"
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <div className="flex gap-2">
                          <Input
                            value={method.value}
                            onChange={(e) => {
                              updateContactMethod(index, 'value', e.target.value);
                              // Auto-generate href based on type
                              const newHref = generateHref(methodType, e.target.value);
                              updateContactMethod(index, 'href', newHref);
                            }}
                            placeholder={methodType === 'email' ? 'contact@example.com' : 
                                       methodType === 'phone' ? '+1 (555) 123-4567' : 
                                       methodType === 'whatsapp' ? '+1 (555) 123-4567' :
                                       methodType === 'github' ? 'github.com/username' :
                                       methodType === 'linkedin' ? 'linkedin.com/company/name' :
                                       methodType === 'twitter' ? '@username' :
                                       'San Francisco, CA'}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(method.value)}
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Link (href)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={method.href}
                            onChange={(e) => updateContactMethod(index, 'href', e.target.value)}
                            placeholder="mailto:contact@example.com"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(method.href, '_blank')}
                            title="Test link"
                            disabled={!method.href || method.href === '#'}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Select value={method.icon} onValueChange={(value) => updateContactMethod(index, 'icon', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Select value={method.color} onValueChange={(value) => updateContactMethod(index, 'color', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">Preview</Label>
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white`}>
                          {React.createElement(iconMap[method.icon] || Mail, { className: "w-6 h-6" })}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {method.title || 'Contact Method'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {method.description || 'Description'}
                          </p>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                            {method.value || 'Value'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={(checked) => updateContactMethod(index, 'isActive', checked)}
                        />
                        <Label>Active</Label>
                      </div>
                      <Button
                        onClick={() => removeContactMethod(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Features</CardTitle>
            <Button onClick={addFeature} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.features.map((feature, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <Select value={feature.icon} onValueChange={(value) => updateFeature(index, 'icon', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="24/7 Support"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Round-the-clock assistance whenever you need us"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={feature.isActive}
                      onCheckedChange={(checked) => updateFeature(index, 'isActive', checked)}
                    />
                    <Label>Active</Label>
                  </div>
                  <Button
                    onClick={() => removeFeature(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Info Box</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={settings.additionalInfo.title}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                additionalInfo: { ...prev.additionalInfo, title: e.target.value }
              }))}
              placeholder="Need Immediate Help?"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={settings.additionalInfo.description}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                additionalInfo: { ...prev.additionalInfo, description: e.target.value }
              }))}
              placeholder="For urgent technical issues..."
              rows={3}
            />
          </div>
          <div>
            <Label>Response Time</Label>
            <Input
              value={settings.additionalInfo.responseTime}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                additionalInfo: { ...prev.additionalInfo, responseTime: e.target.value }
              }))}
              placeholder="< 2 hours"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.additionalInfo.isActive}
              onCheckedChange={(checked) => setSettings(prev => ({ 
                ...prev, 
                additionalInfo: { ...prev.additionalInfo, isActive: checked }
              }))}
            />
            <Label>Show Additional Info Box</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Icon mapping for preview
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Shield,
  Zap,
  Headphones,
  AlertCircle,
  CheckCircle,
  Github,
  Linkedin,
  Twitter,
  MessageCircle,
  Globe,
  Instagram,
  Facebook,
  Youtube
}; 