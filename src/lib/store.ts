const CLOUD_OBJECT_ID = 'ff808181a067127101a06d588f79124f';
const CLOUD_API_URL = `https://api.restful-api.dev/objects/${CLOUD_OBJECT_ID}`;

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
  importantNotes?: string;
  isLost: boolean;
  lostNotes?: string;
  lastSeenDate?: string;
  lastSeenTime?: string;
  lastSeenLocation?: string;
  rewardAmount?: string;
  user?: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  privacySetting?: {
    showName: boolean;
    showPhoto: boolean;
    showBreed: boolean;
    [key: string]: boolean;
  };
  vaccinations: VaccinationRecord[];
  expenses: ExpenseRecord[];
  reminders: ReminderRecord[];
  qrCode?: {
    qrCodeUrl: string;
    scanCount: number;
  };
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  doseCount?: number | string;
  cost?: number | string;
  dateAdministered: string;
  nextDueDate?: string;
  vetName?: string;
  clinic?: string;
  notes?: string;
  photo?: string;
  status: 'COMPLETED' | 'UPCOMING' | 'OVERDUE';
}

export interface ExpenseRecord {
  id: string;
  petId: string;
  category: string;
  description: string;
  amount: number;
  currency?: string;
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

export interface ActivityLogRecord {
  id: string;
  timestamp: string;
  formattedTime: string;
  type: string;
  title: string;
  details: string;
  petName: string;
}

const globalForStore = globalThis as unknown as {
  petsStore: PetRecord[] | undefined;
  activityStore: ActivityLogRecord[] | undefined;
  lastSyncTime: number | undefined;
};

if (!globalForStore.petsStore) {
  globalForStore.petsStore = [];
}
if (!globalForStore.activityStore) {
  globalForStore.activityStore = [];
}
if (!globalForStore.lastSyncTime) {
  globalForStore.lastSyncTime = 0;
}

export const petsStore = globalForStore.petsStore;
export const activityStore = globalForStore.activityStore;

// Sync from Cloud Store (always fetches authoritative cloud data)
export async function syncFromCloudStore(): Promise<{ pets: PetRecord[]; activities: ActivityLogRecord[] }> {
  try {
    const res = await fetch(CLOUD_API_URL, { cache: 'no-store' });
    if (res.ok) {
      const body = await res.json();
      if (body?.data?.pets && Array.isArray(body.data.pets)) {
        globalForStore.petsStore = body.data.pets;
        globalForStore.activityStore = body.data.activities || [];
        return { pets: body.data.pets, activities: body.data.activities || [] };
      }
    }
  } catch (err) {
    console.error('Cloud store sync GET error:', err);
  }
  return { pets: globalForStore.petsStore || [], activities: globalForStore.activityStore || [] };
}

// Push to Cloud Store
export async function saveToCloudStore(pets: PetRecord[], activities?: ActivityLogRecord[]): Promise<void> {
  try {
    globalForStore.petsStore = pets;
    if (activities) globalForStore.activityStore = activities;
    globalForStore.lastSyncTime = Date.now();

    const sanitizedPets = pets.map((p) => {
      let photo = p.photo;
      if (photo && photo.length > 2000 && photo.startsWith('data:')) {
        photo = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop';
      }
      const vaccinations = (p.vaccinations || []).map((v) => {
        let vacPhoto = v.photo;
        if (vacPhoto && vacPhoto.length > 2000 && vacPhoto.startsWith('data:')) {
          vacPhoto = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=600&fit=crop';
        }
        return { ...v, photo: vacPhoto };
      });
      return { ...p, photo, vaccinations };
    });

    const currentActivities = activities || globalForStore.activityStore || [];
    const trimmedActivities = currentActivities.slice(0, 50);

    const res = await fetch(CLOUD_API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Puppy ID Store',
        data: { pets: sanitizedPets, activities: trimmedActivities },
      }),
    });
    if (!res.ok) {
      console.error('Cloud store PUT status:', res.status);
    }
  } catch (err) {
    console.error('Cloud store sync PUT error:', err);
  }
}

export function getAllPets(): PetRecord[] {
  return globalForStore.petsStore || [];
}

export function getPetById(idOrPublicId: string): PetRecord | undefined {
  const all = getAllPets();
  const search = String(idOrPublicId || '').trim().toLowerCase();
  return all.find((p) => String(p.id).trim().toLowerCase() === search || String(p.publicId).trim().toLowerCase() === search);
}

