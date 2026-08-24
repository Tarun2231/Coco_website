import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const vaccinations = await db.vaccination.findMany({
    where: { petId },
    orderBy: { dateAdministered: 'desc' },
  });

  return NextResponse.json({ vaccinations });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const vaccination = await db.vaccination.create({
      data: {
        petId: data.petId,
        vaccineName: data.vaccineName,
        dateAdministered: new Date(data.dateAdministered),
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
        vetName: data.vetName,
        clinic: data.clinic,
        batchNo: data.batchNo,
        notes: data.notes,
        certificateUrl: data.certificateUrl,
        status: data.status || 'COMPLETED',
      },
    });

    return NextResponse.json({ vaccination });
  } catch (err) {
    console.error('Vaccination create error:', err);
    return NextResponse.json({ error: 'Failed to create vaccination record' }, { status: 500 });
  }
}
