'use client';

import React, { useState, useEffect } from 'react';
import { PrivacyToggles } from '@/components/pet/PrivacyToggles';
import { Button } from '@/components/ui/Button';
import { KeyRound, User, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [petId, setPetId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [savedPrivacy, setSavedPrivacy] = useState(false);

  // Account Credentials State
  const [email, setEmail] = useState('tarun.tarun460@gmail.com');
  const [name, setName] = useState('Tarun Milar');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credSaved, setCredSaved] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const savedCreds = localStorage.getItem('puppy_id_credentials');
        if (savedCreds) {
          try {
            const parsed = JSON.parse(savedCreds);
            if (parsed.email) setEmail(parsed.email);
            if (parsed.name) setName(parsed.name);
          } catch (e) {
            console.error(e);
          }
        }

        const res = await fetch('/api/pets');
        const data = await res.json();
        if (data.pets && data.pets.length > 0) {
          const firstPet = data.pets[0];
          setPetId(firstPet.id);
          setSettings(firstPet.privacySetting || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleToggleChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePrivacy = async () => {
    if (!petId) return;
    try {
      const res = await fetch('/api/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, settings }),
      });
      if (res.ok) {
        setSavedPrivacy(true);
        setTimeout(() => setSavedPrivacy(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setCredError('New password and confirm password do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setCredError('New password must be at least 6 characters long');
      return;
    }

    const updatedCreds = {
      email,
      name,
      password: newPassword || 'updated123',
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('puppy_id_credentials', JSON.stringify(updatedCreds));
    setCredSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setCredSaved(false), 4000);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl animate-fadeIn text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard & Security Settings</h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your owner login credentials, password, and public QR tag privacy controls
          </p>
        </div>

        <Button onClick={handleSavePrivacy} variant="primary" className="font-bold">
          {savedPrivacy ? 'Saved!' : 'Save Privacy Controls'}
        </Button>
      </div>

      {/* ==================== 1. ACCOUNT LOGIN CREDENTIALS & PASSWORD ==================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Owner Login Username & Password Settings</h2>
            <p className="text-xs text-slate-500 font-medium">Update your login email, username, and password for accessing the dashboard</p>
          </div>
        </div>

        {credSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>✓ Owner login credentials and password updated successfully! You can now log in with your updated username and password.</span>
          </div>
        )}

        {credError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl animate-fadeIn">
            ⚠️ {credError}
          </div>
        )}

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Login Username / Email *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tarun.tarun460@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
            >
              🔑 Update Username & Password
            </button>
          </div>
        </form>
      </div>

      {/* ==================== 2. PUBLIC QR TAG PRIVACY TOGGLES ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Public QR Tag Privacy Controls</span>
        </div>
        {savedPrivacy && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
            ✓ Privacy preferences updated successfully! Public QR page will reflect changes immediately.
          </div>
        )}

        <PrivacyToggles settings={settings} onChange={handleToggleChange} />
      </div>
    </div>
  );
}
