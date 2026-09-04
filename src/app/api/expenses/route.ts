import { NextResponse } from 'next/server';
import { getPetById, addExpenseToStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const pet = getPetById(petId);
  return NextResponse.json({ expenses: pet?.expenses || [] });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.petId || !data.amount) {
      return NextResponse.json({ error: 'petId and amount required' }, { status: 400 });
    }

    const expense = await addExpenseToStore(data.petId, data);
    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error('Expense create error:', err);
    return NextResponse.json({ error: 'Failed to create expense record' }, { status: 500 });
  }
}
