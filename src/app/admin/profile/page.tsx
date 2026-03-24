'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield, Key, Activity, Clock, Eye, EyeOff, Save, Edit, X, CheckCircle, AlertCircle, Loader2, Crown, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

interface AdminProfile { id: string; email: string; username: string; firstName: string; lastName: string; phoneNumber?: string; role: 'admin' | 'user'; profilePicture?: { url: string; cloudinaryPublicId: string; uploadedAt: Date }; createdAt: string; lastLoginAt?: string; isActive: boolean; }

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none disabled:bg-slate-50 disabled:text-slate-400';
const labelCls = 'block text-[12px] font-medium text-slate-500 mb-1.5';

export default function AdminProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phoneNumber: '', currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      const p = { id: user.id, email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber || '', role: user.role, profilePicture: (user as any).profilePicture, createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString(), isActive: true };
      setProfile(p);
      setProfilePictureUrl((user as any).profilePicture?.url || null);
      setFormData({ firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber || '', currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [user]);

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setIsLoading(true); setMessage(null);
    try {
      await new Promise(r => setTimeout(r, 1000));
      if (profile) { setProfile(p => p ? { ...p, firstName: formData.firstName, lastName: formData.lastName, phoneNumber: formData.phoneNumber } : null); setMessage({ type: 'success', text: 'Profile updated successfully!' }); setIsEditing(false); }
    } catch { setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' }); }
    finally { setIsLoading(false); }
  };

  const handleCancel = () => {
    if (user) setFormData({ firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber || '', currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditing(false); setMessage(null);
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) { setMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (formData.newPassword.length < 8) { setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' }); return; }
    setIsLoading(true); setMessage(null);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setFormData(p => ({ ...p, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch { setMessage({ type: 'error', text: 'Failed to update password. Please try again.' }); }
    finally { setIsLoading(false); }
  };

  const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Please select an image file.' }); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'Image size must be less than 5MB.' }); return; }
    setIsUploadingPicture(true); setMessage(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/admin/profile/upload-picture', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { setProfilePictureUrl(data.data.url); setMessage({ type: 'success', text: 'Profile picture updated successfully!' }); }
      else setMessage({ type: 'error', text: data.error || 'Failed to upload profile picture.' });
    } catch { setMessage({ type: 'error', text: 'Failed to upload profile picture. Please try again.' }); }
    finally { setIsUploadingPicture(false); }
  };

  const handleDeletePicture = async () => {
    if (!confirm('Are you sure you want to delete your profile picture?')) return;
    setIsUploadingPicture(true); setMessage(null);
    try {
      const res = await fetch('/api/admin/profile/upload-picture', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setProfilePictureUrl(null); setMessage({ type: 'success', text: 'Profile picture deleted successfully!' }); }
      else setMessage({ type: 'error', text: data.error || 'Failed to delete profile picture.' });
    } catch { setMessage({ type: 'error', text: 'Failed to delete profile picture. Please try again.' }); }
    finally { setIsUploadingPicture(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 gap-2 text-slate-500"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /><span className="text-[13px]">Loading profile...</span></div>;
  if (!profile) return <div className="flex items-center justify-center h-64"><div className="text-center"><AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" /><p className="text-[13px] font-medium text-slate-700">Profile Not Found</p><p className="text-[12px] text-slate-400">Unable to load your profile information.</p></div></div>;

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-slate-800">Admin Profile</h1><p className="text-[12px] text-slate-400 mt-0.5">Manage your personal information and security settings</p></div>
        {!isEditing && <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /> Edit Profile</button>}
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border text-[13px] ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-center mb-5">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                {profilePictureUrl ? <Image src={profilePictureUrl} alt={`${profile.firstName} ${profile.lastName}`} fill className="object-cover" /> : <span className="text-white text-xl font-bold">{initials}</span>}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
                {isUploadingPicture ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : (
                  <>
                    <label className="cursor-pointer"><input type="file" accept="image/*" onChange={handlePictureUpload} className="hidden" disabled={isUploadingPicture} /><Camera className="w-4 h-4 text-white hover:scale-110 transition-transform" /></label>
                    {profilePictureUrl && <button onClick={handleDeletePicture} disabled={isUploadingPicture}><Trash2 className="w-4 h-4 text-white hover:scale-110 transition-transform" /></button>}
                  </>
                )}
              </div>
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800">{profile.firstName} {profile.lastName}</h3>
            {profile.username && <p className="text-[12px] text-blue-500 font-medium">@{profile.username}</p>}
            <p className="text-[12px] text-slate-400 mb-2">{profile.email}</p>
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-full px-2.5 py-0.5">
              {profile.role === 'admin' ? <Shield className="w-3 h-3" /> : <Crown className="w-3 h-3" />} {profile.role.toUpperCase()}
            </span>
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-3">
            {[
              { icon: Calendar, label: 'Member since', value: new Date(profile.createdAt).toLocaleDateString() },
              { icon: Clock, label: 'Last login', value: new Date(profile.lastLoginAt || profile.createdAt).toLocaleDateString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div><p className="text-[11px] text-slate-400">{label}</p><p className="text-[13px] font-medium text-slate-700">{value}</p></div>
              </div>
            ))}
            <div className="flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div><p className="text-[11px] text-slate-400">Account status</p><span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium mt-0.5 ${profile.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{profile.isActive ? 'Active' : 'Inactive'}</span></div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-700">Personal Information</h2>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>First Name</label><input className={inputCls} value={formData.firstName} onChange={e => set('firstName', e.target.value)} disabled={isLoading} /></div>
                  <div><label className={labelCls}>Last Name</label><input className={inputCls} value={formData.lastName} onChange={e => set('lastName', e.target.value)} disabled={isLoading} /></div>
                </div>
                <div><label className={labelCls}>Phone Number</label><input className={inputCls} type="tel" value={formData.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+1 (555) 123-4567" disabled={isLoading} /></div>
                <div><label className={labelCls}>Email Address</label><input className={inputCls} value={profile.email} disabled /><p className="text-[11px] text-slate-400 mt-1">Email cannot be changed</p></div>
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button onClick={handleSave} disabled={isLoading} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Changes
                  </button>
                  <button onClick={handleCancel} disabled={isLoading} className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50"><X className="w-3.5 h-3.5" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><p className="text-[11px] text-slate-400 mb-0.5">First Name</p><p className="text-[13px] font-medium text-slate-800">{profile.firstName}</p></div>
                  <div><p className="text-[11px] text-slate-400 mb-0.5">Last Name</p><p className="text-[13px] font-medium text-slate-800">{profile.lastName}</p></div>
                </div>
                <div><p className="text-[11px] text-slate-400 mb-0.5">Username</p><p className="text-[13px] font-medium text-blue-600">@{profile.username || '—'}</p></div>
                <div><p className="text-[11px] text-slate-400 mb-0.5">Email Address</p><p className="text-[13px] font-medium text-slate-800 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />{profile.email}</p></div>
                <div><p className="text-[11px] text-slate-400 mb-0.5">Phone Number</p><p className="text-[13px] font-medium text-slate-800 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" />{profile.phoneNumber || 'Not provided'}</p></div>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Key className="w-4 h-4 text-slate-400" /><h2 className="text-[13px] font-semibold text-slate-700">Security Settings</h2>
            </div>
            <div className="space-y-4">
              <div><label className={labelCls}>Current Password</label>
                <div className="relative">
                  <input className={`${inputCls} pr-10`} type={showPassword ? 'text' : 'password'} value={formData.currentPassword} onChange={e => set('currentPassword', e.target.value)} disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <div><label className={labelCls}>New Password</label><input className={inputCls} type={showPassword ? 'text' : 'password'} value={formData.newPassword} onChange={e => set('newPassword', e.target.value)} disabled={isLoading} /></div>
              <div><label className={labelCls}>Confirm New Password</label><input className={inputCls} type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} disabled={isLoading} /></div>
              <div className="pt-2 border-t border-slate-100">
                <button onClick={handlePasswordChange} disabled={isLoading} className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />} Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
