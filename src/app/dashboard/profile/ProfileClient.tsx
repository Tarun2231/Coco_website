'use client';

import React, { useState } from 'react';
import { Dog, Edit3, Plus, User, Phone, Mail, MapPin } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EditPetModal } from '@/components/pet/EditPetModal';
import { Pet } from '@/types';

interface ProfileClientProps {
  initialPet: Pet | null;
  ownerInfo: {
    name: string;
    email: string;
    phone?: string | null;
    altPhone?: string | null;
    address?: string | null;
  };
}

export const ProfileClient: React.FC<ProfileClientProps> = ({ initialPet, ownerInfo }) => {
  const [pet, setPet] = useState<Pet | null>(initialPet);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchLatestPet = async () => {
    if (!pet) return;
    try {
      const res = await fetch(`/api/pets/${pet.id}`);
      const data = await res.json();
      if (data.pet) {
        setPet(data.pet);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!pet) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 max-w-md mx-auto my-8 space-y-4 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center mx-auto shadow-sm">
          <Dog className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No Puppy Profile Created Yet</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          You haven&apos;t added any pets to your account yet. Visit your dashboard to add your dog and generate a custom digital QR collar ID tag.
        </p>
        <Link href="/dashboard" className="block pt-2">
          <Button variant="primary" className="font-bold shadow-md shadow-brand-coral/20 px-6" icon={<Plus className="w-4 h-4" />}>
            Go to Dashboard & Add Pet
          </Button>
        </Link>
      </div>
    );
  }

  const ageText = calculateAge(pet.dob);
  const isMale = pet.gender === 'Male';

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Puppy Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage {pet.name}&apos;s digital identity, physical traits & owner contact info</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs font-bold shadow-md shadow-brand-coral/20"
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Pet Info
          </Button>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="text-xs font-bold">
              Privacy Toggles
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        {/* Header Photo + Name Row */}
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={pet.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop'}
            alt={pet.name}
            className={`w-32 h-32 rounded-3xl object-cover border-4 shadow-md ${
              isMale ? 'border-blue-300' : 'border-rose-300'
            }`}
          />
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-black text-slate-900">{pet.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${pet.isLost ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                {pet.isLost ? '🚨 LOST MODE ACTIVE' : '❤️ SAFE AT HOME'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {pet.breed} • {pet.gender === 'Male' ? '♂ Male' : '♀ Female'} • {ageText}
            </p>
            <p className="text-xs text-brand-coral font-mono font-bold">Public ID: /pet/{pet.publicId}</p>
          </div>
        </div>

        {/* Basic Info & ID Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Species</span>
                <span className="font-bold text-slate-800">{pet.species}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Breed</span>
                <span className="font-bold text-slate-800">{pet.breed}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Gender</span>
                <span className="font-bold text-slate-800">{pet.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Color</span>
                <span className="font-bold text-slate-800">{pet.color || 'Golden'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Weight</span>
                <span className="font-bold text-slate-800">{pet.weight || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identification Codes</h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Microchip ID</span>
                <span className="font-mono font-bold text-slate-900">{pet.microchipId || '988 000 123 456 789'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-slate-500 font-medium">Registration No.</span>
                <span className="font-mono font-bold text-slate-900">{pet.registrationNo || 'PET-HYD-2025-0891'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">License No.</span>
                <span className="font-mono font-bold text-slate-900">{pet.licenseNo || 'LIC-99210-A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information Box */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Owner & Emergency Contact</h3>
          <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border border-slate-100">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-brand-coral shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Owner Name</span>
                <span className="font-bold text-slate-800">{ownerInfo.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Address</span>
                <span className="font-bold text-slate-800">{ownerInfo.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Primary Phone</span>
                <span className="font-bold text-slate-800">{ownerInfo.phone || '+91 98765 43210'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Residential Address</span>
                <span className="font-bold text-slate-800">{ownerInfo.address || 'Hyderabad, India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Important / Care Notes</h3>
          <p className="text-xs text-slate-700 bg-amber-50/80 p-4 rounded-2xl border border-amber-200/60 leading-relaxed font-medium">
            &quot;{pet.importantNotes || `${pet.name} is a friendly boy. He loves people and kids. Please call my family immediately.`}&quot;
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <EditPetModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        pet={pet}
        onSuccess={fetchLatestPet}
      />
    </div>
  );
};
