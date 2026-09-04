import { NextResponse } from 'next/server';
import { getPetById, addVaccinationToStore, updateVaccinationInStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const pet = getPetById(petId);
  return NextResponse.json({ vaccinations: pet?.vaccinations || [] });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.petId || !data.vaccineName) {
      return NextResponse.json({ error: 'petId and vaccineName required' }, { status: 400 });
    }

    const vaccination = await addVaccinationToStore(data.petId, data);
    return NextResponse.json({ success: true, vaccination });
  } catch (err) {
    console.error('Vaccination create error:', err);
    return NextResponse.json({ error: 'Failed to create vaccination record' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    if (!data.petId || !data.id) {
      return NextResponse.json({ error: 'petId and id required' }, { status: 400 });
    }

    const updated = await updateVaccinationInStore(data.petId, data.id, data);
    return NextResponse.json({ success: true, vaccination: updated });
  } catch (err) {
    console.error('Vaccination update error:', err);
    return NextResponse.json({ error: 'Failed to update vaccination record' }, { status: 500 });
  }
}
