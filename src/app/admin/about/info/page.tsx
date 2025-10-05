'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

interface AboutInfo {
  name?: string;
  title?: string;
  description?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  portfolioUrl?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  experience?: Array<{
    title: string;
    company: string;
    location: string;
    period: string;
    type: string;
    skills: string[];
    website?: string;
    description?: string;
    isActive: boolean;
    order: number;
  }>;
  education?: Array<{
    title: string;
    institution: string;
    field: string;
    period: string;
    isActive: boolean;
    order: number;
  }>;
  skills?: Array<{
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'other';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    isActive: boolean;
    order: number;
  }>;
  pageSettings?: {
    showExperience: boolean;
    showEducation: boolean;
    showSkills: boolean;
    showContact: boolean;
  };
}

export default function AboutInfoPage() {
  const [info, setInfo] = useState<AboutInfo>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadAboutInfo();
  }, []);

  const loadAboutInfo = async () => {
    try {
      const res = await fetch('/api/about/info', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setInfo(data?.data || {});
      }
    } catch (e) {
      console.error('Failed to load about info:', e);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!info.name?.trim()) errors.push('Name is required');
    if (!info.title?.trim()) errors.push('Title is required');
    if (!info.description?.trim()) errors.push('Description is required');
    if (!info.email?.trim()) errors.push('Email is required');
    if (!info.phone?.trim()) errors.push('Phone is required');
    if (!info.location?.trim()) errors.push('Location is required');
    if (!info.portfolioUrl?.trim()) errors.push('Portfolio URL is required');
    
    return errors;
  };

  const handleSave = async () => {
    // Validate required fields
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(`Please fill in all required fields:\n${validationErrors.join('\n')}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/about/info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save about info:', e);
      alert(`Failed to save: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    loadAboutInfo();
  };

  const addExperience = () => {
    const newExp = {
      title: '',
      company: '',
      location: '',
      period: '',
      type: 'Full-time',
      skills: [],
      website: '',
      description: '',
      isActive: true,
      order: (info.experience?.length || 0) + 1
    };
    setInfo(prev => ({
      ...prev,
      experience: [...(prev.experience || []), newExp]
    }));
  };

  const removeExperience = (index: number) => {
    setInfo(prev => ({
      ...prev,
      experience: prev.experience?.filter((_, i) => i !== index) || []
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    setInfo(prev => ({
      ...prev,
      experience: prev.experience?.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      ) || []
    }));
  };

  const addEducation = () => {
    const newEdu = {
      title: '',
      institution: '',
      field: '',
      period: '',
      isActive: true,
      order: (info.education?.length || 0) + 1
    };
    setInfo(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }));
  };

  const removeEducation = (index: number) => {
    setInfo(prev => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index) || []
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    setInfo(prev => ({
      ...prev,
      education: prev.education?.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ) || []
    }));
  };

  const addSkill = () => {
    const newSkill = {
      name: '',
      category: 'other' as const,
      level: 'intermediate' as const,
      isActive: true,
      order: (info.skills?.length || 0) + 1
    };
    setInfo(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill]
    }));
  };

  const removeSkill = (index: number) => {
    setInfo(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || []
    }));
  };

  const updateSkill = (index: number, field: string, value: any) => {
    setInfo(prev => ({
      ...prev,
      skills: prev.skills?.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      ) || []
    }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          About Page Information
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your personal information displayed on the About page.
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={info.name || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, name: e.target.value }))} 
                  placeholder="Your full name" 
                />
              </div>
              <div>
                <Label htmlFor="title">Professional Title *</Label>
                <Input 
                  id="title" 
                  value={info.title || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, title: e.target.value }))} 
                  placeholder="e.g., Full-Stack Developer" 
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  value={info.description || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, description: e.target.value }))} 
                  placeholder="Brief description about yourself..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input 
                  id="avatar" 
                  value={info.avatar || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, avatar: e.target.value }))} 
                  placeholder="https://example.com/avatar.jpg" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  value={info.email || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, email: e.target.value }))} 
                  placeholder="your.email@example.com" 
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  value={info.phone || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, phone: e.target.value }))} 
                  placeholder="+1 555 123 4567" 
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  value={info.location || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, location: e.target.value }))} 
                  placeholder="City, Country" 
                />
              </div>
              <div>
                <Label htmlFor="portfolioUrl">Portfolio URL *</Label>
                <Input 
                  id="portfolioUrl" 
                  value={info.portfolioUrl || ''} 
                  onChange={(e) => setInfo(prev => ({ ...prev, portfolioUrl: e.target.value }))} 
                  placeholder="https://your-portfolio.com" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={info.socialLinks?.linkedin || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                  }))} 
                  placeholder="https://linkedin.com/in/yourprofile" 
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input 
                  id="github" 
                  value={info.socialLinks?.github || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, github: e.target.value }
                  }))} 
                  placeholder="https://github.com/yourusername" 
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input 
                  id="twitter" 
                  value={info.socialLinks?.twitter || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                  }))} 
                  placeholder="https://twitter.com/yourhandle" 
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input 
                  id="instagram" 
                  value={info.socialLinks?.instagram || ''} 
                  onChange={(e) => setInfo(prev => ({ 
                    ...prev, 
                    socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                  }))} 
                  placeholder="https://instagram.com/yourhandle" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Work Experience
              </span>
              <Button onClick={addExperience} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {info.experience?.map((exp, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Experience #{index + 1}</h4>
                  <Button 
                    onClick={() => removeExperience(index)} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input 
                      value={exp.title} 
                      onChange={(e) => updateExperience(index, 'title', e.target.value)} 
                      placeholder="Job title" 
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input 
                      value={exp.company} 
                      onChange={(e) => updateExperience(index, 'company', e.target.value)} 
                      placeholder="Company name" 
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input 
                      value={exp.location} 
                      onChange={(e) => updateExperience(index, 'location', e.target.value)} 
                      placeholder="City, Country" 
                    />
                  </div>
                  <div>
                    <Label>Period</Label>
                    <Input 
                      value={exp.period} 
                      onChange={(e) => updateExperience(index, 'period', e.target.value)} 
                      placeholder="Jan 2020 - Present" 
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Input 
                      value={exp.type} 
                      onChange={(e) => updateExperience(index, 'type', e.target.value)} 
                      placeholder="Full-time, Part-time, etc." 
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input 
                      value={exp.website || ''} 
                      onChange={(e) => updateExperience(index, 'website', e.target.value)} 
                      placeholder="https://company.com" 
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea 
                    value={exp.description || ''} 
                    onChange={(e) => updateExperience(index, 'description', e.target.value)} 
                    placeholder="Brief description of your role..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Skills (comma-separated)</Label>
                  <Input 
                    value={exp.skills.join(', ')} 
                    onChange={(e) => updateExperience(index, 'skills', e.target.value.split(',').map(s => s.trim()))} 
                    placeholder="React, Node.js, MongoDB" 
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Education
              </span>
              <Button onClick={addEducation} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {info.education?.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Education #{index + 1}</h4>
                  <Button 
                    onClick={() => removeEducation(index)} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Degree Title</Label>
                    <Input 
                      value={edu.title} 
                      onChange={(e) => updateEducation(index, 'title', e.target.value)} 
                      placeholder="Bachelor of Science" 
                    />
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Input 
                      value={edu.institution} 
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)} 
                      placeholder="University name" 
                    />
                  </div>
                  <div>
                    <Label>Field of Study</Label>
                    <Input 
                      value={edu.field} 
                      onChange={(e) => updateEducation(index, 'field', e.target.value)} 
                      placeholder="Computer Science" 
                    />
                  </div>
                  <div>
                    <Label>Period</Label>
                    <Input 
                      value={edu.period} 
                      onChange={(e) => updateEducation(index, 'period', e.target.value)} 
                      placeholder="2020 - 2024" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Skills
              </span>
              <Button onClick={addSkill} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {info.skills?.map((skill, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Skill #{index + 1}</h4>
                  <Button 
                    onClick={() => removeSkill(index)} 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Skill Name</Label>
                    <Input 
                      value={skill.name} 
                      onChange={(e) => updateSkill(index, 'name', e.target.value)} 
                      placeholder="JavaScript" 
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select 
                      value={skill.category} 
                      onChange={(e) => updateSkill(index, 'category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="database">Database</option>
                      <option value="devops">DevOps</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Level</Label>
                    <select 
                      value={skill.level} 
                      onChange={(e) => updateSkill(index, 'level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
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
