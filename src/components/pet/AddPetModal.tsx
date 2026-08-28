'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Dog, Tag, Camera, FileText } from 'lucide-react';

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
    breed: '',
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

  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const steps = [
    { num: 1, label: 'Info', icon: Dog },
    { num: 2, label: 'ID Tags', icon: Tag },
    { num: 3, label: 'Photo', icon: Camera },
    { num: 4, label: 'Confirm', icon: FileText },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add New Pet - Step ${step} of 4`}>
      <div className="space-y-4">
        {/* Step Clickable Tabs for Mobile */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-brand-coral text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pet Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Bruno"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Species</label>
                  <select
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Breed *</label>
                <input
                  type="text"
                  name="breed"
                  required
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g. Golden Retriever"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="e.g. Golden"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 28 kg"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (!formData.name || !formData.breed) {
                      alert('Please enter Pet Name and Breed');
                      return;
                    }
                    setStep(2);
                  }}
                  className="w-full sm:w-auto font-bold"
                >
                  Next: ID Tags &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Identification */}
          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Microchip ID</label>
                <input
                  type="text"
                  name="microchipId"
                  value={formData.microchipId}
                  onChange={handleChange}
                  placeholder="e.g. 988 000 123 456 789"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pet Registration Number</label>
                <input
                  type="text"
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  placeholder="e.g. PET-HYD-2026-001"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Municipal License Number</label>
                <input
                  type="text"
                  name="licenseNo"
                  value={formData.licenseNo}
                  onChange={handleChange}
                  placeholder="e.g. LIC-99210-A"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>

              <div className="flex justify-between gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1 sm:flex-initial">
                  &larr; Back
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(3)} className="flex-1 sm:flex-initial font-bold">
                  Next: Photo &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Photo Selection */}
          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pet Photo URL</label>
                <input
                  type="url"
                  name="photo"
                  value={formData.photo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-medium mb-2">Photo Preview:</span>
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-coral/40 shadow-sm"
                />
              </div>

              <div className="flex justify-between gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1 sm:flex-initial">
                  &larr; Back
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(4)} className="flex-1 sm:flex-initial font-bold">
                  Next: Notes & Confirm &rarr;
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Notes & Confirm */}
          {step === 4 && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Important Public Notes</label>
                <textarea
                  name="importantNotes"
                  rows={3}
                  value={formData.importantNotes}
                  onChange={handleChange}
                  placeholder="e.g. Friendly boy, loves kids. Please call my family immediately."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  By clicking <strong>Create Pet & Generate QR</strong>, Puppy ID will generate a custom public QR code tag for <strong>{formData.name || 'your pet'}</strong>.
                </span>
              </div>

              <div className="flex justify-between gap-3 pt-3">
                <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1 sm:flex-initial">
                  &larr; Back
                </Button>
                <Button type="submit" variant="primary" className="flex-1 sm:flex-initial font-bold">
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
