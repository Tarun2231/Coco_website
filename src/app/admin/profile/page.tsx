import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Dog, Shield, Calendar, Weight, Tag, AlertTriangle, ExternalLink } from 'lucide-react';
import { calculateAge } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const fallbackPet = {
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

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/login');

  let pet: any = null;
  try {
    pet = await db.pet.findFirst({
      include: { privacySetting: true, qrCode: true },
    });
  } catch (err) {
    console.error('Admin profile query error:', err);
  }

  if (!pet) {
    pet = fallbackPet;
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Dog className="w-6 h-6 text-amber-500" />
            <span>Admin Puppy Profile Inspector</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Inspect digital identity attributes and public QR page parameters for {pet.name}
          </p>
        </div>
        <Link href={`/pet/${pet.publicId}`} target="_blank">
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5">
            <span>Inspect Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      <div className="bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <img
            src={pet.photo || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600'}
            alt={pet.name}
            className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-500/30 shadow-md"
          />
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-black text-white">{pet.name}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  pet.isLost ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {pet.isLost ? '🚨 LOST MODE ACTIVE' : '❤️ SAFE AT HOME'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {pet.breed} • {pet.gender} • {calculateAge(pet.dob)}
            </p>
            <p className="text-xs text-amber-500 font-mono">Public ID: /pet/{pet.publicId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Information</h3>
            <div className="bg-slate-900/80 p-4 rounded-2xl space-y-2 text-xs text-slate-300 border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-medium">Species</span>
                <span className="font-bold text-white">{pet.species}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-medium">Breed</span>
                <span className="font-bold text-white">{pet.breed}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-medium">Gender</span>
                <span className="font-bold text-white">{pet.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-medium">Color</span>
                <span className="font-bold text-white">{pet.color || 'Golden'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Weight</span>
                <span className="font-bold text-white">{pet.weight || '28 kg'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identification Codes</h3>
            <div className="bg-slate-900/80 p-4 rounded-2xl space-y-2 text-xs text-slate-300 border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-medium">Microchip ID</span>
                <span className="font-mono font-bold text-white">{pet.microchipId || '988 000 123 456 789'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500 font-medium">Registration No.</span>
                <span className="font-mono font-bold text-white">{pet.registrationNo || 'PET-HYD-2025-0891'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">License No.</span>
                <span className="font-mono font-bold text-white">{pet.licenseNo || 'LIC-99210-A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Important Notes</h3>
          <p className="text-xs text-slate-200 bg-slate-900 p-4 rounded-2xl border border-slate-800 leading-relaxed font-medium">
            &quot;{pet.importantNotes || 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.'}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
