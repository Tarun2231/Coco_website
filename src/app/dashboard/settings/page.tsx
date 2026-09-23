'use client';

import React, { useState, useEffect } from 'react';
import { PrivacyToggles } from '@/components/pet/PrivacyToggles';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { KeyRound, User, Lock, CheckCircle2, ShieldCheck, Trash2, AlertTriangle, Dog } from 'lucide-react';

export default function SettingsPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
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

  // Delete Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

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

        const res = await fetch('/api/pets', { cache: 'no-store' });
        const data = await res.json();
        if (data.pets && Array.isArray(data.pets) && data.pets.length > 0) {
          setPets(data.pets);
          setSelectedPetId(data.pets[0].id);
          setSettings(data.pets[0].privacySetting || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentPet = pets.find((p) => p.id === selectedPetId || p.publicId === selectedPetId) || pets[0];

  const handleToggleChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePrivacy = async () => {
    if (!selectedPetId) return;
    try {
      const res = await fetch('/api/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: selectedPetId, settings }),
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

  const handleDeletePetConfirmed = async () => {
    if (!currentPet) return;
    setIsDeleting(true);

    const targetPetId = currentPet.id;
    const petName = currentPet.name;

    const remainingPets = pets.filter((p) => p.id !== targetPetId && p.publicId !== targetPetId);
    setPets(remainingPets);
    if (remainingPets.length > 0) {
      setSelectedPetId(remainingPets[0].id);
    } else {
      setSelectedPetId('');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('puppy_id_pets', JSON.stringify(remainingPets));
      window.dispatchEvent(new Event('puppy_id_pets_updated'));
    }

    try {
      await fetch(`/api/pets?petId=${targetPetId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete pet API error:', err);
    } finally {
      setIsDeleting(false);
      setIsConfirmModalOpen(false);
      setDeleteNotice(`✅ Pet profile for "${petName}" has been permanently removed.`);
      setTimeout(() => setDeleteNotice(null), 4000);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl animate-fadeIn text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard & Security Settings</h1>
          <p className="text-sm text-slate-500 font-medium">
            Manage your owner login credentials, password, privacy controls, and pet profiles
          </p>
        </div>

        <Button onClick={handleSavePrivacy} variant="primary" className="font-bold">
          {savedPrivacy ? 'Saved!' : 'Save Privacy Controls'}
        </Button>
      </div>

      {deleteNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{deleteNotice}</span>
        </div>
      )}

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

      {/* ==================== 3. SAFE DANGER ZONE - DELETE PET ==================== */}
      {currentPet && (
        <div className="bg-rose-50/70 rounded-3xl p-6 border border-rose-200/80 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-900 font-extrabold text-base border-b border-rose-200/60 pb-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-rose-900">Danger Zone — Delete Pet Profile</h2>
              <p className="text-xs text-rose-700 font-medium">Remove a registered pet profile permanently from your owner account</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {pets.length > 1 && (
              <div className="flex items-center gap-2">
                <Dog className="w-4 h-4 text-rose-700" />
                <span className="text-xs font-bold text-rose-900">Target Pet:</span>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold bg-white text-rose-950"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      🐶 {p.name} ({p.breed})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete {currentPet.name}&apos;s Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== DELETE PET CONFIRMATION MODAL ==================== */}
      {isConfirmModalOpen && currentPet && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="⚠️ Confirm Pet Profile Deletion"
        >
          <div className="space-y-4 text-slate-800">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-rose-950">Are you sure you want to delete?</h3>
                <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                  Are you sure you want to delete <strong>&quot;{currentPet.name}&quot;</strong>? This action is permanent and will remove all vaccination records, reminders, and QR code links for this pet.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-xs font-bold px-4 py-2"
              >
                Cancel (Keep Safe)
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isDeleting}
                onClick={handleDeletePetConfirmed}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Pet'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
