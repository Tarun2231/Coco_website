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

const initialPets: PetRecord[] = [
  {
    id: 'bruno-id',
    publicId: 'bruno',
    name: 'Bruno',
    species: 'Dog',
    breed: 'Golden Retriever',
    gender: 'Male',
    dob: '2025-05-15',
    color: 'Golden',
    weight: '28 kg',
    microchipId: '988 000 123 456 789',
    registrationNo: 'PET-HYD-2025-0891',
    licenseNo: 'LIC-99210-A',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
    isLost: true,
    lostNotes: 'Bruno got loose near Banjara Hills Park around 4 PM. He is very friendly, wearing a brown leather collar with a Puppy ID QR tag.',
    lastSeenDate: '2026-08-24',
    lastSeenTime: '04:00 PM',
    lastSeenLocation: 'Road No. 5, Banjara Hills, Hyderabad',
    lastSeenLat: 17.4156,
    lastSeenLng: 78.4484,
    rewardAmount: '₹5,000 Cash Reward',
    importantNotes: 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.',
    user: {
      name: 'Tarun Milar',
      phone: '+91 96526 36993',
      altPhone: '+91 91234 56789',
      email: 'tarun.tarun460@gmail.com',
      address: 'Road No. 5, Banjara Hills, Hyderabad, Telangana 500034, India',
    },
    privacySetting: {
      showName: true,
      showPhoto: true,
      showBreed: true,
      showGender: true,
      showAge: true,
      showColor: true,
      showWeight: true,
      showMicrochip: true,
      showPhone: true,
      showAltPhone: true,
      showEmail: true,
      showAddress: true,
      showVaccinations: true,
      showNotes: true,
      showLastSeen: true,
    },
    vaccinations: [
      { id: 'v1', petId: 'bruno-id', vaccineName: 'Rabies Anti-Rabies Vaccine', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Hospital', status: 'COMPLETED', notes: '3-year anti-rabies booster strain' },
      { id: 'v2', petId: 'bruno-id', vaccineName: 'DHPP (Distemper, Hepatitis, Parvovirus)', dateAdministered: '2026-03-12', nextDueDate: '2027-03-12', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Hospital', status: 'COMPLETED', notes: 'Core vaccination completed' },
      { id: 'v3', petId: 'bruno-id', vaccineName: 'Annual Booster Shot', dateAdministered: '2026-04-10', nextDueDate: '2026-08-29', vetName: 'Dr. Anita Rao', clinic: 'Apollo Vet Hospital', status: 'UPCOMING', notes: 'Scheduled annual immunity booster' },
      { id: 'v4', petId: 'bruno-id', vaccineName: 'Bordetella Kennel Cough', dateAdministered: '2026-04-10', nextDueDate: '2027-04-10', vetName: 'Dr. Anita Rao', clinic: 'Apollo Vet Hospital', status: 'COMPLETED', notes: 'Oral Bordetella vaccine' },
    ],
    expenses: [
      { id: 'e1', petId: 'bruno-id', category: 'Food', description: 'Royal Canin Maxi Adult (15kg)', amount: 2450, currency: '₹', date: '2026-04-12', vendor: 'PetSupermarket Hyderabad' },
      { id: 'e2', petId: 'bruno-id', category: 'Vet', description: 'Routine Checkup & Ear Cleaning', amount: 1200, currency: '₹', date: '2026-04-08', vendor: 'Banjara Vet Hospital' },
      { id: 'e3', petId: 'bruno-id', category: 'Accessories', description: 'Puppy ID Engraved Collar Tag', amount: 1450, currency: '₹', date: '2026-02-20', vendor: 'Puppy ID Store' },
    ],
    reminders: [
      { id: 'r1', petId: 'bruno-id', category: 'Vaccination', title: 'Annual Booster Vaccination', date: '2026-08-29', time: '10:00 AM', repeat: 'ONCE', notes: 'Visit Dr. Anita Rao at Apollo Vet Hospital', isCompleted: false },
      { id: 'r2', petId: 'bruno-id', category: 'Deworming', title: 'Deworming Tablet', date: '2026-09-08', time: '08:30 AM', repeat: 'EVERY_3_MONTHS', notes: 'Give Drontal Plus with breakfast food', isCompleted: false },
    ],
    qrCode: {
      qrCodeUrl: 'https://coco-website-ten.vercel.app/pet/bruno',
      scanCount: 27,
    },
  },
  {
    id: 'coco-id',
    publicId: 'coco',
    name: 'Coco',
    species: 'Dog',
    breed: 'Shih Tzu',
    gender: 'Female',
    dob: '2024-02-10',
    color: 'White & Tan',
    weight: '6.5 kg',
    microchipId: '988 000 789 654 321',
    registrationNo: 'PET-HYD-2025-0942',
    licenseNo: 'LIC-88120-B',
    photo: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=600&fit=crop',
    isLost: false,
    importantNotes: 'Coco is sweet and shy. Selective with food.',
    user: {
      name: 'Tarun Milar',
      phone: '+91 96526 36993',
      email: 'tarun.tarun460@gmail.com',
      address: 'Road No. 5, Banjara Hills, Hyderabad',
    },
    privacySetting: { showName: true, showPhoto: true, showBreed: true },
    vaccinations: [
      { id: 'v5', petId: 'coco-id', vaccineName: 'DHPP Vaccine', dateAdministered: '2026-02-14', nextDueDate: '2027-02-14', vetName: 'Dr. Anita Rao', clinic: 'Paw Care Clinic', status: 'COMPLETED' },
      { id: 'v6', petId: 'coco-id', vaccineName: 'Rabies Booster', dateAdministered: '2026-02-14', nextDueDate: '2027-02-14', vetName: 'Dr. Anita Rao', clinic: 'Paw Care Clinic', status: 'COMPLETED' },
    ],
    expenses: [
      { id: 'e4', petId: 'coco-id', category: 'Grooming', description: 'Full Spa & De-shedding Grooming', amount: 1800, currency: '₹', date: '2026-03-01', vendor: 'Paws Spa' },
    ],
    reminders: [
      { id: 'r3', petId: 'coco-id', category: 'Flea Care', title: 'Flea & Tick Spot-On', date: '2026-09-15', time: '07:00 PM', repeat: 'MONTHLY', notes: 'Apply Bravecto spot-on', isCompleted: false },
    ],
    qrCode: {
      qrCodeUrl: 'https://coco-website-ten.vercel.app/pet/coco',
      scanCount: 8,
    },
  },
  {
    id: 'max-id',
    publicId: 'max',
    name: 'Max',
    species: 'Dog',
    breed: 'Labrador Retriever',
    gender: 'Male',
    dob: '2023-11-20',
    color: 'Black',
    weight: '32 kg',
    microchipId: '988 000 555 444 333',
    registrationNo: 'PET-HYD-2025-0105',
    licenseNo: 'LIC-77110-C',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
    isLost: false,
    importantNotes: 'High energy lab. Extremely friendly and active.',
    user: {
      name: 'Tarun Milar',
      phone: '+91 96526 36993',
      email: 'tarun.tarun460@gmail.com',
      address: 'Road No. 5, Banjara Hills, Hyderabad',
    },
    privacySetting: { showName: true, showPhoto: true },
    vaccinations: [
      { id: 'v7', petId: 'max-id', vaccineName: 'Rabies Anti-Rabies Vaccine', dateAdministered: '2026-01-10', nextDueDate: '2027-01-10', vetName: 'Dr. Rahul Verma', clinic: 'Banjara Vet Hospital', status: 'COMPLETED' },
    ],
    expenses: [],
    reminders: [],
    qrCode: {
      qrCodeUrl: 'https://coco-website-ten.vercel.app/pet/max',
      scanCount: 14,
    },
  },
];

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
