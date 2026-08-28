import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { PrintableTagCard } from '@/components/pet/PrintableTagCard';
import { QrCode, Plus, Dog } from 'lucide-react';
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
};

export default async function QRCodeStudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';

  let pet: any = null;
  try {
    pet = await db.pet.findFirst({
      where: { userId: user.id },
      include: { qrCode: true },
    });
  } catch (err) {
    console.error('QR code fetch error:', err);
  }

  if (!pet && isDemoAccount) {
    pet = fallbackBrunoPet;
  }

  if (!pet) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 max-w-md mx-auto my-8 space-y-4 shadow-sm animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center mx-auto shadow-sm">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">No Pet QR Code Generated Yet</h2>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Please add a pet to your account first. Once added, Puppy ID will generate digital QR codes and printable collar tags for your pet.
        </p>
        <Link href="/dashboard" className="block pt-2">
          <Button variant="primary" className="font-bold shadow-md shadow-brand-coral/20 px-6" icon={<Plus className="w-4 h-4" />}>
            Go to Dashboard & Add Pet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">QR Code & Printable Tag Studio</h1>
        <p className="text-sm text-slate-500 font-medium">Download digital QR codes or generate print-ready collar ID tags for {pet.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <QRCodeCard petName={pet.name} publicId={pet.publicId} />
        <PrintableTagCard
          petName={pet.name}
          breed={pet.breed}
          phone={user.phone || '+91 98765 43210'}
          publicId={pet.publicId}
        />
      </div>
    </div>
  );
}
