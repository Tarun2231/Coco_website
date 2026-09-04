// Vercel Serverless & Cloud Persistent Data Store for Puppy ID
// Uses cloud storage (api.restful-api.dev) for 100% cross-device persistence between mobile & laptop.

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: string;
  nextDueDate?: string;
  vetName?: string;
  clinic?: string;
  batchNo?: string;
  notes?: string;
  status: 'COMPLETED' | 'UPCOMING' | 'OVERDUE';
}

export interface ExpenseRecord {
  id: string;
  petId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  vendor?: string;
}

export interface ReminderRecord {
  id: string;
  petId: string;
  category: string;
  title: string;
  date: string;
  time?: string;
  repeat?: string;
  notes?: string;
  isCompleted: boolean;
}

export interface PetRecord {
  id: string;
  publicId: string;
  name: string;
  species: string;
  breed: string;
  gender: 'Male' | 'Female';
  dob?: string;
  color?: string;
  weight?: string;
  microchipId?: string;
  registrationNo?: string;
  licenseNo?: string;
  photo?: string;
  isLost: boolean;
  lostNotes?: string;
  lastSeenDate?: string;
  lastSeenTime?: string;
  lastSeenLocation?: string;
  lastSeenLat?: number;
  lastSeenLng?: number;
  rewardAmount?: string;
  importantNotes?: string;
  user?: {
    name: string;
    phone: string;
    altPhone?: string;
    email: string;
    address?: string;
  };
  privacySetting?: Record<string, boolean>;
  vaccinations: VaccinationRecord[];
  expenses: ExpenseRecord[];
  reminders: ReminderRecord[];
  qrCode?: {
    qrCodeUrl: string;
    scanCount: number;
  };
}

const CLOUD_OBJECT_ID = 'ff808181a067127101a06d588f79124f';
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

const globalForStore = globalThis as unknown as {
  petsStore: PetRecord[] | undefined;
};

if (!globalForStore.petsStore) {
  globalForStore.petsStore = [];
}

export const petsStore = globalForStore.petsStore;

// Sync from Cloud Store
export async function syncFromCloudStore(): Promise<PetRecord[]> {
  try {
    const res = await fetch(CLOUD_API_URL, { cache: 'no-store' });
    if (res.ok) {
      const body = await res.json();
      if (body?.data?.pets && Array.isArray(body.data.pets)) {
        globalForStore.petsStore = body.data.pets;
        return body.data.pets;
      }
    }
  } catch (err) {
    console.error('Cloud store sync GET error:', err);
  }
  return globalForStore.petsStore || [];
}

// Push to Cloud Store
export async function saveToCloudStore(pets: PetRecord[]): Promise<void> {
  try {
    globalForStore.petsStore = pets;
    await fetch(CLOUD_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Puppy ID Store',
        data: { pets },
      }),
    });
  } catch (err) {
    console.error('Cloud store sync PUT error:', err);
  }
}

export function getAllPets(): PetRecord[] {
  return globalForStore.petsStore || [];
}

export function getPetById(idOrPublicId: string): PetRecord | undefined {
  const all = getAllPets();
  return all.find((p) => p.id === idOrPublicId || p.publicId === idOrPublicId);
}

export async function addPetToStore(data: Partial<PetRecord>): Promise<PetRecord> {
  // Sync first to get latest cloud pets
  const currentPets = await syncFromCloudStore();

  const cleanName = String(data.name || 'Puppy').trim();
  const slugBase = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const publicId = data.publicId || `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;
  const petId = data.id || `pet-${Date.now()}`;

  const newPet: PetRecord = {
    id: petId,
    publicId,
    name: cleanName,
    species: data.species || 'Dog',
    breed: data.breed || 'Golden Retriever',
    gender: (data.gender as 'Male' | 'Female') || 'Male',
    dob: data.dob || '2025-05-15',
    color: data.color || 'Golden',
    weight: data.weight || '28 kg',
    microchipId: data.microchipId || '',
    registrationNo: data.registrationNo || '',
    licenseNo: data.licenseNo || '',
    photo: data.photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
    importantNotes: data.importantNotes || 'Friendly puppy.',
    isLost: data.isLost ?? false,
    lostNotes: data.lostNotes,
    lastSeenDate: data.lastSeenDate,
    lastSeenTime: data.lastSeenTime,
    lastSeenLocation: data.lastSeenLocation,
    rewardAmount: data.rewardAmount,
    user: data.user || {
      name: 'Tarun Milar',
      phone: '+91 96526 36993',
      email: 'tarun.tarun460@gmail.com',
      address: 'Road No. 5, Banjara Hills, Hyderabad',
    },
    privacySetting: data.privacySetting || { showName: true, showPhoto: true, showBreed: true },
    vaccinations: data.vaccinations || [],
    expenses: data.expenses || [],
    reminders: data.reminders || [],
    qrCode: {
      qrCodeUrl: `https://coco-website-ten.vercel.app/pet/${publicId}`,
      scanCount: 0,
    },
  };

  const existingIdx = currentPets.findIndex((p) => p.id === newPet.id || p.publicId === newPet.publicId);
  if (existingIdx === -1) {
    currentPets.unshift(newPet);
  } else {
    currentPets[existingIdx] = newPet;
  }

  await saveToCloudStore(currentPets);
  return newPet;
}

