'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Clock,
  Shield,
  Bell,
  Globe,
  FileText,
  Users,
  Lock,
  Mail,
  Database,
  AlertTriangle,
  CheckCircle,
  Save
} from 'lucide-react';

export interface FormSettingsData {
  // Basic Settings
  isPublic: boolean;
  allowMultipleSubmissions: boolean;
  allowAnonymous: boolean;

  // Identity Schema
  identitySchema: {
    requireName?: boolean;
    requireEmail?: boolean;
    requireStudentId?: boolean;
  };

  // Timer Settings
  timer?: {
    enabled: boolean;
    minutes: number;
  };

  // Availability Windows
  startAt?: Date;
  endAt?: Date;

  // Submission Policies
  submissionPolicy?: {
    dedupeBy?: Array<'email' | 'studentId'>;
    oneAttemptPerIdentity?: boolean;
    maxSubmissions?: number;
    requireCaptcha?: boolean;
  };

  // Quiz Settings
  quiz?: {
    scoringEnabled: boolean;
    passingScore?: number;
    showResultsImmediately?: boolean;
    allowReview?: boolean;
    randomizeQuestions?: boolean;
  };

  // Notification Settings
  notifications?: {
    emailOnSubmission?: boolean;
    emailOnCompletion?: boolean;
    webhookUrl?: string;
    slackWebhook?: string;
  };

  // Security Settings
  security?: {
    requireLogin?: boolean;
    ipWhitelist?: string[];
    passwordProtection?: string;
    preventCopyPaste?: boolean;
    fullscreenMode?: boolean;
  };

  // Advanced Settings
  advanced?: {
    saveProgress?: boolean;
    allowEdit?: boolean;
    confirmationMessage?: string;
    redirectUrl?: string;
    customCss?: string;
    customJs?: string;
  };
}

interface FormSettingsProps {
  settings: FormSettingsData;
  onChange: (settings: FormSettingsData) => void;
  formType: 'survey' | 'general' | 'attendance' | 'quiz';
  isPublished: boolean;
}

