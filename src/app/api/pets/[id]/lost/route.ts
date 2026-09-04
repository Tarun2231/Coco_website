import { NextResponse } from 'next/server';
import { toggleLostModeInStore, updatePetInStore } from '@/lib/store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json().catch(() => ({}));
    const petId = params.id;
    const pet = updatePetInStore(petId, data) || toggleLostModeInStore(petId, !!data.isLost);
    return NextResponse.json({ success: true, pet });
  } catch (err) {
    console.error('Lost mode toggle error:', err);
    return NextResponse.json({ error: 'Failed to update lost mode' }, { status: 500 });
  }
}
