'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  X, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function PasswordChangeModal({ isOpen, onClose, userEmail }: PasswordChangeModalProps) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'current' | 'otp' | 'new'>('current');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (step === 'current') {
        // Verify current password and send OTP
        const res = await fetch('/api/user/change-password/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Current password is incorrect');
        
        setStep('otp');
        setSuccess('OTP sent to your email. Please check your inbox.');
      } else if (step === 'otp') {
        // Verify OTP
        const res = await fetch('/api/user/change-password/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Invalid OTP code');
        
        setStep('new');
        setSuccess('OTP verified. Now enter your new password.');
      } else if (step === 'new') {
        // Update password
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        const res = await fetch('/api/user/change-password/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword, otpCode }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update password');
        
        setSuccess('🎉 Password updated successfully! You will receive an email confirmation shortly.');
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('current');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setError('');
    setSuccess('');
    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 'current': return 'Enter your current password to continue';
      case 'otp': return 'Enter the OTP code sent to your email';
      case 'new': return 'Enter your new password';
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'current': return 'Send OTP';
      case 'otp': return 'Verify OTP';
      case 'new': return 'Update Password';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center text-lg text-gray-900">
                <Shield className="w-5 h-5 mr-2 text-gray-700" />
                Change Password
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                {getStepTitle()}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-4 bg-white">
            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Current Password */}
            {step === 'current' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-700">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>We'll send an OTP to <strong className="text-gray-900">{userEmail}</strong> to verify your identity.</p>
                </div>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode" className="text-gray-700">OTP Code</Label>
                  <Input
                    id="otpCode"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter 6-digit OTP code"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  <p>Check your email for the OTP code. It may take a few minutes to arrive.</p>
                  <p className="mt-1">Didn't receive it? <button 
                    className="text-blue-600 hover:text-blue-700 hover:underline" 
                    onClick={() => setStep('current')}
                  >
                    Try again
                  </button></p>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 'new' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Confirm your new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p className="font-medium text-gray-700">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>At least 8 characters long</li>
                    <li>Mix of letters, numbers, and symbols recommended</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handlePasswordChange} 
                disabled={isLoading || (step === 'current' && !currentPassword) || (step === 'otp' && !otpCode) || (step === 'new' && (!newPassword || !confirmPassword))}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  getButtonText()
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2 pt-2">
              <div className={`w-2 h-2 rounded-full ${step === 'current' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'otp' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'new' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
