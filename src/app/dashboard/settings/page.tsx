'use client';

import React, { useState, useEffect } from 'react';
import { PrivacyToggles } from '@/components/pet/PrivacyToggles';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [petId, setPetId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadPrivacy() {
      try {
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
    loadPrivacy();
  }, []);

  const handleToggleChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!petId) return;
    try {
      const res = await fetch('/api/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, settings }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Privacy & Profile Controls</h1>
          <p className="text-sm text-slate-500 font-medium">Control what information finders can view when scanning your pet&apos;s QR tag</p>
        </div>

        <Button onClick={handleSave} variant="primary" className="font-bold">
          {saved ? 'Saved!' : 'Save Privacy Preferences'}
        </Button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
          ✓ Privacy preferences updated successfully! Public QR page will reflect changes immediately.
        </div>
      )}

      <PrivacyToggles settings={settings} onChange={handleToggleChange} />
    </div>
  );
}
