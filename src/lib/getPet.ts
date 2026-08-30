import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function getActivePetForUser(userId: string, includeRelations: any = {}) {
  try {
    const cookieStore = cookies();
    const activePetId = cookieStore.get('puppy_active_pet_id')?.value;

    if (activePetId) {
      const pet = await db.pet.findFirst({
        where: { id: activePetId, userId },
        include: includeRelations,
      });
      if (pet) return pet;
    }

    // Fallback to most recently updated pet for this user
    const latestPet = await db.pet.findFirst({
      where: { userId },
      include: includeRelations,
      orderBy: { updatedAt: 'desc' },
    });

    if (latestPet) return latestPet;
  } catch (err) {
    console.error('getActivePetForUser DB error:', err);
  }

  return null;
}
