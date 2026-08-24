export type Role = 'USER' | 'ADMIN';
export type VaccinationStatus = 'COMPLETED' | 'UPCOMING' | 'OVERDUE';
export type RepeatInterval = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'EVERY_3_MONTHS' | 'EVERY_6_MONTHS' | 'YEARLY';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  altPhone?: string | null;
  address?: string | null;
  avatar?: string | null;
  role: Role | string;
  createdAt: string | Date;
}

export interface PrivacySetting {
  id: string;
  petId: string;
  showName: boolean;
  showPhoto: boolean;
  showBreed: boolean;
  showGender: boolean;
  showAge: boolean;
  showColor: boolean;
  showWeight: boolean;
  showMicrochip: boolean;
  showPhone: boolean;
  showAltPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showVaccinations: boolean;
  showNotes: boolean;
  showLastSeen: boolean;
}

export interface Pet {
  id: string;
  publicId: string;
  userId: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  dob?: string | Date | null;
  color?: string | null;
  weight?: string | null;
  microchipId?: string | null;
  registrationNo?: string | null;
  licenseNo?: string | null;
  photo?: string | null;
  isLost: boolean;
  lostNotes?: string | null;
  lastSeenDate?: string | Date | null;
  lastSeenTime?: string | null;
  lastSeenLocation?: string | null;
  lastSeenLat?: number | null;
  lastSeenLng?: number | null;
  rewardAmount?: string | null;
  importantNotes?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  privacySetting?: PrivacySetting | null;
  user?: User | null;
  vaccinations?: Vaccination[];
  expenses?: Expense[];
  reminders?: Reminder[];
  documents?: PetDocument[];
  qrCode?: QRCodeData | null;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: string | Date;
  nextDueDate?: string | Date | null;
  vetName?: string | null;
  clinic?: string | null;
  batchNo?: string | null;
  notes?: string | null;
  certificateUrl?: string | null;
  status: VaccinationStatus | string;
}

export interface Expense {
  id: string;
  petId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string | Date;
  vendor?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  receiptUrl?: string | null;
}

export interface Reminder {
  id: string;
  petId: string;
  title: string;
  category: string;
  date: string | Date;
  time?: string | null;
  repeat: RepeatInterval | string;
  notes?: string | null;
  isCompleted: boolean;
}

export interface PetDocument {
  id: string;
  petId: string;
  title: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  uploadedAt: string | Date;
}

export interface QRCodeData {
  id: string;
  petId: string;
  qrCodeUrl: string;
  scanCount: number;
}

export interface FinderMessage {
  id: string;
  petId: string;
  senderName: string;
  senderPhone?: string | null;
  message: string;
  finderLocation?: string | null;
  finderPhotoUrl?: string | null;
  isRead: boolean;
  createdAt: string | Date;
  pet?: {
    name: string;
    photo?: string | null;
  } | null;
}
