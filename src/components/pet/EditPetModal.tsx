'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pet } from '@/types';
import { Save, Upload, AlertCircle } from 'lucide-react';

interface EditPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  onSuccess: () => void;
}

export const EditPetModal: React.FC<EditPetModalProps> = ({
  isOpen,
  onClose,
  pet,
  onSuccess,
}) => {
  const [name, setName] = useState(pet.name || '');
  const [species, setSpecies] = useState(pet.species || 'Dog');
  const [breed, setBreed] = useState(pet.breed || '');
  const [gender, setGender] = useState(pet.gender || 'Male');
  const [dob, setDob] = useState(pet.dob ? new Date(pet.dob).toISOString().split('T')[0] : '');
  const [color, setColor] = useState(pet.color || '');
  const [weight, setWeight] = useState(pet.weight || '');
  const [microchipId, setMicrochipId] = useState(pet.microchipId || '');
  const [registrationNo, setRegistrationNo] = useState(pet.registrationNo || '');
  const [licenseNo, setLicenseNo] = useState(pet.licenseNo || '');
  const [photo, setPhoto] = useState(pet.photo || '');
  const [importantNotes, setImportantNotes] = useState(pet.importantNotes || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pet) {
      setName(pet.name || '');
      setSpecies(pet.species || 'Dog');
      setBreed(pet.breed || '');
      setGender(pet.gender || 'Male');
      setDob(pet.dob ? new Date(pet.dob).toISOString().split('T')[0] : '');
      setColor(pet.color || '');
      setWeight(pet.weight || '');
      setMicrochipId(pet.microchipId || '');
      setRegistrationNo(pet.registrationNo || '');
      setLicenseNo(pet.licenseNo || '');
      setPhoto(pet.photo || '');
      setImportantNotes(pet.importantNotes || '');
    }
  }, [pet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !breed) {
      setError('Pet Name and Breed are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/pets/${pet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          species,
          breed,
          gender,
          dob: dob ? new Date(dob) : null,
          color,
          weight,
          microchipId,
          registrationNo,
          licenseNo,
          photo,
          importantNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update pet details');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Profile — ${pet.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pet Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. Bruno"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Breed *</label>
            <input
              type="text"
              required
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. Golden Retriever"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Species</label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Weight</label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. 28 kg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. Golden / White"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Microchip ID</label>
            <input
              type="text"
              value={microchipId}
              onChange={(e) => setMicrochipId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium font-mono"
              placeholder="e.g. 988 000 123 456 789"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Registration No.</label>
            <input
              type="text"
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. PET-HYD-2025-0891"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">License No.</label>
            <input
              type="text"
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
              placeholder="e.g. LIC-99210-A"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Photo Image URL</label>
          <input
            type="url"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Important / Care Notes</label>
          <textarea
            rows={3}
            value={importantNotes}
            onChange={(e) => setImportantNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-coral font-medium"
            placeholder="Dietary preferences, medical conditions, friendly behavior..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="font-bold shadow-md shadow-brand-coral/20"
            icon={<Save className="w-4 h-4" />}
          >
            {loading ? 'Saving Changes...' : 'Save Pet Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
