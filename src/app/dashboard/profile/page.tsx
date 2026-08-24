import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Dog, Shield, Edit3, Calendar, Weight, Tag, AlertCircle } from 'lucide-react';
import { formatDate, calculateAge } from '@/lib/utils';
import Link from 'next/link';

export const revalidate = 0;

export default async function PetProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { privacySetting: true, qrCode: true },
  });

  if (!pet) return <div>No pets found. Please add a pet first.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Puppy Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage {pet.name}&apos;s digital identity and public attributes</p>
        </div>
        <Link href="/dashboard/settings">
          <button className="px-4 py-2 bg-brand-coral text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-600">
            Edit Privacy Toggles
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={pet.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop'}
            alt={pet.name}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-brand-coral/20 shadow-md"
          />
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-black text-slate-900">{pet.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${pet.isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {pet.isLost ? '🚨 LOST MODE' : '❤️ SAFE AT HOME'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600">
              {pet.breed} • {pet.gender} • {calculateAge(pet.dob)}
            </p>
            <p className="text-xs text-slate-400 font-mono">Public ID: /pet/{pet.publicId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Information</h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
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
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Identification Codes</h3>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
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
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Important Notes</h3>
          <p className="text-xs text-slate-600 bg-amber-50 p-4 rounded-2xl border border-amber-200/60 leading-relaxed font-medium">
            &quot;{pet.importantNotes || 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.'}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
