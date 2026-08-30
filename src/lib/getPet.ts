import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function getActivePetForUser(userId: string, email?: string, includeRelations: any = {}) {
  try {
    const cookieStore = cookies();
    const activePetId = cookieStore.get('puppy_active_pet_id')?.value;

    const userCondition: any[] = [{ userId }];
    if (email) {
      userCondition.push({ user: { email: email.toLowerCase().trim() } });
    }

    if (activePetId) {
      const pet = await db.pet.findFirst({
        where: {
          id: activePetId,
          OR: userCondition,
        },
        include: includeRelations,
      });
      if (pet) return pet;
    }

    // Fallback to most recently updated pet for this user
    const latestPet = await db.pet.findFirst({
      where: {
        OR: userCondition,
      },
      include: includeRelations,
      orderBy: { updatedAt: 'desc' },
    });

    if (latestPet) return latestPet;
  } catch (err) {
    console.error('getActivePetForUser DB error:', err);
  }

  return null;
}
