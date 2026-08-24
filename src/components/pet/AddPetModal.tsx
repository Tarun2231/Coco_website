'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add New Pet - Step ${step} of 4`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pet Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Bruno"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Species</label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Golden"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" onClick={() => setStep(2)}>
                Next: Identification &rarr;
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Microchip ID</label>
              <input
                type="text"
                name="microchipId"
                value={formData.microchipId}
                onChange={handleChange}
                placeholder="e.g. 988 000 123 456 789"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">License Number</label>
              <input
                type="text"
                name="licenseNo"
                value={formData.licenseNo}
                onChange={handleChange}
                placeholder="e.g. LIC-99210-A"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral"
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                &larr; Back
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Next: Photo & Photo &rarr;
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pet Photo URL</label>
              <input
                type="url"
                name="photo"
                value={formData.photo}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral text-sm"
              />
            </div>
            <div className="flex justify-center p-3 bg-slate-50 rounded-2xl">
              <img
                src={formData.photo}
                alt="Preview"
                className="w-32 h-32 rounded-2xl object-cover border-2 border-brand-coral/30"
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                &larr; Back
              </Button>
              <Button type="button" onClick={() => setStep(4)}>
                Next: Notes & Confirm &rarr;
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Important Public Notes</label>
              <textarea
                name="importantNotes"
                rows={3}
                value={formData.importantNotes}
                onChange={handleChange}
                placeholder="e.g. Friendly boy, loves kids. Please call my family immediately."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral text-sm"
              />
            </div>
            <p className="text-xs text-slate-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
              🐾 By adding your pet, Puppy ID will automatically generate a unique public QR code identity tag for your pet.
            </p>
            <div className="flex justify-between pt-4">
              <Button type="button" variant="secondary" onClick={() => setStep(3)}>
                &larr; Back
              </Button>
              <Button type="submit" variant="primary">
                Create Pet & Generate QR
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
