'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  Calendar,
  Star,
  MessageSquare,
  Plus,
  Search,
  Filter
} from 'lucide-react';

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  type: 'survey' | 'general' | 'attendance' | 'quiz';
  fields: any[];
  settings: any;
  tags: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  useCase: string;
}

const FORM_TEMPLATES: FormTemplate[] = [
  // Survey Templates
  {
    id: 'customer-feedback',
    name: 'Customer Feedback Survey',
    description: 'Collect detailed feedback from customers about your products or services',
    category: 'Business',
    icon: '💼',
    type: 'survey',
    estimatedTime: '5-10 min',
    difficulty: 'easy',
    useCase: 'Customer satisfaction measurement',
    tags: ['feedback', 'satisfaction', 'business', 'service'],
    fields: [
      {
        id: 'overall-satisfaction',
        label: 'Overall Satisfaction',
        type: 'rating',
        required: true,
        helpText: 'Rate your overall experience with our service'
      },
      {
        id: 'service-quality',
        label: 'Service Quality',
        type: 'scale',
        required: true,
        helpText: 'How would you rate the quality of service? (1-10)'
      },
      {
        id: 'recommendation',
        label: 'Would you recommend us?',
        type: 'radio',
        required: true,
        options: ['Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not']
      },
      {
        id: 'improvements',
        label: 'What could we improve?',
        type: 'long_text',
        required: false,
        helpText: 'Please share any suggestions for improvement'
      },
      {
        id: 'contact-info',
        label: 'Contact Information (Optional)',
        type: 'email',
        required: false,
        helpText: 'Leave your email if you\'d like us to follow up'
      }
    ],
    settings: {
      isPublic: true,
      allowMultipleSubmissions: false,
      allowAnonymous: true,
      identitySchema: { requireEmail: false },
      notifications: { emailOnSubmission: true }
    }
  },

  {
    id: 'employee-satisfaction',
    name: 'Employee Satisfaction Survey',
    description: 'Measure employee engagement and job satisfaction',
    category: 'HR',
    icon: '👥',
    type: 'survey',
    estimatedTime: '10-15 min',
    difficulty: 'medium',
    useCase: 'Workplace culture assessment',
    tags: ['hr', 'employee', 'engagement', 'workplace'],
    fields: [
      {
        id: 'department',
        label: 'Department',
        type: 'dropdown',
        required: true,
        options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Other']
      },
      {
        id: 'tenure',
        label: 'How long have you been with the company?',
        type: 'radio',
        required: true,
        options: ['Less than 6 months', '6-12 months', '1-2 years', '2-5 years', '5+ years']
      },
      {
        id: 'work-satisfaction',
        label: 'Overall Job Satisfaction',
        type: 'scale',
        required: true,
        helpText: 'Rate your overall satisfaction with your current role (1-10)'
      },
      {
        id: 'work-life-balance',
        label: 'Work-Life Balance',
        type: 'radio',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
      },
      {
        id: 'management-support',
        label: 'Management Support',
        type: 'rating',
        required: true,
        helpText: 'How supportive is your direct manager?'
      },
      {
        id: 'company-culture',
        label: 'Company Culture',
        type: 'long_text',
        required: false,
        helpText: 'What do you like most about our company culture?'
      },
      {
        id: 'improvement-suggestions',
        label: 'Areas for Improvement',
        type: 'checkbox',
        required: false,
        options: [
          'Better communication',
          'More training opportunities',
          'Improved work-life balance',
          'Better compensation',
          'More recognition',
          'Clearer career paths',
          'Better tools/equipment',
          'Other'
        ]
      },
      {
        id: 'anonymous-feedback',
        label: 'Anonymous Feedback',
        type: 'long_text',
        required: false,
        helpText: 'Any additional feedback you\'d like to share anonymously?'
      }
    ],
    settings: {
      isPublic: false,
      allowMultipleSubmissions: false,
      allowAnonymous: true,
      notifications: { emailOnSubmission: true }
    }
  },

  // Quiz Templates
  {
    id: 'math-quiz-basic',
    name: 'Basic Math Quiz',
    description: 'Test fundamental mathematical skills and concepts',
    category: 'Education',
    icon: '🔢',
    type: 'quiz',
    estimatedTime: '20-30 min',
    difficulty: 'easy',
    useCase: 'Mathematics assessment',
    tags: ['math', 'quiz', 'education', 'assessment'],
    fields: [
      {
        id: 'student-name',
        label: 'Full Name',
        type: 'short_text',
        required: true
      },
      {
        id: 'student-id',
        label: 'Student ID',
        type: 'short_text',
        required: true
      },
      {
        id: 'grade-level',
        label: 'Grade Level',
        type: 'dropdown',
        required: true,
        options: ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']
      },
      {
        id: 'q1-addition',
        label: 'What is 25 + 17?',
        type: 'number',
        required: true,
        quiz: { correctOptions: [], points: 5 }
      },
      {
        id: 'q2-subtraction',
        label: 'What is 89 - 34?',
        type: 'number',
        required: true,
        quiz: { correctOptions: [], points: 5 }
      },
      {
        id: 'q3-multiplication',
        label: 'What is 12 × 8?',
        type: 'number',
        required: true,
        quiz: { correctOptions: [], points: 5 }
      },
      {
        id: 'q4-division',
        label: 'What is 144 ÷ 12?',
        type: 'number',
        required: true,
        quiz: { correctOptions: [], points: 5 }
      },
      {
        id: 'q5-fractions',
        label: 'Simplify the fraction 12/18',
        type: 'radio',
        required: true,
        options: ['2/3', '1/2', '3/4', '4/6'],
        quiz: { correctOptions: [0], points: 10 }
      }
    ],
    settings: {
      isPublic: false,
      allowMultipleSubmissions: false,
      allowAnonymous: false,
      identitySchema: { requireName: true, requireStudentId: true },
      timer: { enabled: true, minutes: 30 },
      submissionPolicy: { oneAttemptPerIdentity: true },
      quiz: { scoringEnabled: true, passingScore: 70 }
    }
  },

  // Attendance Templates
  {
    id: 'event-attendance',
    name: 'Event Attendance Tracker',
    description: 'Track attendance for events, meetings, or classes',
    category: 'Event Management',
    icon: '📅',
    type: 'attendance',
    estimatedTime: '2-3 min',
    difficulty: 'easy',
    useCase: 'Event attendance tracking',
    tags: ['attendance', 'event', 'meeting', 'tracking'],
    fields: [
      {
        id: 'full-name',
        label: 'Full Name',
        type: 'short_text',
        required: true
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true
      },
      {
        id: 'organization',
        label: 'Organization/Company',
        type: 'short_text',
        required: false
      },
      {
        id: 'position',
        label: 'Position/Title',
        type: 'short_text',
        required: false
      },
      {
        id: 'attendance-type',
        label: 'Attendance Type',
        type: 'radio',
        required: true,
        options: ['In-person', 'Virtual', 'Hybrid']
      },
      {
        id: 'dietary-restrictions',
        label: 'Dietary Restrictions',
        type: 'checkbox',
        required: false,
        options: ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy', 'Other']
      },
      {
        id: 'special-accommodations',
        label: 'Special Accommodations Needed',
        type: 'long_text',
        required: false,
        helpText: 'Please specify any accessibility needs or special accommodations'
      }
    ],
    settings: {
      isPublic: true,
      allowMultipleSubmissions: false,
      allowAnonymous: false,
      identitySchema: { requireName: true, requireEmail: true },
      notifications: { emailOnSubmission: true }
    }
  },

  // General Form Templates
  {
    id: 'contact-form',
    name: 'Contact Us Form',
    description: 'Standard contact form for website inquiries',
    category: 'Business',
    icon: '📧',
    type: 'general',
    estimatedTime: '3-5 min',
    difficulty: 'easy',
    useCase: 'Customer inquiries and support',
    tags: ['contact', 'inquiry', 'support', 'business'],
    fields: [
      {
        id: 'first-name',
        label: 'First Name',
        type: 'short_text',
        required: true
      },
      {
        id: 'last-name',
        label: 'Last Name',
        type: 'short_text',
        required: true
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        required: true
      },
      {
        id: 'phone',
        label: 'Phone Number',
        type: 'short_text',
        required: false
      },
      {
        id: 'company',
        label: 'Company/Organization',
        type: 'short_text',
        required: false
      },
      {
        id: 'inquiry-type',
        label: 'Nature of Inquiry',
        type: 'dropdown',
        required: true,
        options: ['General Question', 'Support Request', 'Sales Inquiry', 'Partnership', 'Media Request', 'Other']
      },
      {
        id: 'subject',
        label: 'Subject',
        type: 'short_text',
        required: true
      },
      {
        id: 'message',
        label: 'Message',
        type: 'long_text',
        required: true,
        helpText: 'Please provide details about your inquiry'
      },
      {
        id: 'urgency',
        label: 'Urgency Level',
        type: 'radio',
        required: false,
        options: ['Low', 'Medium', 'High', 'Critical']
      }
    ],
    settings: {
      isPublic: true,
      allowMultipleSubmissions: true,
      allowAnonymous: false,
      identitySchema: { requireName: true, requireEmail: true },
      notifications: { emailOnSubmission: true }
    }
  },

  // Health & Wellness
  {
    id: 'health-screening',
    name: 'Health Screening Questionnaire',
    description: 'COVID-19 or general health screening form',
    category: 'Health',
    icon: '🏥',
    type: 'general',
    estimatedTime: '5-7 min',
    difficulty: 'easy',
    useCase: 'Health and safety compliance',
    tags: ['health', 'screening', 'safety', 'covid'],
    fields: [
      {
        id: 'full-name',
        label: 'Full Name',
        type: 'short_text',
        required: true
      },
      {
        id: 'employee-id',
        label: 'Employee/Student ID',
        type: 'short_text',
        required: true
      },
      {
        id: 'temperature',
        label: 'Current Temperature (°F)',
        type: 'number',
        required: true,
        validation: { min: 95, max: 105 }
      },
      {
        id: 'symptoms',
        label: 'Are you experiencing any of these symptoms?',
        type: 'checkbox',
        required: true,
        options: [
          'Fever (100°F or higher)',
          'Cough',
          'Shortness of breath',
          'Sore throat',
          'Body aches',
          'Loss of taste/smell',
          'Headache',
          'Fatigue',
          'None of the above'
        ]
      },
      {
        id: 'contact-tracing',
        label: 'Have you been in close contact with anyone who tested positive for COVID-19?',
        type: 'radio',
        required: true,
        options: ['Yes', 'No', 'Unsure']
      },
      {
        id: 'travel-history',
        label: 'Have you traveled internationally in the past 14 days?',
        type: 'radio',
        required: true,
        options: ['Yes', 'No']
      },
      {
        id: 'vaccination-status',
        label: 'Vaccination Status',
        type: 'radio',
        required: false,
        options: ['Fully vaccinated', 'Partially vaccinated', 'Not vaccinated', 'Prefer not to say']
      }
    ],
    settings: {
      isPublic: false,
      allowMultipleSubmissions: true,
      allowAnonymous: false,
      identitySchema: { requireName: true },
      notifications: { emailOnSubmission: true }
    }
  }
];

