import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Dog, Shield, Edit3, Calendar, Weight, Tag, AlertCircle, Plus } from 'lucide-react';
import { formatDate, calculateAge } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackBrunoPet = {
  id: 'bruno-demo-id',
  publicId: 'bruno',
  name: 'Bruno',
  species: 'Dog',
  breed: 'Golden Retriever',
  gender: 'Male',
  dob: '2025-05-15',
  color: 'Golden',
  weight: '28 kg',
  microchipId: '988 000 123 456 789',
  registrationNo: 'PET-HYD-2025-0891',
  licenseNo: 'LIC-99210-A',
  photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
  isLost: true,
  importantNotes: 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.',
};

export default async function PetProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = null;
  try {
    pet = await db.pet.findFirst({
      where: { userId: user.id },
      include: { privacySetting: true, qrCode: true },
    });
  } catch (err) {
    console.error('Pet profile fetch error:', err);
  }

  if (!pet && isDemoAccount) {
    pet = fallbackBrunoPet;
  }

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
          <p className="text-sm text-slate-500 font-medium">Manage {pet.name}&apos;s digital identity and public attributes</p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm" className="text-xs font-bold" icon={<Edit3 className="w-4 h-4" />}>
            Edit Privacy Toggles
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
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
                <span className="font-bold text-slate-800">{pet.weight || '28 kg'}</span>
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

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Important Notes</h3>
          <p className="text-xs text-slate-700 bg-amber-50/80 p-4 rounded-2xl border border-amber-200/60 leading-relaxed font-medium">
            &quot;{pet.importantNotes || `${pet.name} is a friendly boy. He loves people and kids. Please call my family immediately.`}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
