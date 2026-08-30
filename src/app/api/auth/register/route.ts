import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, phone, petName, breed, species } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name).trim();
    const cleanPhone = phone ? String(phone).trim() : '+91 98765 43210';
    const cleanPetName = petName ? String(petName).trim() : 'My Puppy';
    const cleanBreed = breed ? String(breed).trim() : 'Golden Retriever';
    const cleanSpecies = species ? String(species).trim() : 'Dog';

    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create User
    const user = await db.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        phone: cleanPhone,
        role: 'USER',
      },
    });

    // 2. Automatically Create Primary Pet Profile for New User
    const publicId = `${cleanPetName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
    const pet = await db.pet.create({
      data: {
        publicId,
        userId: user.id,
        name: cleanPetName,
        species: cleanSpecies,
        breed: cleanBreed,
        gender: 'Male',
        photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
        isLost: false,
        importantNotes: `${cleanPetName} is friendly and loves people!`,
      },
    });

    // 3. Create Privacy Setting for Pet
    await db.privacySetting.create({
      data: { petId: pet.id },
    });

    // 4. Create QR Code Record for Pet
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await db.qRCode.create({
      data: {
        petId: pet.id,
        qrCodeUrl: `${appUrl}/pet/${publicId}`,
        scanCount: 0,
      },
    });

    // 5. Sign JWT Token
    const token = signToken({
      userId: user.id,
      email: cleanEmail,
      role: 'USER',
      name: cleanName,
      phone: cleanPhone,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        role: 'USER',
      },
      pet,
    });

    response.headers.set(
      'Set-Cookie',
      `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