interface FormTemplatesProps {
  onSelectTemplate: (template: FormTemplate) => void;
  className?: string;
}

export default function FormTemplates({ onSelectTemplate, className = '' }: FormTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const categories = ['All', ...Array.from(new Set(FORM_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = FORM_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'survey': return 'bg-blue-100 text-blue-800';
      case 'quiz': return 'bg-purple-100 text-purple-800';
      case 'attendance': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Form Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose from pre-built templates to get started quickly
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {filteredTemplates.length} templates
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                      <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>⏱️ {template.estimatedTime}</span>
                  <span>📋 {template.fields.length} fields</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1"
                      >
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-2xl">{template.icon}</span>
                          {template.name}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium mb-2">Description</h3>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Use Case</h3>
                          <p className="text-sm text-gray-600">{template.useCase}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Details</h4>
                            <div className="space-y-1 text-sm">
                              <div>📋 {template.fields.length} fields</div>
                              <div>⏱️ {template.estimatedTime}</div>
                              <div>🎯 {template.difficulty}</div>
                              <div>📊 {template.type}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2">Fields Included</h3>
                          <div className="space-y-2">
                            {template.fields.map((field, index) => (
                              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                                <span className="text-sm font-medium">{field.label}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {field.type}
                                  </Badge>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                          <Button
                            onClick={handleUseTemplate}
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Use This Template
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-sm text-gray-600">
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}
    </div>
  );
}

