import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');

  const messages = await db.finderMessage.findMany({
    where: petId ? { petId } : { pet: { userId: user.id } },
    include: {
      pet: {
        select: { name: true, photo: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  try {
    const { petId, senderName, senderPhone, message, finderLocation, finderPhotoUrl } = await req.json();

    if (!petId || !message) {
      return NextResponse.json({ error: 'petId and message are required' }, { status: 400 });
    }

    const newMessage = await db.finderMessage.create({
      data: {
        petId,
        senderName: senderName || 'Good Samaritan Finder',
        senderPhone,
        message,
        finderLocation,
        finderPhotoUrl,
      },
    });

    // Create Notification for Pet Owner
    const pet = await db.pet.findUnique({
      where: { id: petId },
      select: { userId: true, name: true },
    });

    if (pet) {
      await db.notification.create({
        data: {
          userId: pet.userId,
          petId,
          title: `New Finder Message for ${pet.name}!`,
          message: `${senderName || 'Someone'} scanned ${pet.name}'s QR tag and sent a message: "${message.substring(0, 50)}..."`,
          type: 'MESSAGE',
        },
      });
    }

    return NextResponse.json({ message: newMessage });
  } catch (err) {
    console.error('Finder message POST error:', err);
    return NextResponse.json({ error: 'Failed to send finder message' }, { status: 500 });
  }
}
