import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db, ensureTablesExist } from '@/lib/db';
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

    // 0. Ensure physical database tables (User, Pet, etc.) exist before first registration query
    await ensureTablesExist();

    // 1. Check duplicate account
    let existingUser = null;
    try {
      existingUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (err: any) {
      console.warn('User query exception on first registration, proceeding with table creation:', err?.message);
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in instead.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const publicId = `${cleanPetName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.random().toString(36).substring(2, 6)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Extract real client IP and User-Agent from request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'Unknown Device / Web Browser';

    // 2. Atomic Database Transaction for User, Pet, Privacy, QR Code, and AuditLog
    const result = await db.$transaction(async (tx) => {
      // Create User
      const newUser = await tx.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          phone: cleanPhone,
          role: 'USER',
        },
      });

      // Create Primary Pet Profile
      const newPet = await tx.pet.create({
        data: {
          publicId,
          userId: newUser.id,
          name: cleanPetName,
          species: cleanSpecies,
          breed: cleanBreed,
          gender: 'Male',
          photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
          isLost: false,
          importantNotes: `${cleanPetName} is friendly and loves people!`,
        },
      });

      // Create Privacy Setting
      await tx.privacySetting.create({
        data: { petId: newPet.id },
      });

      // Create QR Code Record
      await tx.qRCode.create({
        data: {
          petId: newPet.id,
          qrCodeUrl: `${appUrl}/pet/${publicId}`,
          scanCount: 0,
        },
      });

      // Log Security Audit Event
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'REGISTER_SUCCESS',
          entity: 'USER',
          entityId: newUser.id,
          details: `Account registered for ${cleanEmail} with pet ${cleanPetName}`,
        },
      });

      // Log Login Event
      await tx.loginLog.create({
        data: {
          userId: newUser.id,
          userEmail: cleanEmail,
          userName: cleanName,
          ip: clientIp,
          device: userAgent.slice(0, 50),
          city: 'Hyderabad',
          country: 'India',
        },
      });

      return { user: newUser, pet: newPet };
    });

    // 3. Sign JWT Session Token
    const token = signToken({
      userId: result.user.id,
      email: cleanEmail,
      role: 'USER',
      name: cleanName,
      phone: cleanPhone,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        role: 'USER',
      },
      pet: result.pet,
    });

    // Set Session & Active Pet Cookies
    response.headers.append(
      'Set-Cookie',
      `puppy_token=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );
    response.headers.append(
      'Set-Cookie',
      `puppy_active_pet_id=${result.pet.id}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax`
    );

    return response;
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Unable to complete account registration. Please check inputs and try again.' },
      { status: 500 }
    );
  }
}