export async function addPetToStore(data: Partial<PetRecord>): Promise<PetRecord> {
  const { pets: currentPets, activities } = await syncFromCloudStore();

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

  const searchTarget = String(newPet.id).trim().toLowerCase();
  const existingIdx = currentPets.findIndex(
    (p) => String(p.id).trim().toLowerCase() === searchTarget || String(p.publicId).trim().toLowerCase() === String(newPet.publicId).trim().toLowerCase()
  );

  if (existingIdx === -1) {
    currentPets.unshift(newPet);

    const now = new Date();
    const newActivity: ActivityLogRecord = {
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      type: 'PUPPY_ADDED',
      title: `Added New Puppy "${cleanName}"`,
      details: `Breed: ${newPet.breed} • Gender: ${newPet.gender}`,
      petName: cleanName,
    };
    activities.unshift(newActivity);
  } else {
    currentPets[existingIdx] = { ...currentPets[existingIdx], ...newPet };
  }

  await saveToCloudStore(currentPets, activities);
  return newPet;
}

export async function updatePetInStore(petId: string, updates: Partial<PetRecord>): Promise<PetRecord | undefined> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const search = String(petId).trim().toLowerCase();
  const index = currentPets.findIndex(
    (p) => String(p.id).trim().toLowerCase() === search || String(p.publicId).trim().toLowerCase() === search
  );
  if (index !== -1) {
    currentPets[index] = { ...currentPets[index], ...updates };
    await saveToCloudStore(currentPets, activities);
    return currentPets[index];
  }
  return undefined;
}

export async function deletePetFromStore(petId: string): Promise<boolean> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const searchId = String(petId).trim().toLowerCase();

  const idx = currentPets.findIndex(
    (p) =>
      String(p.id).trim().toLowerCase() === searchId ||
      String(p.publicId).trim().toLowerCase() === searchId ||
      String(p.name).trim().toLowerCase() === searchId
  );

  if (idx !== -1) {
    const petName = currentPets[idx].name;
    currentPets.splice(idx, 1);

    const now = new Date();
    activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      type: 'PET_DELETED',
      title: `Removed Puppy "${petName}"`,
      details: `Pet deleted from registry`,
      petName,
    });

    await saveToCloudStore(currentPets, activities);
    return true;
  }
  return false;
}

export async function toggleLostModeInStore(petId: string, isLost: boolean): Promise<PetRecord | undefined> {
  return updatePetInStore(petId, { isLost });
}

export async function addVaccinationToStore(petId: string, vacData: Partial<VaccinationRecord>): Promise<VaccinationRecord> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const search = String(petId).trim().toLowerCase();
  let pet = currentPets.find((p) => String(p.id).trim().toLowerCase() === search || String(p.publicId).trim().toLowerCase() === search);
  if (!pet && currentPets.length > 0) {
    pet = currentPets[0];
  }

  const newVac: VaccinationRecord = {
    id: vacData.id || `vac-${Date.now()}`,
    petId: pet?.id || petId,
    vaccineName: vacData.vaccineName || 'Rabies Anti-Rabies Vaccine',
    doseCount: vacData.doseCount,
    cost: vacData.cost ? Number(vacData.cost) : 0,
    dateAdministered: vacData.dateAdministered || new Date().toISOString().split('T')[0],
    nextDueDate: vacData.nextDueDate,
    vetName: vacData.vetName || 'Dr. Rahul Verma',
    clinic: vacData.clinic || 'Banjara Vet Hospital',
    notes: vacData.notes,
    photo: vacData.photo,
    status: (vacData.status as any) || 'COMPLETED',
  };

  if (pet) {
    if (!pet.vaccinations) pet.vaccinations = [];
    const exists = pet.vaccinations.some((v) => v.id === newVac.id);
    if (!exists) {
      pet.vaccinations.unshift(newVac);

      // Automatically create linked expense record if cost > 0
      if (Number(newVac.cost || 0) > 0) {
        if (!pet.expenses) pet.expenses = [];
        const vacExpId = `exp-vac-${newVac.id}`;
        if (!pet.expenses.some((e) => e.id === vacExpId)) {
          pet.expenses.unshift({
            id: vacExpId,
            petId: pet.id,
            category: 'Vaccination',
            description: `Vaccination: ${newVac.vaccineName}`,
            amount: Number(newVac.cost),
            currency: '₹',
            date: newVac.dateAdministered,
            vendor: newVac.clinic || 'Vet Clinic',
          });
        }
      }

      const now = new Date();
      activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: now.toISOString(),
        formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        type: 'VACCINE_ADDED',
        title: `Vaccine Logged: "${newVac.vaccineName}"${Number(newVac.cost || 0) > 0 ? ` (₹${newVac.cost})` : ''}`,
        details: `Given: ${newVac.dateAdministered} • Vet: ${newVac.vetName || 'Dr. Verma'}`,
        petName: pet.name,
      });
    }
    await saveToCloudStore(currentPets, activities);
  }
  return newVac;
}

