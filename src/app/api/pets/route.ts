import { NextResponse } from 'next/server';
import { syncFromCloudStore, addPetToStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pets = await syncFromCloudStore();
  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => ({}));
    if (!data.name) {
      return NextResponse.json({ error: 'Pet Name is required' }, { status: 400 });
    }

    const newPet = addPetToStore(data);
    return NextResponse.json({ success: true, pet: newPet });
  } catch (err) {
    console.error('Add pet error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
