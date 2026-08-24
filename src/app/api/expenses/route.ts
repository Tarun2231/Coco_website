import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const expenses = await db.expense.findMany({
    where: { petId },
    orderBy: { date: 'desc' },
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return NextResponse.json({ expenses, totalSpent });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const expense = await db.expense.create({
      data: {
        petId: data.petId,
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        currency: data.currency || '₹',
        date: new Date(data.date),
        vendor: data.vendor,
        paymentMethod: data.paymentMethod || 'UPI',
        notes: data.notes,
        receiptUrl: data.receiptUrl,
      },
    });

    return NextResponse.json({ expense });
  } catch (err) {
    console.error('Expense create error:', err);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
