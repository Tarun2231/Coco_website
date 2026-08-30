import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MessagesClient } from './MessagesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let messages: any[] = [];
  try {
    messages = await db.finderMessage.findMany({
      where: { pet: { userId: user.id } },
      include: { pet: { select: { name: true, photo: true } } },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Messages DB query error:', err);
  }

  const isDemoAccount = user.email === 'owner@puppyid.com' || user.id === 'demo-owner-id';
  if (messages.length === 0 && isDemoAccount) {
    messages = [
      {
        id: 'msg-1',
        senderName: 'Vikram Sharma',
        senderPhone: '+91 98490 11223',
        message: 'Hi! I saw Bruno near Road No. 5 Banjara Hills park sitting near the tea stall. He has his tag on. I am waiting here with him!',
        finderLocation: 'Road No. 5, Banjara Hills near Tea Time',
        isRead: false,
        createdAt: new Date().toISOString(),
        pet: { name: 'Bruno' },
      },
      {
        id: 'msg-2',
        senderName: 'Priya Reddy',
        senderPhone: '+91 97000 44332',
        message: "Hello, scanned Bruno's QR tag near GVK One Mall exit. Giving him some water now.",
        finderLocation: 'GVK One Mall Entrance, Road No. 1',
        isRead: false,
        createdAt: new Date().toISOString(),
        pet: { name: 'Bruno' },
      },
    ];
  }

  return <MessagesClient initialMessages={(messages as any) || []} />;
}
