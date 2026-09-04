// Vercel Serverless In-Memory Data Store for Puppy ID
// Stores all puppies, vaccinations, expenses, reminders, and QR details with zero external database dependencies.

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

// Clean production state - zero sample pets
const initialPets: PetRecord[] = [];

const globalForStore = globalThis as unknown as {
  petsStore: PetRecord[] | undefined;
};

if (!globalForStore.petsStore) {
  globalForStore.petsStore = initialPets;
}

export const petsStore = globalForStore.petsStore;

export function getAllPets(): PetRecord[] {
  return globalForStore.petsStore || initialPets;
}

export function getPetById(idOrPublicId: string): PetRecord | undefined {
  const all = getAllPets();
  return all.find((p) => p.id === idOrPublicId || p.publicId === idOrPublicId);
}

export function addPetToStore(data: Partial<PetRecord>): PetRecord {
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
    microchipId: data.microchipId || `988 000 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`,
    registrationNo: data.registrationNo || `PET-HYD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    licenseNo: data.licenseNo || `LIC-${Math.floor(10000 + Math.random() * 90000)}-A`,
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

  globalForStore.petsStore?.unshift(newPet);
  return newPet;
}

export function updatePetInStore(petId: string, updates: Partial<PetRecord>): PetRecord | undefined {
  const all = getAllPets();
  const index = all.findIndex((p) => p.id === petId || p.publicId === petId);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates };
    return all[index];
  }
  return undefined;
}

export function deletePetFromStore(petId: string): boolean {
  if (globalForStore.petsStore) {
    const idx = globalForStore.petsStore.findIndex((p) => p.id === petId || p.publicId === petId);
    if (idx !== -1) {
      globalForStore.petsStore.splice(idx, 1);
      return true;
    }
  }
  return false;
}

export function toggleLostModeInStore(petId: string, isLost: boolean): PetRecord | undefined {
  return updatePetInStore(petId, { isLost });
}

export function addVaccinationToStore(petId: string, vacData: Partial<VaccinationRecord>): VaccinationRecord {
  const pet = getPetById(petId);
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
    pet.vaccinations.unshift(newVac);
  }
  return newVac;
}

export function updateVaccinationInStore(petId: string, vacId: string, updates: Partial<VaccinationRecord>): VaccinationRecord | undefined {
  const pet = getPetById(petId);
  if (pet) {
    const idx = pet.vaccinations.findIndex((v) => v.id === vacId);
    if (idx !== -1) {
      pet.vaccinations[idx] = { ...pet.vaccinations[idx], ...updates };
      return pet.vaccinations[idx];
    }
  }
  return undefined;
}

export function addExpenseToStore(petId: string, expData: Partial<ExpenseRecord>): ExpenseRecord {
  const pet = getPetById(petId);
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
  }
  return newExp;
}

export function addReminderToStore(petId: string, remData: Partial<ReminderRecord>): ReminderRecord {
  const pet = getPetById(petId);
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
  }
  return newRem;
}