export default function FormSettings({
  settings,
  onChange,
  formType,
  isPublished
}: FormSettingsProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSettings = (updates: Partial<FormSettingsData>) => {
    onChange({ ...settings, ...updates });
    setHasUnsavedChanges(true);
  };

  const updateNestedSettings = <K extends keyof FormSettingsData>(
    key: K,
    updates: Partial<NonNullable<FormSettingsData[K]>>
  ) => {
    const currentValue = settings[key] || {};
    updateSettings({
      [key]: { ...currentValue, ...updates }
    } as Partial<FormSettingsData>);
  };

  const handleSave = () => {
    setHasUnsavedChanges(false);
    // The parent component will handle the actual save
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold">Form Settings</h2>
          {isPublished && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Globe className="w-3 h-3 mr-1" />
              Published
            </Badge>
          )}
        </div>
        {hasUnsavedChanges && (
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Availability
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2" disabled={formType !== 'quiz'}>
                <FileText className="w-4 h-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Basic Settings */}
            <TabsContent value="basic" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={settings.isPublic}
                    onCheckedChange={(checked) => updateSettings({ isPublic: checked })}
                  />
                  <Label htmlFor="isPublic" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Make form public (anyone can access via URL)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowMultipleSubmissions"
                    checked={settings.allowMultipleSubmissions}
                    onCheckedChange={(checked) => updateSettings({ allowMultipleSubmissions: checked })}
                  />
                  <Label htmlFor="allowMultipleSubmissions" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Allow multiple submissions per person
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowAnonymous"
                    checked={settings.allowAnonymous}
                    onCheckedChange={(checked) => updateSettings({ allowAnonymous: checked })}
                  />
                  <Label htmlFor="allowAnonymous">Allow anonymous submissions</Label>
                </div>

                {/* Identity Requirements */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Identity Requirements</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireName"
                        checked={settings.identitySchema?.requireName || false}
                        onCheckedChange={(checked) => updateNestedSettings('identitySchema', { requireName: checked })}
                      />
                      <Label htmlFor="requireName">Require Name</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireEmail"
                        checked={settings.identitySchema?.requireEmail || false}
                        onCheckedChange={(checked) => updateNestedSettings('identitySchema', { requireEmail: checked })}
                      />
                      <Label htmlFor="requireEmail">Require Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireStudentId"
                        checked={settings.identitySchema?.requireStudentId || false}
                        onCheckedChange={(checked) => updateNestedSettings('identitySchema', { requireStudentId: checked })}
                      />
                      <Label htmlFor="requireStudentId">Require Student ID</Label>
                    </div>
                  </div>
                </div>

                {/* Timer Settings */}
                <div className="space-y-3">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timer Settings
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="timerEnabled"
                        checked={settings.timer?.enabled || false}
                        onCheckedChange={(checked) => updateNestedSettings('timer', {
                          enabled: checked,
                          minutes: settings.timer?.minutes || 30
                        })}
                      />
                      <Label htmlFor="timerEnabled">Enable Timer</Label>
                    </div>
                    {settings.timer?.enabled && (
                      <div className="space-y-2">
                        <Label htmlFor="timerMinutes">Duration (minutes)</Label>
                        <Input
                          id="timerMinutes"
                          type="number"
                          min="1"
                          max="480"
                          value={settings.timer?.minutes || 30}
                          onChange={(e) => updateNestedSettings('timer', {
                            enabled: true,
                            minutes: parseInt(e.target.value) || 30
                          })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Availability Settings */}
            <TabsContent value="availability" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Start Date & Time
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={settings.startAt ? new Date(settings.startAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateSettings({
                      startAt: e.target.value ? new Date(e.target.value) : undefined
                    })}
                  />
                  <p className="text-sm text-gray-500">Form will not be available before this time</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    End Date & Time
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={settings.endAt ? new Date(settings.endAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateSettings({
                      endAt: e.target.value ? new Date(e.target.value) : undefined
                    })}
                  />
                  <p className="text-sm text-gray-500">Form will not accept responses after this time</p>
                </div>

                {/* Submission Limits */}
                <Separator />
                <div className="space-y-3">
                  <Label className="text-base font-medium">Submission Limits</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxSubmissions">Maximum Submissions</Label>
                      <Input
                        id="maxSubmissions"
                        type="number"
                        min="1"
                        placeholder="Unlimited"
                        value={settings.submissionPolicy?.maxSubmissions || ''}
                        onChange={(e) => updateNestedSettings('submissionPolicy', {
                          maxSubmissions: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Deduplication</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="dedupeEmail"
                            checked={settings.submissionPolicy?.dedupeBy?.includes('email') || false}
                            onChange={(e) => {
                              const current = settings.submissionPolicy?.dedupeBy || [];
                              const newDedupeBy = e.target.checked
                                ? [...current, 'email']
                                : current.filter(x => x !== 'email');
                              updateNestedSettings('submissionPolicy', { dedupeBy: newDedupeBy });
                            }}
                          />
                          <Label htmlFor="dedupeEmail">By Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="dedupeStudentId"
                            checked={settings.submissionPolicy?.dedupeBy?.includes('studentId') || false}
                            onChange={(e) => {
                              const current = settings.submissionPolicy?.dedupeBy || [];
                              const newDedupeBy = e.target.checked
                                ? [...current, 'studentId']
                                : current.filter(x => x !== 'studentId');
                              updateNestedSettings('submissionPolicy', { dedupeBy: newDedupeBy });
                            }}
                          />
                          <Label htmlFor="dedupeStudentId">By Student ID</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireLogin"
                    checked={settings.security?.requireLogin || false}
                    onCheckedChange={(checked) => updateNestedSettings('security', { requireLogin: checked })}
                  />
                  <Label htmlFor="requireLogin" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Require user login to access
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireCaptcha"
                    checked={settings.submissionPolicy?.requireCaptcha || false}
                    onCheckedChange={(checked) => updateNestedSettings('submissionPolicy', { requireCaptcha: checked })}
                  />
                  <Label htmlFor="requireCaptcha">Require CAPTCHA verification</Label>
                </div>

                {formType === 'quiz' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="preventCopyPaste"
                        checked={settings.security?.preventCopyPaste || false}
                        onCheckedChange={(checked) => updateNestedSettings('security', { preventCopyPaste: checked })}
                      />
                      <Label htmlFor="preventCopyPaste">Prevent copy/paste operations</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="fullscreenMode"
                        checked={settings.security?.fullscreenMode || false}
                        onCheckedChange={(checked) => updateNestedSettings('security', { fullscreenMode: checked })}
                      />
                      <Label htmlFor="fullscreenMode">Force fullscreen mode during quiz</Label>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="passwordProtection">Password Protection</Label>
                  <Input
                    id="passwordProtection"
                    type="password"
                    placeholder="Optional password to access form"
                    value={settings.security?.passwordProtection || ''}
                    onChange={(e) => updateNestedSettings('security', { passwordProtection: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist (one per line)</Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="192.168.1.1&#10;10.0.0.1&#10;172.16.0.1"
                    rows={4}
                    value={settings.security?.ipWhitelist?.join('\n') || ''}
                    onChange={(e) => updateNestedSettings('security', {
                      ipWhitelist: e.target.value ? e.target.value.split('\n').filter(ip => ip.trim()) : undefined
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Quiz Settings */}
            <TabsContent value="quiz" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="scoringEnabled"
                    checked={settings.quiz?.scoringEnabled || false}
                    onCheckedChange={(checked) => updateNestedSettings('quiz', { scoringEnabled: checked })}
                  />
                  <Label htmlFor="scoringEnabled">Enable automatic scoring</Label>
                </div>

                {settings.quiz?.scoringEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.quiz?.passingScore || ''}
                      onChange={(e) => updateNestedSettings('quiz', {
                        passingScore: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="showResultsImmediately"
                    checked={settings.quiz?.showResultsImmediately || false}
                    onCheckedChange={(checked) => updateNestedSettings('quiz', { showResultsImmediately: checked })}
                  />
                  <Label htmlFor="showResultsImmediately">Show results immediately after submission</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowReview"
                    checked={settings.quiz?.allowReview || false}
                    onCheckedChange={(checked) => updateNestedSettings('quiz', { allowReview: checked })}
                  />
                  <Label htmlFor="allowReview">Allow students to review answers after submission</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="randomizeQuestions"
                    checked={settings.quiz?.randomizeQuestions || false}
                    onCheckedChange={(checked) => updateNestedSettings('quiz', { randomizeQuestions: checked })}
                  />
                  <Label htmlFor="randomizeQuestions">Randomize question order</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="oneAttemptPerIdentity"
                    checked={settings.submissionPolicy?.oneAttemptPerIdentity || false}
                    onCheckedChange={(checked) => updateNestedSettings('submissionPolicy', { oneAttemptPerIdentity: checked })}
                  />
                  <Label htmlFor="oneAttemptPerIdentity">Limit to one attempt per identity</Label>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailOnSubmission"
                    checked={settings.notifications?.emailOnSubmission || false}
                    onCheckedChange={(checked) => updateNestedSettings('notifications', { emailOnSubmission: checked })}
                  />
                  <Label htmlFor="emailOnSubmission" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email notification on each submission
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailOnCompletion"
                    checked={settings.notifications?.emailOnCompletion || false}
                    onCheckedChange={(checked) => updateNestedSettings('notifications', { emailOnCompletion: checked })}
                  />
                  <Label htmlFor="emailOnCompletion">Email summary when form reaches target responses</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://your-app.com/webhook"
                    value={settings.notifications?.webhookUrl || ''}
                    onChange={(e) => updateNestedSettings('notifications', { webhookUrl: e.target.value || undefined })}
                  />
                  <p className="text-sm text-gray-500">Receive real-time notifications via webhook</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                  <Input
                    id="slackWebhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.notifications?.slackWebhook || ''}
                    onChange={(e) => updateNestedSettings('notifications', { slackWebhook: e.target.value || undefined })}
                  />
                  <p className="text-sm text-gray-500">Send notifications to Slack channel</p>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="saveProgress"
                    checked={settings.advanced?.saveProgress || false}
                    onCheckedChange={(checked) => updateNestedSettings('advanced', { saveProgress: checked })}
                  />
                  <Label htmlFor="saveProgress">Allow saving progress (requires login)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowEdit"
                    checked={settings.advanced?.allowEdit || false}
                    onCheckedChange={(checked) => updateNestedSettings('advanced', { allowEdit: checked })}
                  />
                  <Label htmlFor="allowEdit">Allow respondents to edit their submissions</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmationMessage">Custom Confirmation Message</Label>
                  <Textarea
                    id="confirmationMessage"
                    placeholder="Thank you for your submission!"
                    rows={3}
                    value={settings.advanced?.confirmationMessage || ''}
                    onChange={(e) => updateNestedSettings('advanced', { confirmationMessage: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirectUrl">Redirect URL After Submission</Label>
                  <Input
                    id="redirectUrl"
                    type="url"
                    placeholder="https://example.com/thank-you"
                    value={settings.advanced?.redirectUrl || ''}
                    onChange={(e) => updateNestedSettings('advanced', { redirectUrl: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    placeholder="body { background: #f0f0f0; }"
                    rows={4}
                    value={settings.advanced?.customCss || ''}
                    onChange={(e) => updateNestedSettings('advanced', { customCss: e.target.value || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customJs">Custom JavaScript</Label>
                  <Textarea
                    id="customJs"
                    placeholder="console.log('Form loaded');"
                    rows={4}
                    value={settings.advanced?.customJs || ''}
                    onChange={(e) => updateNestedSettings('advanced', { customJs: e.target.value || undefined })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

