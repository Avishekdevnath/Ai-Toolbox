'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Wrench, 
  Search, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star,
  Target,
  Calculator,
  FileText,
  Link as LinkIcon,
  QrCode,
  DollarSign,
  Users,
  Brain,
  Zap,
  Shield
} from 'lucide-react';

interface ToolsManagementProps {
  userId: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  usageCount: number;
  lastUsed?: string;
  status: 'active' | 'beta' | 'coming-soon';
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const tools: Tool[] = [
  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    description: 'Analyze strengths, weaknesses, opportunities, and threats',
    category: 'Business',
    usageCount: 0,
    status: 'active',
    icon: BarChart3,
    href: '/tools/swot-analysis'
  },
  {
    id: 'finance-advisor',
    name: 'Finance Advisor',
    description: 'Get personalized financial advice and planning',
    category: 'Finance',
    usageCount: 0,
    status: 'active',
    icon: DollarSign,
    href: '/tools/finance-advisor'
  },
  {
    id: 'diet-planner',
    name: 'Diet Planner',
    description: 'Create personalized meal plans and nutrition advice',
    category: 'Health',
    usageCount: 0,
    status: 'active',
    icon: Target,
    href: '/tools/diet-planner'
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate age and time differences',
    category: 'Utility',
    usageCount: 0,
    status: 'active',
    icon: Calculator,
    href: '/tools/age-calculator'
  },
  {
    id: 'resume-reviewer',
    name: 'Resume Reviewer',
    description: 'Get AI-powered resume feedback and improvements',
    category: 'Career',
    usageCount: 0,
    status: 'active',
    icon: FileText,
    href: '/tools/resume-reviewer'
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Create short, shareable links',
    category: 'Utility',
    usageCount: 0,
    status: 'active',
    icon: LinkIcon,
    href: '/tools/url-shortener'
  },
  {
    id: 'qr-generator',
    name: 'QR Generator',
    description: 'Generate QR codes for any content',
    category: 'Utility',
    usageCount: 0,
    status: 'active',
    icon: QrCode,
    href: '/tools/qr-generator'
  },
  {
    id: 'qr-scanner',
    name: 'QR Scanner',
    description: 'Scan QR codes with your camera',
    category: 'Utility',
    usageCount: 0,
    status: 'active',
    icon: QrCode,
    href: '/tools/qr-scanner'
  },
  {
    id: 'quote-generator',
    name: 'Quote Generator',
    description: 'Generate inspirational quotes and sayings',
    category: 'Inspiration',
    usageCount: 0,
    status: 'active',
    icon: Brain,
    href: '/tools/quote-generator'
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units of measurement',
    category: 'Utility',
    usageCount: 0,
    status: 'active',
    icon: Calculator,
    href: '/tools/unit-converter'
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure, random passwords',
    category: 'Security',
    usageCount: 0,
    status: 'active',
    icon: Shield,
    href: '/tools/password-generator'
  },
  {
    id: 'price-tracker',
    name: 'Price Tracker',
    description: 'Track product prices and get alerts',
    category: 'Shopping',
    usageCount: 0,
    status: 'beta',
    icon: TrendingUp,
    href: '/tools/price-tracker'
  },
  {
    id: 'interview-ai',
    name: 'Interview AI',
    description: 'Practice interviews with AI assistance',
    category: 'Career',
    usageCount: 0,
    status: 'coming-soon',
    icon: Users,
    href: '/tools/interview-ai'
  }
];

export default function ToolsManagement({ userId }: ToolsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toolsWithStats, setToolsWithStats] = useState<Tool[]>(tools);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['all', ...Array.from(new Set(tools.map(tool => tool.category)))];

  useEffect(() => {
    fetchToolUsageStats();
  }, [userId]);

  const fetchToolUsageStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/user/stats');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // Create a map of tool usage data
          const toolUsageMap = new Map();
          
          // Process recent usage data
          if (data.data.recentUsage) {
            data.data.recentUsage.forEach((usage: any) => {
              const existing = toolUsageMap.get(usage.toolSlug);
              if (existing) {
                existing.count += usage.usageCount || 1;
                if (usage.createdAt > existing.lastUsed) {
                  existing.lastUsed = usage.createdAt;
                }
              } else {
                toolUsageMap.set(usage.toolSlug, {
                  count: usage.usageCount || 1,
                  lastUsed: usage.createdAt
                });
              }
            });
          }

          // Update tools with real usage data
          const updatedTools = tools.map(tool => ({
            ...tool,
            usageCount: toolUsageMap.get(tool.id)?.count || 0,
            lastUsed: toolUsageMap.get(tool.id)?.lastUsed
          }));

          setToolsWithStats(updatedTools);
        } else {
          // If no real data, use default tools with 0 usage counts
          setToolsWithStats(tools.map(tool => ({
            ...tool,
            usageCount: 0
          })));
        }
      } else {
        // If API fails, use default tools with 0 usage counts
        console.warn('API response not ok, using default tool stats');
        setToolsWithStats(tools.map(tool => ({
          ...tool,
          usageCount: 0
        })));
      }
    } catch (err: any) {
      console.error('Error fetching tool usage stats:', err);
      
      // Use default tools with 0 usage counts instead of showing error
      setToolsWithStats(tools.map(tool => ({
        ...tool,
        usageCount: 0
      })));
      
      // Only show error for critical failures
      if (err.message && !err.message.includes('fetch')) {
        setError('Some tool statistics may not be available');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = toolsWithStats.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchToolUsageStats} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const IconComponent = tool.icon;
          
          return (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      <Badge className={getStatusColor(tool.status)}>
                        {tool.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Category: {tool.category}</span>
                  <span>{tool.usageCount} uses</span>
                </div>

                <div className="flex gap-2">
                  <Link href={tool.href} className="flex-1">
                    <Button className="w-full" disabled={tool.status === 'coming-soon'}>
                      <Zap className="w-4 h-4 mr-2" />
                      {tool.status === 'coming-soon' ? 'Coming Soon' : 'Use Tool'}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tools found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {toolsWithStats.filter(t => t.status === 'active').length}
              </div>
              <div className="text-sm text-gray-500">Active Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {toolsWithStats.reduce((sum, tool) => sum + tool.usageCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Uses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length - 1}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 