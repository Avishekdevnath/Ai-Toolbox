'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, IdCard, Shield, AlertCircle, CheckCircle } from 'lucide-react';

export interface IdentityData {
  name?: string;
  email?: string;
  studentId?: string;
}

export interface IdentityGateProps {
  requireName?: boolean;
  requireEmail?: boolean;
  requireStudentId?: boolean;
  onSubmit: (identity: IdentityData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
  title?: string;
  description?: string;
}

export default function IdentityGate({
  requireName = false,
  requireEmail = false,
  requireStudentId = false,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  title = "Verify Your Identity",
  description = "Please provide your information before starting the quiz."
}: IdentityGateProps) {
  const [identity, setIdentity] = useState<IdentityData>({
    name: '',
    email: '',
    studentId: ''
  });

  const [validationErrors, setValidationErrors] = useState<Partial<IdentityData>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStudentId = (studentId: string): boolean => {
    // Basic validation - alphanumeric, 5-20 characters
    const studentIdRegex = /^[A-Za-z0-9]{5,20}$/;
    return studentIdRegex.test(studentId);
  };

  const validateForm = (): boolean => {
    const errors: Partial<IdentityData> = {};

    if (requireName && !identity.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (requireEmail) {
      if (!identity.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!validateEmail(identity.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (requireStudentId) {
      if (!identity.studentId?.trim()) {
        errors.studentId = 'Student ID is required';
      } else if (!validateStudentId(identity.studentId)) {
        errors.studentId = 'Please enter a valid Student ID (5-20 alphanumeric characters)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        name: identity.name?.trim(),
        email: identity.email?.toLowerCase().trim(),
        studentId: identity.studentId?.trim()
      });
    }
  };

  const handleInputChange = (field: keyof IdentityData, value: string) => {
    setIdentity(prev => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRequiredFields = () => {
    const fields = [];
    if (requireName) fields.push('Name');
    if (requireEmail) fields.push('Email');
    if (requireStudentId) fields.push('Student ID');
    return fields;
  };

  const hasAnyRequirements = requireName || requireEmail || requireStudentId;

  if (!hasAnyRequirements) {
    return null; // No identity requirements, skip the gate
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {title}
          </h1>
          <p className="text-slate-300 text-lg">
            {description}
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Required Fields Info */}
            {getRequiredFields().length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Required Information</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getRequiredFields().map(field => (
                    <span
                      key={field}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              {requireName && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-gray-700 font-medium">
                    <User className="w-4 h-4 text-gray-500" />
                    Full Name
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={identity.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      validationErrors.name 
                        ? 'border-red-300 bg-red-50 text-red-900' 
                        : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                    }`}
                    disabled={isLoading}
                    style={{ color: validationErrors.name ? '#7f1d1d' : '#111827' }}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              {requireEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={identity.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      validationErrors.email 
                        ? 'border-red-300 bg-red-50 text-red-900' 
                        : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                    }`}
                    disabled={isLoading}
                    style={{ color: validationErrors.email ? '#7f1d1d' : '#111827' }}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              )}

              {/* Student ID Field */}
              {requireStudentId && (
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="flex items-center gap-2 text-gray-700 font-medium">
                    <IdCard className="w-4 h-4 text-gray-500" />
                    Student ID
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    value={identity.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Enter your student ID"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                      validationErrors.studentId 
                        ? 'border-red-300 bg-red-50 text-red-900' 
                        : 'border-gray-200 bg-white text-gray-900 focus:border-blue-500'
                    }`}
                    disabled={isLoading}
                    style={{ color: validationErrors.studentId ? '#7f1d1d' : '#111827' }}
                  />
                  {validationErrors.studentId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.studentId}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Student ID should be 5-20 alphanumeric characters
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Continue to Quiz'
                  )}
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-1 text-gray-800">Privacy & Security</p>
                  <p>Your information is securely encrypted and will only be used for quiz verification purposes.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

