import { NextResponse } from 'next/server';
import { syncFromCloudStore, addPetToStore, deletePetFromStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { pets, activities } = await syncFromCloudStore();
  return NextResponse.json({ pets, activities });
}

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => ({}));
    if (!data.name) {
      return NextResponse.json({ error: 'Pet Name is required' }, { status: 400 });
    }

    const newPet = await addPetToStore(data);
    return NextResponse.json({ success: true, pet: newPet });
  } catch (err) {
    console.error('Add pet error:', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const petId = searchParams.get('petId');
    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400 });
    }
    const success = await deletePetFromStore(petId);
    return NextResponse.json({ success });
  } catch (err) {
    console.error('Delete pet route error:', err);
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
  }
}