export async function updatePetInStore(petId: string, updates: Partial<PetRecord>): Promise<PetRecord | undefined> {
  const currentPets = await syncFromCloudStore();
  const index = currentPets.findIndex((p) => p.id === petId || p.publicId === petId);
  if (index !== -1) {
    currentPets[index] = { ...currentPets[index], ...updates };
    await saveToCloudStore(currentPets);
    return currentPets[index];
  }
  return undefined;
}

export async function deletePetFromStore(petId: string): Promise<boolean> {
  const currentPets = await syncFromCloudStore();
  const idx = currentPets.findIndex((p) => p.id === petId || p.publicId === petId);
  if (idx !== -1) {
    currentPets.splice(idx, 1);
    await saveToCloudStore(currentPets);
    return true;
  }
  return false;
}

export async function toggleLostModeInStore(petId: string, isLost: boolean): Promise<PetRecord | undefined> {
  return updatePetInStore(petId, { isLost });
}

export async function addVaccinationToStore(petId: string, vacData: Partial<VaccinationRecord>): Promise<VaccinationRecord> {
  const currentPets = await syncFromCloudStore();
  const pet = currentPets.find((p) => p.id === petId || p.publicId === petId);
  const newVac: VaccinationRecord = {
    id: vacData.id || `vac-${Date.now()}`,
    petId: pet?.id || petId,
    vaccineName: vacData.vaccineName || 'Rabies Vaccine',
    dateAdministered: vacData.dateAdministered || new Date().toISOString().split('T')[0],
    nextDueDate: vacData.nextDueDate,
    vetName: vacData.vetName || 'Dr. Rahul Verma',
    clinic: vacData.clinic || 'Banjara Vet Hospital',
    notes: vacData.notes,
    status: (vacData.status as any) || 'COMPLETED',
  };

  if (pet) {
    if (!pet.vaccinations) pet.vaccinations = [];
    pet.vaccinations.unshift(newVac);
    await saveToCloudStore(currentPets);
  }
  return newVac;
}

export async function updateVaccinationInStore(petId: string, vacId: string, updates: Partial<VaccinationRecord>): Promise<VaccinationRecord | undefined> {
  const currentPets = await syncFromCloudStore();
  const pet = currentPets.find((p) => p.id === petId || p.publicId === petId);
  if (pet) {
    const idx = pet.vaccinations.findIndex((v) => v.id === vacId);
    if (idx !== -1) {
      pet.vaccinations[idx] = { ...pet.vaccinations[idx], ...updates };
      await saveToCloudStore(currentPets);
      return pet.vaccinations[idx];
    }
  }
  return undefined;
}

export async function addExpenseToStore(petId: string, expData: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
  const currentPets = await syncFromCloudStore();
  const pet = currentPets.find((p) => p.id === petId || p.publicId === petId);
  const newExp: ExpenseRecord = {
    id: expData.id || `exp-${Date.now()}`,
    petId: pet?.id || petId,
    category: expData.category || 'Food',
    description: expData.description || 'Pet Food & Supplies',
    amount: Number(expData.amount || 0),
    currency: expData.currency || '₹',
    date: expData.date || new Date().toISOString().split('T')[0],
    vendor: expData.vendor || 'Pet Store',
  };

  if (pet) {
    if (!pet.expenses) pet.expenses = [];
    pet.expenses.unshift(newExp);
    await saveToCloudStore(currentPets);
  }
  return newExp;
}

export async function addReminderToStore(petId: string, remData: Partial<ReminderRecord>): Promise<ReminderRecord> {
  const currentPets = await syncFromCloudStore();
  const pet = currentPets.find((p) => p.id === petId || p.publicId === petId);
  const newRem: ReminderRecord = {
    id: remData.id || `rem-${Date.now()}`,
    petId: pet?.id || petId,
    category: remData.category || 'Care',
    title: remData.title || 'Scheduled Care Alert',
    date: remData.date || new Date().toISOString().split('T')[0],
    time: remData.time || '09:00 AM',
    repeat: remData.repeat || 'ONCE',
    notes: remData.notes,
    isCompleted: !!remData.isCompleted,
  };

  if (pet) {
    if (!pet.reminders) pet.reminders = [];
    pet.reminders.unshift(newRem);
    await saveToCloudStore(currentPets);
  }
  return newRem;
}
