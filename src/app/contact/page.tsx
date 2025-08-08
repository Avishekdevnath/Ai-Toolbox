'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Star,
  ArrowRight,
  Headphones,
  Shield,
  Zap,
  MessageCircle,
  Github,
  Linkedin,
  Twitter,
  Globe
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import NewFooter from "@/components/NewFooter";

// Icon mapping
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
  MessageCircle,
  Github,
  Linkedin,
  Twitter,
  Globe
};

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/contact-settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Default settings if none are loaded
  const defaultSettings: ContactSettings = {
    contactMethods: [
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
    ],
    pageTitle: "Contact Us",
    pageDescription: "Have questions about our AI tools? Need technical support? We're here to help you succeed.",
    features: [
      {
        icon: "Clock",
        title: "24/7 Support",
        description: "Round-the-clock assistance whenever you need us",
        isActive: true,
        order: 0
      },
      {
        icon: "Shield",
        title: "Secure & Private",
        description: "Your data is protected with enterprise-grade security",
        isActive: true,
        order: 1
      },
      {
        icon: "Zap",
        title: "Fast Response",
        description: "Get answers within 2 hours during business hours",
        isActive: true,
        order: 2
      },
      {
        icon: "Headphones",
        title: "Expert Team",
        description: "AI specialists ready to help with any questions",
        isActive: true,
        order: 3
      }
    ],
    additionalInfo: {
      title: "Need Immediate Help?",
      description: "For urgent technical issues or account problems, our support team is available 24/7.",
      responseTime: "< 2 hours",
      isActive: true
    }
  };

  const currentSettings = settings || defaultSettings;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading contact page...</p>
          </div>
        </div>
        <NewFooter />
      </div>
    );
  }

  const getContactMethodType = (method: ContactMethod) => {
    if (method.href.startsWith('mailto:')) return 'email';
    if (method.href.startsWith('tel:')) return 'phone';
    if (method.href.startsWith('https://wa.me/') || method.href.startsWith('https://api.whatsapp.com/send?phone=')) return 'whatsapp';
    if (method.href.startsWith('https://maps.google.com/')) return 'location';
    if (method.href.startsWith('https://github.com/') || method.href.startsWith('https://gitlab.com/') || method.href.startsWith('https://bitbucket.org/')) return 'github';
    if (method.href.startsWith('https://linkedin.com/') || method.href.startsWith('https://www.linkedin.com/')) return 'linkedin';
    if (method.href.startsWith('https://twitter.com/') || method.href.startsWith('https://x.com/')) return 'twitter';
    if (method.href.startsWith('https://aitoolbox.com') || method.href.startsWith('https://www.aitoolbox.com')) return 'website';
    return 'other';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <div className="flex-grow">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {currentSettings.pageTitle}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {currentSettings.pageDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        {currentSettings.features.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentSettings.features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Clock;
                  return (
                    <div key={index} className="text-center group">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <div className="text-blue-600 dark:text-blue-400">
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Send us a Message
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Fill out the form below and we'll get back to you as soon as possible. 
                  We typically respond within 2 hours during business hours.
                </p>
              </div>
              
              <Card className="border-0 shadow-xl dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Full Name *
                        </Label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="h-12 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Email Address *
                        </Label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-12 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Subject *
                      </Label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="h-12 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="How can we help you?"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Message *
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-green-800 dark:text-green-200 font-medium">Message sent successfully!</p>
                          <p className="text-green-700 dark:text-green-300 text-sm">We'll get back to you within 2 hours.</p>
                        </div>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <div>
                          <p className="text-red-800 dark:text-red-200 font-medium">Something went wrong</p>
                          <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-3" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information (dynamic methods and additional info) */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Other Ways to Reach Us</h3>
                
                {/* Primary Contact Methods - Full UI */}
                <div className="space-y-4 mb-8">
                  {currentSettings.contactMethods
                    .filter(method => {
                      const type = getContactMethodType(method);
                      return ['email', 'phone', 'location'].includes(type);
                    })
                    .map((method, index) => {
                      const IconComponent = iconMap[method.icon] || Mail;
                      return (
                        <a key={index} href={method.href} className="group block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{method.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{method.description}</p>
                              <p className="text-blue-600 dark:text-blue-400 font-medium">{method.value}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </div>
                        </a>
                      );
                    })}
                </div>

                {/* Social Media - Icon Only */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect With Us</h4>
                  <div className="flex flex-wrap gap-4">
                    {currentSettings.contactMethods
                      .filter(method => {
                        const type = getContactMethodType(method);
                        return !['email', 'phone', 'location'].includes(type);
                      })
                      .map((method, index) => {
                        const IconComponent = iconMap[method.icon] || Globe;
                        return (
                          <a 
                            key={index} 
                            href={method.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                            title={method.title}
                          >
                            <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                          </a>
                        );
                      })}
                  </div>
                </div>
              </div>
              
              {currentSettings.additionalInfo && currentSettings.additionalInfo.isActive && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">{currentSettings.additionalInfo.title}</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">{currentSettings.additionalInfo.description}</p>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Response time: {currentSettings.additionalInfo.responseTime}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewFooter />
    </div>
  );
} 