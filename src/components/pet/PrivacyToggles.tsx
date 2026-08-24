'use client';

import React from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface PrivacyTogglesProps {
  settings: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
}

export const PrivacyToggles: React.FC<PrivacyTogglesProps> = ({ settings, onChange }) => {
  const fields = [
    { key: 'showName', label: 'Pet Name' },
    { key: 'showPhoto', label: 'Pet Photo' },
    { key: 'showBreed', label: 'Breed & Species' },
    { key: 'showGender', label: 'Gender & Age' },
    { key: 'showColor', label: 'Color & Weight' },
    { key: 'showMicrochip', label: 'Microchip ID' },
    { key: 'showPhone', label: 'Primary Phone Number' },
    { key: 'showAltPhone', label: 'Alternate Phone Number' },
    { key: 'showEmail', label: 'Owner Email' },
    { key: 'showAddress', label: 'Home Address & Google Maps' },
    { key: 'showVaccinations', label: 'Vaccination History' },
    { key: 'showNotes', label: 'Important Public Notes' },
    { key: 'showLastSeen', label: 'Last Seen Location (When Lost)' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-brand-coral" />
        <h3 className="text-base font-extrabold text-slate-800">Public Profile Privacy Controls</h3>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Select which information is visible to someone scanning your pet&apos;s QR code.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ key, label }) => {
          const isEnabled = settings[key] ?? true;
          return (
            <div
              key={key}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {isEnabled ? (
                  <Eye className="w-4 h-4 text-emerald-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => onChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-coral"></div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