export async function deleteVaccinationFromStore(petId: string, vacId: string): Promise<boolean> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const searchPet = String(petId).trim().toLowerCase();
  let pet = currentPets.find((p) => String(p.id).trim().toLowerCase() === searchPet || String(p.publicId).trim().toLowerCase() === searchPet);
  if (!pet && currentPets.length > 0) pet = currentPets[0];

  if (pet && pet.vaccinations) {
    const searchVac = String(vacId).trim().toLowerCase();
    const idx = pet.vaccinations.findIndex((v) => String(v.id).trim().toLowerCase() === searchVac);
    if (idx !== -1) {
      const vacName = pet.vaccinations[idx].vaccineName;
      pet.vaccinations.splice(idx, 1);

      if (pet.expenses) {
        pet.expenses = pet.expenses.filter((e) => e.id !== `exp-vac-${vacId}`);
      }

      const now = new Date();
      activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: now.toISOString(),
        formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
        type: 'VACCINE_DELETED',
        title: `Removed Vaccine Record: "${vacName}"`,
        details: `Vaccination record deleted from history log`,
        petName: pet.name,
      });

      await saveToCloudStore(currentPets, activities);
      return true;
    }
  }
  return false;
}

export async function updateVaccinationInStore(petId: string, vacId: string, updates: Partial<VaccinationRecord>): Promise<VaccinationRecord | undefined> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const search = String(petId).trim().toLowerCase();
  let pet = currentPets.find((p) => String(p.id).trim().toLowerCase() === search || String(p.publicId).trim().toLowerCase() === search);
  if (!pet && currentPets.length > 0) pet = currentPets[0];

  if (pet && pet.vaccinations) {
    const idx = pet.vaccinations.findIndex((v) => String(v.id).trim().toLowerCase() === String(vacId).trim().toLowerCase());
    if (idx !== -1) {
      const existing = pet.vaccinations[idx];
      const photo = updates.photo !== undefined ? updates.photo : existing.photo;
      pet.vaccinations[idx] = { ...existing, ...updates, photo };

      // Update linked expense if cost/clinic/vaccineName updated
      if (pet.expenses) {
        const vacExpId = `exp-vac-${vacId}`;
        const expIdx = pet.expenses.findIndex((e) => e.id === vacExpId);
        const newCost = Number(pet.vaccinations[idx].cost || 0);
        if (expIdx !== -1) {
          if (newCost > 0) {
            pet.expenses[expIdx] = {
              ...pet.expenses[expIdx],
              description: `Vaccination: ${pet.vaccinations[idx].vaccineName}`,
              amount: newCost,
              vendor: pet.vaccinations[idx].clinic || 'Vet Clinic',
              date: pet.vaccinations[idx].dateAdministered,
            };
          } else {
            pet.expenses.splice(expIdx, 1);
          }
        } else if (newCost > 0) {
          pet.expenses.unshift({
            id: vacExpId,
            petId: pet.id,
            category: 'Vaccination',
            description: `Vaccination: ${pet.vaccinations[idx].vaccineName}`,
            amount: newCost,
            currency: '₹',
            date: pet.vaccinations[idx].dateAdministered,
            vendor: pet.vaccinations[idx].clinic || 'Vet Clinic',
          });
        }
      }

      await saveToCloudStore(currentPets, activities);
      return pet.vaccinations[idx];
    }
  }
  return undefined;
}

export async function addExpenseToStore(petId: string, expData: Partial<ExpenseRecord>): Promise<ExpenseRecord> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const search = String(petId).trim().toLowerCase();
  let pet = currentPets.find((p) => String(p.id).trim().toLowerCase() === search || String(p.publicId).trim().toLowerCase() === search);
  if (!pet && currentPets.length > 0) pet = currentPets[0];

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

    const now = new Date();
    activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      type: 'EXPENSE_ADDED',
      title: `Expense Logged: ₹${newExp.amount} (${newExp.category})`,
      details: `${newExp.description || 'Pet Expense'}`,
      petName: pet.name,
    });

    await saveToCloudStore(currentPets, activities);
  }
  return newExp;
}

export async function addReminderToStore(petId: string, remData: Partial<ReminderRecord>): Promise<ReminderRecord> {
  const { pets: currentPets, activities } = await syncFromCloudStore();
  const search = String(petId).trim().toLowerCase();
  let pet = currentPets.find((p) => String(p.id).trim().toLowerCase() === search || String(p.publicId).trim().toLowerCase() === search);
  if (!pet && currentPets.length > 0) pet = currentPets[0];

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

    const now = new Date();
    activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedTime: `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`,
      type: 'REMINDER_ADDED',
      title: `Care Reminder Saved: "${newRem.title}"`,
      details: `Scheduled for: ${newRem.date}`,
      petName: pet.name,
    });

    await saveToCloudStore(currentPets, activities);
  }
  return newRem;
}
