import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { QRCodeCard } from '@/components/dashboard/QRCodeCard';
import { PrintableTagCard } from '@/components/pet/PrintableTagCard';

export const revalidate = 0;

export default async function QRCodeStudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const pet = await db.pet.findFirst({
    where: { userId: user.id },
    include: { qrCode: true },
  });

  if (!pet) return <div>No pets found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">QR Code & Printable Tag Studio</h1>
        <p className="text-sm text-slate-500 font-medium">Download digital QR codes or generate print-ready collar ID tags</p>
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
