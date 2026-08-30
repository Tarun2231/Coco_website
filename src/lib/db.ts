import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export async function ensureTablesExist() {
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "altPhone" TEXT,
        "address" TEXT,
        "avatar" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Pet" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "publicId" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "species" TEXT NOT NULL DEFAULT 'Dog',
        "breed" TEXT NOT NULL,
        "gender" TEXT NOT NULL,
        "dob" DATETIME,
        "color" TEXT,
        "weight" TEXT,
        "microchipId" TEXT,
        "registrationNo" TEXT,
        "licenseNo" TEXT,
        "photo" TEXT,
        "isLost" BOOLEAN NOT NULL DEFAULT 0,
        "lostNotes" TEXT,
        "lastSeenDate" DATETIME,
        "lastSeenTime" TEXT,
        "lastSeenLocation" TEXT,
        "lastSeenLat" REAL,
        "lastSeenLng" REAL,
        "rewardAmount" TEXT,
        "importantNotes" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrivacySetting" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "petId" TEXT NOT NULL UNIQUE,
        "showName" BOOLEAN NOT NULL DEFAULT 1,
        "showPhoto" BOOLEAN NOT NULL DEFAULT 1,
        "showBreed" BOOLEAN NOT NULL DEFAULT 1,
        "showGender" BOOLEAN NOT NULL DEFAULT 1,
        "showAge" BOOLEAN NOT NULL DEFAULT 1,
        "showColor" BOOLEAN NOT NULL DEFAULT 1,
        "showWeight" BOOLEAN NOT NULL DEFAULT 1,
        "showMicrochip" BOOLEAN NOT NULL DEFAULT 1,
        "showPhone" BOOLEAN NOT NULL DEFAULT 1,
        "showAltPhone" BOOLEAN NOT NULL DEFAULT 1,
        "showEmail" BOOLEAN NOT NULL DEFAULT 1,
        "showAddress" BOOLEAN NOT NULL DEFAULT 1,
        "showVaccinations" BOOLEAN NOT NULL DEFAULT 1,
        "showNotes" BOOLEAN NOT NULL DEFAULT 1,
        "showLastSeen" BOOLEAN NOT NULL DEFAULT 1
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Vaccination" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "petId" TEXT NOT NULL,
        "vaccineName" TEXT NOT NULL,
        "dateAdministered" DATETIME NOT NULL,
        "nextDueDate" DATETIME,
        "vetName" TEXT,
        "clinic" TEXT,
        "batchNo" TEXT,
        "notes" TEXT,
        "certificateUrl" TEXT,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "petId" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "amount" REAL NOT NULL,
        "currency" TEXT NOT NULL DEFAULT '₹',
        "date" DATETIME NOT NULL,
        "vendor" TEXT,
        "paymentMethod" TEXT DEFAULT 'UPI / Card',
        "notes" TEXT,
        "receiptUrl" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Reminder" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "petId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "date" DATETIME NOT NULL,
        "time" TEXT DEFAULT '09:00 AM',
        "repeat" TEXT NOT NULL DEFAULT 'ONCE',
        "notes" TEXT,
        "isCompleted" BOOLEAN NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "QRCode" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "petId" TEXT NOT NULL UNIQUE,
        "qrCodeUrl" TEXT NOT NULL,
        "scanCount" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "entity" TEXT NOT NULL,
        "entityId" TEXT,
        "details" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LoginLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "userEmail" TEXT NOT NULL,
        "userName" TEXT,
        "ip" TEXT DEFAULT '182.73.12.105',
        "device" TEXT DEFAULT 'Mobile Chrome',
        "city" TEXT DEFAULT 'Hyderabad',
        "country" TEXT DEFAULT 'India',
        "loginTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    // Ignore schema auto-creation errors if tables already exist
  }
}
