import { NextResponse } from 'next/server';
import { deletePetFromStore, updatePetInStore } from '@/lib/store';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const petId = params.id;
    const success = await deletePetFromStore(petId);
    return NextResponse.json({ success });
  } catch (err) {
    console.error('Delete pet error:', err);
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updated = await updatePetInStore(params.id, data);
    return NextResponse.json({ success: true, pet: updated });
  } catch (err) {
    console.error('Update pet error:', err);
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  }
}
