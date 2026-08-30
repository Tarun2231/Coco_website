'use client';

import React, { useState, useEffect } from 'react';
import { PrivacyToggles } from '@/components/pet/PrivacyToggles';
import { Button } from '@/components/ui/Button';
import { User, Shield, KeyRound, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'security'>('account');

  // Account State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Privacy State
  const [petId, setPetId] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean>>({});

  // Status feedback states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch current user
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        if (userData.user) {
          setName(userData.user.name || '');
          setEmail(userData.user.email || '');
          setPhone(userData.user.phone || '');
          setAltPhone(userData.user.altPhone || '');
          setAddress(userData.user.address || '');
        }

        // Fetch pet privacy
        const petRes = await fetch('/api/pets');
        const petData = await petRes.json();
        if (petData.pets && petData.pets.length > 0) {
          const firstPet = petData.pets[0];
          setPetId(firstPet.id);
          setPrivacySettings(firstPet.privacySetting || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, altPhone, address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccessMsg('✓ Account profile details saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating account');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMsg('New password cannot be empty.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccessMsg('✓ Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!petId) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, settings: privacySettings }),
      });
      if (res.ok) {
        setSuccessMsg('✓ Public QR privacy preferences saved!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to update privacy preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account & Privacy Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Manage your personal profile, contact information, password, and pet QR privacy</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2">
        <button
          onClick={() => { setActiveTab('account'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'account'
              ? 'border-brand-coral text-brand-coral'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Owner Profile</span>
        </button>

        <button
          onClick={() => { setActiveTab('privacy'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'privacy'
              ? 'border-brand-coral text-brand-coral'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Pet Privacy Toggles</span>
        </button>

        <button
          onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-brand-coral text-brand-coral'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: Account Profile */}
      {activeTab === 'account' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-800">Owner Profile Information</h3>
          <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alternate Emergency Phone</label>
                <input
                  type="text"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                  placeholder="+91 91234 56789"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
                placeholder="12, Green Meadows Apartment, Road No. 5, Banjara Hills, Hyderabad, Telangana 500034"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="font-bold shadow-md shadow-brand-coral/20 px-6"
                icon={<Save className="w-4 h-4" />}
              >
                {saving ? 'Saving...' : 'Save Account Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Privacy Controls */}
      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleSavePrivacy}
              variant="primary"
              disabled={saving}
              className="font-bold shadow-md shadow-brand-coral/20"
              icon={<Save className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save Privacy Preferences'}
            </Button>
          </div>

          <PrivacyToggles
            settings={privacySettings}
            onChange={(key, val) => setPrivacySettings((prev) => ({ ...prev, [key]: val }))}
          />
        </div>
      )}

      {/* TAB 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm max-w-xl space-y-6">
          <h3 className="text-base font-extrabold text-slate-800">Change Account Password</h3>
          <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="font-bold shadow-md shadow-brand-coral/20 px-6"
                icon={<KeyRound className="w-4 h-4" />}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
