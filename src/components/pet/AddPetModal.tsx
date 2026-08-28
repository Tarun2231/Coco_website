'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Dog, Tag, Camera, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { INDIAN_DOG_BREEDS } from '@/lib/breeds';

interface AddPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPetModal: React.FC<AddPetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    dob: '',
    color: '',
    weight: '',
    microchipId: '',
    registrationNo: '',
    licenseNo: '',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
    importantNotes: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, photo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Failed to add pet. Please check inputs.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while adding pet.');
    }
  };

  const isMale = formData.gender === 'Male';
  const themeBgClass = isMale
    ? 'bg-blue-50/80 border-blue-200/80 text-blue-950'
    : 'bg-rose-50/80 border-rose-200/80 text-rose-950';

  const themeBadgeClass = isMale
    ? 'bg-blue-600 text-white shadow-xs'
    : 'bg-rose-500 text-white shadow-xs';

  const steps = [
    { num: 1, label: 'Info', icon: Dog },
    { num: 2, label: 'ID Tags', icon: Tag },
    { num: 3, label: 'Photo', icon: Camera },
    { num: 4, label: 'Confirm', icon: FileText },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add New Pet - Step ${step} of 4`}>
      <div className="space-y-4">
        {/* Hidden File Inputs for Gallery & Camera */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Step Clickable Tabs with Dynamic Gender Theme Colors */}
        <div className={`grid grid-cols-4 gap-1 p-1 rounded-2xl border transition-colors ${themeBgClass}`}>
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? themeBadgeClass
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-2.5 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Pet Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Bruno"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Species</label>
                  <select
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Gender (Theme Color) *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-xl border font-extrabold text-xs focus:outline-none focus:ring-2 ${
                      isMale
                        ? 'bg-blue-100/90 text-blue-900 border-blue-300 focus:ring-blue-400'
                        : 'bg-rose-100/90 text-rose-900 border-rose-300 focus:ring-rose-400'
                    }`}
                  >
                    <option value="Male">Male (Light Blue Theme ♂)</option>
                    <option value="Female">Female (Light Pink Theme ♀)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Dog Breed (Indian & Popular Breeds) *</label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                >
                  {INDIAN_DOG_BREEDS.map((breedName) => (
                    <option key={breedName} value={breedName}>
                      {breedName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g. Golden / Brown / White"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 28 kg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (!formData.name || !formData.breed) {
                      alert('Please enter Pet Name and select Breed');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full text-xs font-bold py-2.5"
                >
                  Next: ID Tags &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Identification */}
          {step === 2 && (
            <div className="space-y-2.5 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Microchip ID</label>
                <input
                  type="text"
                  name="microchipId"
                  value={formData.microchipId}
                  onChange={handleChange}
                  placeholder="e.g. 988 000 123 456 789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Pet Registration Number</label>
                <input
                  type="text"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  placeholder="e.g. PET-HYD-2026-001"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Municipal License Number</label>
                <input
                  type="text"
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  placeholder="e.g. LIC-99210-A"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="text-xs py-2">
                  &larr; Back
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(3)} className="text-xs font-bold py-2">
                  Next: Photo &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Photo Selection & Camera Capture */}
          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">Pet Photo (Upload or Take Photo)</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-3 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>📷 Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>📁 Gallery Upload</span>
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Or Paste Photo URL</label>
                <input
                  type="url"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div className="flex flex-col items-center p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium mb-1">Selected Photo Preview:</span>
                <img
                  src={formData.photo}
                  alt="Preview"
                  className={`w-24 h-24 rounded-2xl object-cover border-4 shadow-sm ${
                    isMale ? 'border-blue-300' : 'border-rose-300'
                  }`}
                />
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} className="text-xs py-2">
                  &larr; Back
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(4)} className="text-xs font-bold py-2">
                  Next: Notes & Confirm &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Notes & Confirm */}
          {step === 4 && (
            <div className="space-y-2.5 animate-fadeIn">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-0.5">Important Public Notes</label>
                <textarea
                  name="importantNotes"
                  rows={2}
                  value={formData.importantNotes}
                  onChange={handleChange}
                  placeholder="e.g. Friendly boy, loves kids. Please call my family immediately."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>
              <div className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${themeBgClass}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  By clicking <strong>Create Pet & Generate QR</strong>, Puppy ID will generate a custom public QR code tag for <strong>{formData.name || 'your pet'}</strong> with {formData.gender === 'Male' ? 'Light Blue ♂' : 'Light Pink ♀'} theme accents.
                </span>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(3)} className="text-xs py-2">
                  &larr; Back
                </Button>
                <Button type="submit" variant="primary" className="text-xs font-bold py-2">
                  Create Pet & Generate QR
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
