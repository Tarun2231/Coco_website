import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  if (!petId) {
    return NextResponse.json({ error: 'petId required' }, { status: 400 });
  }

  const documents = await db.petDocument.findMany({
    where: { petId },
    orderBy: { uploadedAt: 'desc' },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const document = await db.petDocument.create({
      data: {
        petId: data.petId,
        title: data.title,
        category: data.category,
        fileUrl: data.fileUrl,
        fileType: data.fileType || 'pdf',
        fileSize: data.fileSize || '1.0 MB',
      },
    });

    return NextResponse.json({ document });
  } catch (err) {
    console.error('Document create error:', err);
    return NextResponse.json({ error: 'Failed to record document' }, { status: 500 });
  }
}
