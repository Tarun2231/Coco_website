import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Puppy ID Database...');

  // Hash password
  const ownerPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('adminpassword123', 10);

  // 1. Create Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@puppyid.com' },
    update: {},
    create: {
      email: 'owner@puppyid.com',
      password: ownerPassword,
      name: 'Demo Owner',
      phone: '+91 98765 43210',
      altPhone: '+91 91234 56789',
      address: '12, Green Meadows Apartment, Road No. 5, Banjara Hills, Hyderabad, Telangana 500034, India',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@puppyid.com' },
    update: {},
    create: {
      email: 'admin@puppyid.com',
      password: adminPassword,
      name: 'System Administrator',
      phone: '+91 99999 88888',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  // 3. Create Primary Pet: Bruno
  const bruno = await prisma.pet.upsert({
    where: { publicId: 'bruno' },
    update: {},
    create: {
      publicId: 'bruno',
      userId: owner.id,
      name: 'Bruno',
      species: 'Dog',
      breed: 'Golden Retriever',
      gender: 'Male',
      dob: new Date('2025-05-15'),
      color: 'Golden',
      weight: '28 kg',
      microchipId: '988 000 123 456 789',
      registrationNo: 'PET-HYD-2025-0891',
      licenseNo: 'LIC-99210-A',
      photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
      isLost: true,
      lostNotes: 'Bruno got loose near Banjara Hills Park around 4 PM. He is very friendly, wearing a brown leather collar with a Puppy ID QR tag.',
      lastSeenDate: new Date('2026-08-24'),
      lastSeenTime: '04:00 PM',
      lastSeenLocation: 'Road No. 5, Banjara Hills, Hyderabad',
      lastSeenLat: 17.4156,
      lastSeenLng: 78.4484,
      rewardAmount: '₹5,000 Cash Reward',
      importantNotes: 'Bruno is a friendly boy. He loves people and kids. Please call my family immediately.',
    },
  });

  // 4. Privacy Settings for Bruno
  await prisma.privacySetting.upsert({
    where: { petId: bruno.id },
    update: {},
    create: {
      petId: bruno.id,
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
  });

  // 5. Vaccinations for Bruno
  await prisma.vaccination.createMany({
    data: [
      {
        petId: bruno.id,
        vaccineName: 'DHPP',
        dateAdministered: new Date('2026-03-12'),
        nextDueDate: new Date('2027-03-12'),
        vetName: 'Dr. Rahul Verma',
        clinic: 'Banjara Pet Hospital',
        status: 'COMPLETED',
        notes: 'Annual core vaccination completed cleanly.',
      },
      {
        petId: bruno.id,
        vaccineName: 'Rabies',
        dateAdministered: new Date('2026-03-12'),
        nextDueDate: new Date('2027-03-12'),
        vetName: 'Dr. Rahul Verma',
        clinic: 'Banjara Pet Hospital',
        status: 'COMPLETED',
        notes: 'Rabies booster 3-year strain.',
      },
      {
        petId: bruno.id,
        vaccineName: 'Booster Vaccination',
        dateAdministered: new Date('2026-04-10'),
        nextDueDate: new Date('2026-08-29'),
        vetName: 'Dr. Anita Rao',
        clinic: 'Pets Care Clinic',
        status: 'UPCOMING',
        notes: 'Scheduled booster for immunity maintenance.',
      },
      {
        petId: bruno.id,
        vaccineName: 'Kennel Cough',
        dateAdministered: new Date('2026-04-10'),
        nextDueDate: new Date('2027-04-10'),
        vetName: 'Dr. Anita Rao',
        clinic: 'Pets Care Clinic',
        status: 'COMPLETED',
        notes: 'Bordetella bronchiseptica oral vaccine.',
      },
    ],
  });

  // 6. Expenses for Bruno (matching ₹12,450 total spent in screenshot!)
  await prisma.expense.createMany({
    data: [
      {
        petId: bruno.id,
        category: 'Food',
        description: 'Dog Food (Royal Canin)',
        amount: 2450,
        currency: '₹',
        date: new Date('2026-04-12'),
        vendor: 'PetSupermarket Hyderabad',
        paymentMethod: 'UPI',
        notes: '15kg Maxi Adult Kibble',
      },
      {
        petId: bruno.id,
        category: 'Vet',
        description: 'Vet Visit',
        amount: 1200,
        currency: '₹',
        date: new Date('2026-04-08'),
        vendor: 'Banjara Pet Hospital',
        paymentMethod: 'Credit Card',
        notes: 'Routine health checkup and ear cleaning',
      },
      {
        petId: bruno.id,
        category: 'Medicine',
        description: 'Vitamins & Supplements',
        amount: 850,
        currency: '₹',
        date: new Date('2026-04-05'),
        vendor: 'Apex Vet Pharmacy',
        paymentMethod: 'UPI',
        notes: 'Calcium and joint supplements',
      },
      {
        petId: bruno.id,
        category: 'Vaccination',
        description: 'Annual Vaccination Drive',
        amount: 3500,
        currency: '₹',
        date: new Date('2026-03-12'),
        vendor: 'Banjara Pet Hospital',
        paymentMethod: 'Debit Card',
        notes: 'DHPP + Rabies',
      },
      {
        petId: bruno.id,
        category: 'Accessories',
        description: 'Puppy ID Engraved Collar & Tag',
        amount: 1450,
        currency: '₹',
        date: new Date('2026-02-20'),
        vendor: 'Puppy ID Official Store',
        paymentMethod: 'UPI',
        notes: 'Custom QR collar tag',
      },
      {
        petId: bruno.id,
        category: 'Grooming',
        description: 'Full Spa & De-shedding Grooming',
        amount: 3000,
        currency: '₹',
        date: new Date('2026-01-15'),
        vendor: 'Paws & Tails Spa',
        paymentMethod: 'Cash',
        notes: 'Bath, haircut, claw trimming',
      },
    ],
  });

  // 7. Reminders for Bruno (matching 2 upcoming / countdowns in reference image)
  await prisma.reminder.createMany({
    data: [
      {
        petId: bruno.id,
        category: 'Vaccination',
        title: 'Booster Vaccination',
        date: new Date('2026-08-29'),
        time: '10:00 AM',
        repeat: 'ONCE',
        notes: 'Visit Dr. Anita Rao at Pets Care Clinic',
        isCompleted: false,
      },
      {
        petId: bruno.id,
        category: 'Deworming',
        title: 'Deworming Tablet',
        date: new Date('2026-09-08'),
        time: '08:30 AM',
        repeat: 'EVERY_3_MONTHS',
        notes: 'Give Drontal Plus tablet with breakfast food',
        isCompleted: false,
      },
      {
        petId: bruno.id,
        category: 'Flea Treatment',
        title: 'Flea & Tick Treatment',
        date: new Date('2026-09-20'),
        time: '07:00 PM',
        repeat: 'MONTHLY',
        notes: 'Apply Bravecto spot-on between shoulder blades',
        isCompleted: false,
      },
    ],
  });

  // 8. Documents for Bruno
  await prisma.petDocument.createMany({
    data: [
      {
        petId: bruno.id,
        title: 'Vaccination Certificate 2026',
        category: 'Vaccination Certificate',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: '1.2 MB',
      },
      {
        petId: bruno.id,
        title: 'Municipal Pet Registration License',
        category: 'Registration',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'pdf',
        fileSize: '850 KB',
      },
    ],
  });

  // 9. QR Code Record for Bruno
  await prisma.qRCode.upsert({
    where: { petId: bruno.id },
    update: {},
    create: {
      petId: bruno.id,
      qrCodeUrl: 'http://localhost:3000/pet/bruno',
      scanCount: 27,
    },
  });

  // 10. QR Scans History (27 scans total, recent ones)
  const scanLocations = [
    { city: 'Hyderabad', device: 'iPhone 15', browser: 'Safari' },
    { city: 'Hyderabad', device: 'Samsung Galaxy S24', browser: 'Chrome' },
    { city: 'Secunderabad', device: 'OnePlus 12', browser: 'Chrome' },
    { city: 'Hyderabad', device: 'Pixel 8', browser: 'Chrome' },
  ];

  for (let i = 0; i < 27; i++) {
    const loc = scanLocations[i % scanLocations.length];
    await prisma.qRScan.create({
      data: {
        petId: bruno.id,
        scannedAt: new Date(Date.now() - i * 86400000 * 0.8),
        ip: `182.73.${10 + i}.${100 + i}`,
        userAgent: `Mozilla/5.0 (${loc.device})`,
        device: loc.device,
        browser: loc.browser,
        city: loc.city,
        country: 'India',
      },
    });
  }

  // 11. Finder Messages for Bruno
  await prisma.finderMessage.createMany({
    data: [
      {
        petId: bruno.id,
        senderName: 'Vikram Sharma',
        senderPhone: '+91 98490 11223',
        message: 'Hi! I saw Bruno near Road No. 5 Banjara Hills park sitting near the tea stall. He has his tag on. I am waiting here with him!',
        finderLocation: 'Road No. 5, Banjara Hills near Tea Time',
        isRead: false,
      },
      {
        petId: bruno.id,
        senderName: 'Priya Reddy',
        senderPhone: '+91 97000 44332',
        message: 'Hello, scanned Bruno\'s QR tag near GVK One Mall exit. Giving him some water now.',
        finderLocation: 'GVK One Mall Entrance, Road No. 1',
        isRead: false,
      },
    ],
  });

  // 12. Secondary Pets: Coco & Max
  const coco = await prisma.pet.upsert({
    where: { publicId: 'coco' },
    update: {},
    create: {
      publicId: 'coco',
      userId: owner.id,
      name: 'Coco',
      species: 'Dog',
      breed: 'Shih Tzu',
      gender: 'Female',
      dob: new Date('2024-02-10'),
      color: 'White & Tan',
      weight: '6.5 kg',
      microchipId: '988 000 789 654 321',
      photo: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=600&fit=crop',
      isLost: false,
      importantNotes: 'Coco is sweet and shy. Selective with food.',
    },
  });

  await prisma.privacySetting.create({
    data: {
      petId: coco.id,
    },
  });

  await prisma.qRCode.create({
    data: {
      petId: coco.id,
      qrCodeUrl: 'http://localhost:3000/pet/coco',
      scanCount: 8,
    },
  });

  const maxPet = await prisma.pet.upsert({
    where: { publicId: 'max' },
    update: {},
    create: {
      publicId: 'max',
      userId: owner.id,
      name: 'Max',
      species: 'Dog',
      breed: 'Labrador Retriever',
      gender: 'Male',
      dob: new Date('2023-11-20'),
      color: 'Black',
      weight: '32 kg',
      microchipId: '988 000 555 444 333',
      photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=600&fit=crop',
      isLost: false,
      importantNotes: 'High energy lab. Extremely friendly.',
    },
  });

  await prisma.privacySetting.create({
    data: {
      petId: maxPet.id,
    },
  });

  await prisma.qRCode.create({
    data: {
      petId: maxPet.id,
      qrCodeUrl: 'http://localhost:3000/pet/max',
      scanCount: 14,
    },
  });

  console.log('Database successfully seeded with Bruno, Coco, and Max!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
